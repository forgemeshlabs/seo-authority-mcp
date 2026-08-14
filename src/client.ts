import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

type Args = Record<string, unknown>;
type RequestSpec = { path: string; method?: "GET" | "POST"; body?: Args };

const configuredBase = (process.env.SEO_API_BASE || "https://seo.forgemesh.io").replace(/\/+$/, "");
const parsedBase = new URL(configuredBase);
if (parsedBase.protocol !== "https:") throw new Error("SEO_API_BASE must use HTTPS");
if (parsedBase.hostname !== "seo.forgemesh.io" && process.env.SEO_ALLOW_CUSTOM_API_BASE !== "true") {
  throw new Error("Custom SEO_API_BASE requires SEO_ALLOW_CUSTOM_API_BASE=true");
}
const API_BASE = parsedBase.toString().replace(/\/$/, "");
const timeoutMs = Math.max(1_000, Math.min(120_000, Number(process.env.SEO_REQUEST_TIMEOUT_MS || 30_000)));
const maxAtomic = BigInt(Math.round(Number(process.env.SEO_MAX_PAYMENT_USDC || "0.15") * 1_000_000));

function encodeQuery(path: string, params: Record<string, string>) {
  const url = new URL(path, `${API_BASE}/`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

export function requestForTool(name: string, args: Args): RequestSpec {
  switch (name) {
    case "get_seo_capabilities": return { path: "/capabilities" };
    case "get_domain_authority": return { path: encodeQuery("/v1/domain-authority", { domain: String(args.domain) }) };
    case "compare_domain_authority": return { path: "/v1/authority-compare", method: "POST", body: { domains: args.domains } };
    case "score_page_seo": return { path: "/v1/url-seo-score", method: "POST", body: { url: args.url, html: args.html } };
    case "correct_seo_query": return { path: encodeQuery("/v1/query-correct", { q: String(args.query) }) };
    case "expand_seo_query": return { path: encodeQuery("/v1/query-expand", { q: String(args.query) }) };
    case "find_keyword_opportunities": return { path: "/v1/keyword-opportunity", method: "POST", body: args };
    case "find_competitor_content_gaps": return { path: "/v1/competitor-gap", method: "POST", body: args };
    case "create_seo_content_brief": return { path: "/v1/content-brief", method: "POST", body: args };
    case "audit_site_seo": return { path: "/v1/site-audit", method: "POST", body: args };
    case "find_internal_link_opportunities": return { path: "/v1/internal-link-opportunities", method: "POST", body: args };
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

function parseChallenge(response: Response, body: unknown) {
  const raw = response.headers.get("payment-required");
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, "base64").toString("utf8")); } catch { return body; }
}

function safeChallenge(challenge: any) {
  const accept = challenge?.accepts?.[0] || {};
  const amount = String(accept.amount || "0");
  return { payment_required: true, amount_usdc: /^\d+$/.test(amount) ? Number(amount) / 1_000_000 : null, network: accept.network || null, pay_to: accept.payTo || null, scheme: accept.scheme || null, resource: challenge?.resource?.url || null, next_step: "Set SEO_X402_PRIVATE_KEY to let this MCP settle automatically, or pay the challenge with another x402 client." };
}

function findTx(value: unknown): string | null {
  if (typeof value === "string" && /^0x[a-fA-F0-9]{64}$/.test(value)) return value;
  if (!value || typeof value !== "object") return null;
  for (const item of Object.values(value)) { const found = findTx(item); if (found) return found; }
  return null;
}

function init(spec: RequestSpec, extraHeaders: Record<string, string> = {}): RequestInit {
  return { method: spec.method || "GET", headers: { accept: "application/json", ...extraHeaders, ...(spec.body ? { "content-type": "application/json" } : {}) }, ...(spec.body ? { body: JSON.stringify(spec.body) } : {}), signal: AbortSignal.timeout(timeoutMs) };
}

export async function callSeoTool(name: string, args: Args): Promise<unknown> {
  const spec = requestForTool(name, args);
  const url = `${API_BASE}${spec.path}`;
  const challengeResponse = await fetch(url, init(spec));
  const challengeBody = await challengeResponse.clone().json().catch(() => null);
  if (challengeResponse.status !== 402) {
    if (!challengeResponse.ok) throw new Error(`SEO API ${challengeResponse.status}: ${JSON.stringify(challengeBody).slice(0, 300)}`);
    return challengeBody;
  }
  const challenge = parseChallenge(challengeResponse, challengeBody);
  const privateKey = process.env.SEO_X402_PRIVATE_KEY;
  if (!privateKey) return safeChallenge(challenge);
  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) throw new Error("SEO_X402_PRIVATE_KEY must be a 32-byte hex private key");
  const amount = BigInt(challenge?.accepts?.[0]?.amount || 0);
  if (amount <= 0n || amount > maxAtomic) throw new Error(`Payment exceeds SEO_MAX_PAYMENT_USDC (${Number(maxAtomic) / 1_000_000})`);
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const httpClient = new x402HTTPClient(new x402Client().register("eip155:*", new ExactEvmScheme(toClientEvmSigner(account))));
  const required = httpClient.getPaymentRequiredResponse(header => challengeResponse.headers.get(header), challengeBody);
  const payload = await httpClient.createPaymentPayload(required);
  const paid = await fetch(url, init(spec, httpClient.encodePaymentSignatureHeader(payload)));
  const paidBody = await paid.json().catch(() => null);
  if (!paid.ok) throw new Error(`Paid SEO API ${paid.status}: ${JSON.stringify(paidBody).slice(0, 300)}`);
  const receipt = httpClient.getPaymentSettleResponse(header => paid.headers.get(header));
  const transaction = findTx(receipt);
  if (!transaction) throw new Error("Facilitator returned no settlement transaction hash");
  return { ...paidBody, x402_settlement: { amount_usdc: Number(amount) / 1_000_000, network: challenge?.accepts?.[0]?.network, transaction } };
}

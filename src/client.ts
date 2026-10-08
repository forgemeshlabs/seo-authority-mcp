import { createRequire } from "node:module";
import { x402Client, x402HTTPClient } from "@x402/core/client";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { toClientEvmSigner } from "@x402/evm";
import { privateKeyToAccount } from "viem/accounts";

// x402-guard is vendored plain CommonJS at the package root (shipped via package.json "files").
const { createGuard } = createRequire(import.meta.url)("../x402-guard.cjs");

type Args = Record<string, unknown>;
type RequestSpec = { path: string; method?: "GET" | "POST"; body?: Args };

const guard = createGuard({
  baseUrl: "https://seo.forgemesh.io",
  payTo: ["0xCc73d69a4D04fA41Afa3727C45140d51D71F615c"],
  maxPriceUsd: 0.15, // highest listed tool price
  sessionBudgetUsd: 10
});

const MAX_TEXT = 2_000;
const MAX_HTML = 524_288;

function fail(field: string, why: string): never {
  throw new Error(`Invalid argument "${field}": ${why}`);
}
function str(field: string, v: unknown, max = MAX_TEXT, optional = false): string | undefined {
  if (v === undefined && optional) return undefined;
  if (typeof v !== "string" || v.length === 0) fail(field, "must be a non-empty string");
  if (v.length > max) fail(field, `must be at most ${max} characters`);
  return v;
}
function domainLike(field: string, v: unknown): string {
  const s = str(field, v) as string;
  if (/\s/.test(s)) fail(field, "must not contain whitespace");
  return s;
}
function httpsUrl(field: string, v: unknown): string {
  const s = str(field, v) as string;
  let u: URL;
  try { u = new URL(s); } catch { return fail(field, "must be an absolute https URL"); }
  if (u.protocol !== "https:") fail(field, "must be an absolute https URL");
  return s;
}
function list(field: string, v: unknown, min: number, max: number): unknown[] {
  if (!Array.isArray(v)) fail(field, "must be an array");
  if (v.length < min || v.length > max) fail(field, `must contain ${min} to ${max} items`);
  return v;
}
function obj(field: string, v: unknown): Args {
  if (!v || typeof v !== "object" || Array.isArray(v)) fail(field, "must be an object");
  return v as Args;
}
function page(field: string, v: unknown, requireHtml = false) {
  const p = obj(field, v);
  return {
    url: httpsUrl(`${field}.url`, p.url),
    title: str(`${field}.title`, p.title, MAX_TEXT, true),
    text: str(`${field}.text`, p.text, MAX_HTML, true),
    html: requireHtml ? str(`${field}.html`, p.html, MAX_HTML) : str(`${field}.html`, p.html, MAX_HTML, true)
  };
}
function pages(field: string, v: unknown, min: number, requireHtml = false) {
  return list(field, v, min, 50).map((p, i) => page(`${field}[${i}]`, p, requireHtml));
}
function optPages(field: string, v: unknown) {
  return v === undefined ? undefined : pages(field, v, 0);
}

function encodeQuery(path: string, params: Record<string, string>) {
  const url = new URL(path, "https://seo.forgemesh.io/");
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

// Validates every argument before any network call and forwards only known fields.
export function requestForTool(name: string, args: Args): RequestSpec {
  switch (name) {
    case "get_seo_capabilities": return { path: "/capabilities" };
    case "get_domain_authority": return { path: encodeQuery("/v1/domain-authority", { domain: domainLike("domain", args.domain) }) };
    case "compare_domain_authority": return { path: "/v1/authority-compare", method: "POST", body: { domains: list("domains", args.domains, 2, 20).map((d, i) => domainLike(`domains[${i}]`, d)) } };
    case "score_page_seo": return { path: "/v1/url-seo-score", method: "POST", body: { url: httpsUrl("url", args.url), html: str("html", args.html, MAX_HTML) } };
    case "correct_seo_query": return { path: encodeQuery("/v1/query-correct", { q: str("query", args.query) as string }) };
    case "expand_seo_query": return { path: encodeQuery("/v1/query-expand", { q: str("query", args.query) as string }) };
    case "find_keyword_opportunities": {
      const score = args.domain_authority_score;
      if (score !== undefined && (typeof score !== "number" || !Number.isFinite(score) || score < 0 || score > 100)) fail("domain_authority_score", "must be a number from 0 to 100");
      return { path: "/v1/keyword-opportunity", method: "POST", body: { seed: str("seed", args.seed), audience: str("audience", args.audience, MAX_TEXT, true), domain_authority_score: score as number | undefined } };
    }
    case "find_competitor_content_gaps": {
      const site = obj("site", args.site);
      return { path: "/v1/competitor-gap", method: "POST", body: {
        site: { domain: domainLike("site.domain", site.domain), pages: pages("site.pages", site.pages, 1) },
        competitors: list("competitors", args.competitors, 1, 10).map((c, i) => {
          const comp = obj(`competitors[${i}]`, c);
          return { domain: domainLike(`competitors[${i}].domain`, comp.domain), pages: pages(`competitors[${i}].pages`, comp.pages, 1) };
        })
      } };
    }
    case "create_seo_content_brief": return { path: "/v1/content-brief", method: "POST", body: { keyword: str("keyword", args.keyword), competitor_pages: optPages("competitor_pages", args.competitor_pages), site_pages: optPages("site_pages", args.site_pages) } };
    case "audit_site_seo": return { path: "/v1/site-audit", method: "POST", body: { pages: pages("pages", args.pages, 1, true) } };
    case "find_internal_link_opportunities": return { path: "/v1/internal-link-opportunities", method: "POST", body: { domain: domainLike("domain", args.domain), pages: pages("pages", args.pages, 2) } };
    default: throw new Error(`Unknown tool: ${name}`);
  }
}

function parseChallenge(headers: Headers, body: unknown) {
  const raw = headers.get("payment-required");
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

function parseBody(text: string) {
  try { return JSON.parse(text); } catch { return null; }
}

export async function callSeoTool(name: string, args: Args): Promise<unknown> {
  const spec = requestForTool(name, args);
  const headers = { accept: "application/json" };
  const first = await guard.fetchBounded(spec.path, { method: spec.method || "GET", headers: { ...headers, ...(spec.body ? { "content-type": "application/json" } : {}) }, ...(spec.body ? { body: JSON.stringify(spec.body) } : {}) });
  const firstBody = parseBody(first.text);
  if (first.status !== 402) {
    if (!first.ok) throw new Error(`SEO API ${first.status}: ${first.text.slice(0, 200)}`);
    return firstBody;
  }
  const challenge = parseChallenge(first.headers, firstBody);
  const privateKey = process.env.SEO_X402_PRIVATE_KEY;
  if (!privateKey) return safeChallenge(challenge);
  if (!/^0x[a-fA-F0-9]{64}$/.test(privateKey)) throw new Error("SEO_X402_PRIVATE_KEY must be a 32-byte hex private key");
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const httpClient = new x402HTTPClient(new x402Client().register("eip155:*", new ExactEvmScheme(toClientEvmSigner(account))).registerPolicy(guard.policy));
  const { _payment, ...paidBody } = await guard.callPaid(httpClient, spec.path, { method: spec.method || "GET", body: spec.body, headers });
  const transaction = findTx(_payment);
  if (!transaction) throw new Error("Facilitator returned no settlement transaction hash");
  const amount = BigInt(challenge?.accepts?.[0]?.amount || 0);
  return { ...paidBody, x402_settlement: { amount_usdc: Number(amount) / 1_000_000, network: challenge?.accepts?.[0]?.network, transaction } };
}

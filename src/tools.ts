import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
const string = (description: string) => ({ type: "string", description });
const page = {
  type: "object",
  properties: { url: string("Absolute page URL."), title: string("Page title."), text: string("Visible page text."), html: string("Page HTML, when required.") },
  required: ["url"]
};

export const tools: Tool[] = [
  { name: "get_seo_capabilities", description: "Retrieve free capability, provenance, and unavailable-metric disclosures before choosing a paid SEO tool.", annotations: readOnly, inputSchema: { type: "object", properties: {} } },
  { name: "get_domain_authority", description: "Measure one domain's open-web SEO authority using Common Crawl harmonic centrality and PageRank graph data; costs $0.01 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domain: string("Domain or URL to measure, such as example.com.") }, required: ["domain"] } },
  { name: "compare_domain_authority", description: "Compare open-web SEO authority for 2 to 20 domains and rank the results; costs $0.02 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domains: { type: "array", description: "Two to twenty domains or URLs.", minItems: 2, maxItems: 20, items: { type: "string" } } }, required: ["domains"] } },
  { name: "score_page_seo", description: "Score supplied page HTML for deterministic on-page SEO checks without claiming page authority; costs $0.01 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { url: string("Canonical URL for the supplied page."), html: string("Complete page HTML, up to 512 KB.") }, required: ["url", "html"] } },
  { name: "correct_seo_query", description: "Correct likely spelling errors in an SEO search query; costs $0.005 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { query: string("SEO query to correct.") }, required: ["query"] } },
  { name: "expand_seo_query", description: "Generate deterministic long-tail and intent-oriented variants of an SEO query; costs $0.01 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { query: string("Seed SEO query to expand.") }, required: ["query"] } },
  { name: "find_keyword_opportunities", description: "Generate and prioritize long-tail keyword opportunities without fabricating volume, CPC, SERP, or difficulty metrics; costs $0.05 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { seed: string("Seed topic or keyword."), audience: string("Optional target audience."), domain_authority_score: { type: "number", minimum: 0, maximum: 100, description: "Optional known authority score used for prioritization." } }, required: ["seed"] } },
  {
    name: "find_competitor_content_gaps",
    description: "Find content gaps from customer-supplied site and competitor pages without claiming live SERP verification; costs $0.10 USDC.",
    annotations: readOnly,
    inputSchema: {
      type: "object",
      properties: {
        site: {
          type: "object",
          description: "Your domain and supplied pages.",
          properties: {
            domain: string("Your domain."),
            pages: { type: "array", minItems: 1, maxItems: 50, items: page }
          },
          required: ["domain", "pages"]
        },
        competitors: {
          type: "array",
          description: "One to ten competitors with supplied pages.",
          minItems: 1,
          maxItems: 10,
          items: {
            type: "object",
            properties: {
              domain: string("Competitor domain."),
              pages: { type: "array", minItems: 1, maxItems: 50, items: page }
            },
            required: ["domain", "pages"]
          }
        }
      },
      required: ["site", "competitors"]
    }
  },
  { name: "create_seo_content_brief", description: "Create an evidence-tagged SEO content brief from a keyword and supplied competitor or site pages; costs $0.10 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { keyword: string("Primary keyword or topic."), competitor_pages: { type: "array", maxItems: 50, items: page, description: "Optional competitor pages providing evidence." }, site_pages: { type: "array", maxItems: 50, items: page, description: "Optional existing site pages for differentiation and linking." } }, required: ["keyword"] } },
  { name: "audit_site_seo", description: "Audit supplied page HTML for on-page, duplication, and internal-link problems; costs $0.15 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { pages: { type: "array", minItems: 1, maxItems: 50, description: "Pages to audit; each requires url and html.", items: { ...page, required: ["url", "html"] } } }, required: ["pages"] } },
  { name: "find_internal_link_opportunities", description: "Find missing contextually relevant internal links across supplied pages; costs $0.05 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domain: string("Site domain."), pages: { type: "array", minItems: 2, maxItems: 50, items: page, description: "Two or more site pages with title and text for best results." } }, required: ["domain", "pages"] } }
];

export const paidToolNames = new Set(tools.slice(1).map(tool => tool.name));

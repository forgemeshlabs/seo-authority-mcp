import type { Tool } from "@modelcontextprotocol/sdk/types.js";

const readOnly = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;
const string = (description: string, maxLength = 2000) => ({ type: "string", maxLength, description });
const page = {
  type: "object",
  properties: { url: string("Absolute page URL."), title: string("Page title."), text: string("Visible page text.", 524288), html: string("Page HTML, when required.", 524288) },
  required: ["url"]
};

export const tools: Tool[] = [
  { name: "get_seo_capabilities", description: "Retrieve free capability, provenance, and unavailable-metric disclosures before choosing a paid SEO tool.", annotations: readOnly, inputSchema: { type: "object", properties: {} } },
  { name: "get_domain_authority", description: "Measure one domain's open-web SEO authority from a periodic Common Crawl Web Graph snapshot (harmonic centrality weight 0.65, PageRank 0.35): returns domain_authority_score 0-100, authority_percentile and the graph release and crawl period. Not live data. Answers 404 domain_not_covered, uncharged, when the domain is not in the graph; costs $0.01 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domain: string("Domain or URL to measure, such as example.com.") }, required: ["domain"] } },
  { name: "compare_domain_authority", description: "Compare open-web SEO authority for 2 to 20 domains from a periodic Common Crawl Web Graph snapshot, ranked by domain_authority_score; a domain missing from the graph comes back found=false, and 404 no_domain_covered (uncharged) when none is in the graph; costs $0.02 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domains: { type: "array", description: "Two to twenty domains or URLs.", minItems: 2, maxItems: 20, items: { type: "string", maxLength: 2000 } } }, required: ["domains"] } },
  { name: "score_page_seo", description: "Score the page HTML you supply (nothing is fetched) with 7 deterministic on-page checks: title present, title length, meta description, canonical, exactly one H1, structured data, image alt text. Returns url_seo_score 0-100 and per-check booleans; no authority or backlink data; costs $0.01 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { url: string("Canonical URL for the supplied page."), html: string("Complete page HTML, up to 512 KB.", 524288) }, required: ["url", "html"] } },
  {
    name: "find_competitor_content_gaps",
    description: "Find content gaps from the site and competitor pages you supply (up to 50 pages per site, up to 10 competitors). Returns content_gaps with topic, competitor_coverage, competitor_share and priority, plus evidence and limitations; no live SERP, no backlink index; costs $0.10 USDC.",
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
  { name: "create_seo_content_brief", description: "Create an SEO content brief measured from competitor pages you supply: supporting_terms with counts, observed_word_count (minimum, median, maximum), internal_link_targets, a rule-based search_intent and a fixed six-section outline. Requires 1 to 20 competitor_pages; answers 422, uncharged, without usable pages; no live SERP; costs $0.10 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { keyword: string("Primary keyword or topic."), competitor_pages: { type: "array", minItems: 1, maxItems: 20, items: page, description: "One to twenty competitor pages (url, title, and text or html)." }, site_pages: { type: "array", maxItems: 50, items: page, description: "Optional existing site pages for differentiation and linking." } }, required: ["keyword", "competitor_pages"] } },
  { name: "audit_site_seo", description: "Audit 1 to 50 pages of HTML you supply (nothing is crawled). Returns site_seo_score, per-page url_seo_score with on-page checks, extracted values and links, and issues: duplicate_titles and orphan_pages; costs $0.15 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { pages: { type: "array", minItems: 1, maxItems: 50, description: "Pages to audit; each requires url and html.", items: { ...page, required: ["url", "html"] } } }, required: ["pages"] } },
  { name: "find_internal_link_opportunities", description: "Find missing internal links across 1 to 50 pages you supply: returns opportunities with source_url, target_url, relevance and suggested_anchor for contextually related pages that do not link to each other; costs $0.05 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domain: string("Site domain."), pages: { type: "array", minItems: 1, maxItems: 50, items: page, description: "One to fifty site pages with title and text for best results." } }, required: ["domain", "pages"] } },
  { name: "vet_placement", description: "Vet a directory, publication or sponsor pitch before paying for a listing: domain age from RDAP, Tranco popularity rank, Google News presence, outbound-link dilution and rel=sponsored use on a sample page, badge and pay-to-play wording; returns a rule-based 0-100 score, verdict, red_flags and positives; an unreadable source is marked unavailable and does not move the score; not charged if the domain does not resolve or no source answers; costs $0.05 USDC.", annotations: readOnly, inputSchema: { type: "object", properties: { domain: string("Domain of the directory or publication, such as example.com."), sample_url: string("Optional listing or article URL on the same domain to inspect for outbound links and sponsored markup.") }, required: ["domain"] } }
];

export const paidToolNames = new Set(tools.slice(1).map(tool => tool.name));

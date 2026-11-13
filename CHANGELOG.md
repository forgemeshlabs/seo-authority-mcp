# Changelog

## 0.2.0 - 2026-11-13

- Tool text and schemas refreshed to the live service contract (route integrity pass). Removed `correct_seo_query`, `expand_seo_query` and `find_keyword_opportunities`: the service de-listed those routes on 2026-11-12 (503, never charged).
- `create_seo_content_brief` now requires 1 to 20 `competitor_pages` (was optional, up to 50). `find_internal_link_opportunities` accepts 1 to 50 pages (was 2 to 50).
- Descriptions now quote the live responses: Common Crawl snapshot (not live) for authority, `found=false` for domains missing from the graph, the seven on-page checks, uncharged 404/422 refusals.
- Errors now carry the service's HTTP `status`, `charged` flag and `upstream` body instead of a truncated string.

## 0.1.5 - 2026-10-26

- Dependency security release, no functional change: body-parser 2.4.0, fast-uri 3.1.9, ip-address 10.7.5, zod pinned to 4.6.x via overrides (GHSA-27r3-jxmh-p828, GHSA-mrhx-c7xc-m3w5, GHSA-rxp7-6hxx-x8q5, fast-uri advisories).


## 0.1.4 - 2026-10-20

- Added `vet_placement`: score a directory, publication or sponsor pitch before paying for a listing (RDAP domain age, Tranco rank, Google News presence, outbound-link dilution, badge and pay-to-play signals). $0.05 USDC.

## 0.1.0 - 2026-08-14

- Initial MCP release with ten paid SEO tools and one free capabilities tool.
- Added optional automatic x402 USDC settlement on Base.
- Added Docker, Glama, Smithery, and official MCP registry metadata.

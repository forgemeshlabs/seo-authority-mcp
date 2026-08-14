# SEO Authority MCP

[![MCP Server](https://glama.ai/mcp/servers/forgemeshlabs/seo-authority-mcp/badges/card.svg)](https://glama.ai/mcp/servers/forgemeshlabs/seo-authority-mcp)

Give AI agents typed SEO authority, keyword, competitor, content, audit, and internal-link tools backed by [seo.forgemesh.io](https://seo.forgemesh.io). Authority scores use open Common Crawl graph data. The server does not invent search volume, CPC, live SERP positions, complete backlinks, or Google metrics.

## Install

```bash
npx -y @forgemeshlabs/seo-authority-mcp
```

## Claude Desktop

Challenge-only mode—safe default, never spends:

```json
{
  "mcpServers": {
    "seo-authority": {
      "command": "npx",
      "args": ["-y", "@forgemeshlabs/seo-authority-mcp"]
    }
  }
}
```

Automatic x402 settlement:

```json
{
  "mcpServers": {
    "seo-authority": {
      "command": "npx",
      "args": ["-y", "@forgemeshlabs/seo-authority-mcp"],
      "env": {
        "SEO_X402_PRIVATE_KEY": "YOUR_DEDICATED_LOW_BALANCE_WALLET_KEY",
        "SEO_MAX_PAYMENT_USDC": "0.15"
      }
    }
  }
}
```

Use a dedicated low-balance wallet. Never commit its private key.

## Tools

| MCP tool | Purpose | Price |
|---|---|---:|
| `get_seo_capabilities` | Source and metric disclosures | Free |
| `get_domain_authority` | Common Crawl graph authority | $0.01 |
| `compare_domain_authority` | Compare 2–20 domains | $0.02 |
| `score_page_seo` | Deterministic on-page checks | $0.01 |
| `correct_seo_query` | Did-you-mean correction | $0.005 |
| `expand_seo_query` | Long-tail query variants | $0.01 |
| `find_keyword_opportunities` | Prioritized keyword ideas | $0.05 |
| `find_competitor_content_gaps` | Supplied-content gap analysis | $0.10 |
| `create_seo_content_brief` | Evidence-tagged brief | $0.10 |
| `audit_site_seo` | Multi-page SEO audit | $0.15 |
| `find_internal_link_opportunities` | Contextual internal links | $0.05 |

Paid tools use exact USDC settlement on Base. Without `SEO_X402_PRIVATE_KEY`, each tool returns price, network, receiver, and retry guidance instead of spending.

## Docker

```bash
docker build -t seo-authority-mcp:0.1.0 .
docker run --rm -i --read-only --cap-drop=ALL seo-authority-mcp:0.1.0
```

For automatic payment, pass the private key at runtime using your secret manager. Do not bake it into the image.

## Environment

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SEO_X402_PRIVATE_KEY` | No | unset | Enables automatic payment |
| `SEO_MAX_PAYMENT_USDC` | No | `0.15` | Per-call payment ceiling |
| `SEO_API_BASE` | No | `https://seo.forgemesh.io` | Backend URL |
| `SEO_ALLOW_CUSTOM_API_BASE` | No | `false` | Explicitly allows a custom HTTPS backend |
| `SEO_REQUEST_TIMEOUT_MS` | No | `30000` | Upstream timeout, capped at 120 seconds |

## Links

- API: https://seo.forgemesh.io
- OpenAPI: https://seo.forgemesh.io/openapi.json
- x402 discovery: https://seo.forgemesh.io/.well-known/x402
- Contact: clawdbotworker@gmail.com

## License

MIT

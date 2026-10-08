# SEO Authority MCP

[![M8ven Verified](https://m8ven.ai/badge/mcp/forgemeshlabs-seo-authority-mcp-9niona?variant=verified)](https://m8ven.ai/mcp/forgemeshlabs-seo-authority-mcp-9niona)

[![MCP Server](https://glama.ai/mcp/servers/forgemeshlabs/seo-authority-mcp/badges/card.svg)](https://glama.ai/mcp/servers/forgemeshlabs/seo-authority-mcp)
[![mcpservers.org](https://mcpservers.org/badge.svg)](https://mcpservers.org/servers/forgemeshlabs/seo-authority-mcp)

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
        "SEO_X402_PRIVATE_KEY": "YOUR_DEDICATED_LOW_BALANCE_WALLET_KEY"
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
docker build -t seo-authority-mcp:0.1.2 .
docker run --rm -i --read-only --cap-drop=ALL seo-authority-mcp:0.1.2
```

For automatic payment, pass the private key at runtime using your secret manager. Do not bake it into the image.

## Environment

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `SEO_X402_PRIVATE_KEY` | No | unset | Enables automatic payment |
| `X402_MAX_PRICE_USD` | No | `0.15` | Per-call payment ceiling; can only LOWER the built-in cap |
| `X402_SESSION_BUDGET_USD` | No | `10` | Cumulative per-process ceiling; can only LOWER the built-in cap |

The backend is fixed to `https://seo.forgemesh.io`. The server refuses to sign for any payee other than the ForgeMesh SEO wallet, any network other than Base mainnet, any asset other than USDC, or any amount over the cap. Requests are same-origin, time-limited (60s), size-capped (2 MB) and never follow redirects. Tool arguments are validated before any network call. Use a dedicated, low-balance wallet.

## Links

- API: https://seo.forgemesh.io
- OpenAPI: https://seo.forgemesh.io/openapi.json
- x402 discovery: https://seo.forgemesh.io/.well-known/x402
- Contact: clawdbotworker@gmail.com

## License

MIT

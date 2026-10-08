# SEO Authority MCP for Glama

Canonical MCP server: `seo-authority-mcp`

Use this repository's Dockerfile in the Glama Dockerfile admin page:

```text
https://glama.ai/mcp/servers/forgemeshlabs/seo-authority-mcp/admin/dockerfile
```

Build steps:

```json
["npm ci", "npm run build", "npm prune --omit=dev"]
```

Command arguments:

```json
["node", "dist/index.js"]
```

Environment schema:

```json
{
  "type": "object",
  "properties": {
    "SEO_X402_PRIVATE_KEY": { "type": "string", "description": "Optional secret EVM private key for automatic payment." }
  },
  "required": []
}
```

Runtime notes:

- Transport: stdio; no inbound port.
- Node.js 22 or newer.
- Without a private key, paid tools return structured x402 challenge metadata and spend nothing.
- With a private key, the MCP settles exact USDC payments on Base and requires a non-empty transaction hash.
- The backend is hard-coded to `seo.forgemesh.io`.
- Each automatic settlement is capped at $0.15 (covers every current tool) and $10 per session; `X402_MAX_PRICE_USD` / `X402_SESSION_BUDGET_USD` can only lower these.

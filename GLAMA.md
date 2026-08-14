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
    "SEO_API_BASE": { "type": "string", "default": "https://seo.forgemesh.io" },
    "SEO_X402_PRIVATE_KEY": { "type": "string", "description": "Optional secret EVM private key for automatic payment." },
    "SEO_MAX_PAYMENT_USDC": { "type": "string", "default": "0.15" }
  },
  "required": []
}
```

Runtime notes:

- Transport: stdio; no inbound port.
- Node.js 22 or newer.
- Without a private key, paid tools return structured x402 challenge metadata and spend nothing.
- With a private key, the MCP settles exact USDC payments on Base and requires a non-empty transaction hash.
- The default backend allowlist contains only `seo.forgemesh.io`.
- `SEO_MAX_PAYMENT_USDC` limits each automatic settlement; default `0.15` covers every current tool.

#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { createRequire } from "node:module";
import { callSeoTool } from "./client.js";
import { tools } from "./tools.js";

const { version } = createRequire(import.meta.url)("../package.json") as { version: string };
const server = new Server({ name: "seo-authority-mcp", version }, { capabilities: { tools: {} } });
server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
server.setRequestHandler(CallToolRequestSchema, async request => {
  try {
    const data = await callSeoTool(request.params.name, (request.params.arguments || {}) as Record<string, unknown>);
    return { content: [{ type: "text", text: JSON.stringify(data) }] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    const e = error as { status?: number; charged?: boolean; upstream?: unknown };
    const detail = { ...(e.status !== undefined ? { status: e.status } : {}), ...(e.charged !== undefined ? { charged: e.charged } : {}), ...(e.upstream !== undefined ? { upstream: e.upstream, untrusted: true } : {}) };
    return { content: [{ type: "text", text: JSON.stringify({ error: { code: "SEO_TOOL_ERROR", message, ...detail } }) }], isError: true };
  }
});

await server.connect(new StdioServerTransport());

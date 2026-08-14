import { describe, expect, it } from "vitest";
import { paidToolNames, tools } from "../src/tools.js";
import { requestForTool } from "../src/client.js";

describe("MCP contracts", () => {
  it("exposes ten paid tools and one free capability tool", () => {
    expect(tools).toHaveLength(11);
    expect(paidToolNames.size).toBe(10);
  });

  it("uses unique lowercase snake_case names", () => {
    const names = tools.map(tool => tool.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(name).toMatch(/^[a-z0-9_]{3,64}$/);
  });

  it("has valid object schemas and descriptions", () => {
    for (const tool of tools) {
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.inputSchema.type).toBe("object");
      for (const required of tool.inputSchema.required || []) expect(tool.inputSchema.properties).toHaveProperty(required);
    }
  });

  it("maps tools to the expected API routes", () => {
    expect(requestForTool("get_domain_authority", { domain: "example.com" }).path).toContain("/v1/domain-authority");
    expect(requestForTool("audit_site_seo", { pages: [] }).path).toBe("/v1/site-audit");
    expect(() => requestForTool("not_a_tool", {})).toThrow(/Unknown tool/);
  });
});

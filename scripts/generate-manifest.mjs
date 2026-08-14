import { writeFile } from "node:fs/promises";
import { tools } from "../dist/tools.js";

const manifest = {
  server: "seo-authority-mcp",
  version: "0.1.0",
  source: "https://seo.forgemesh.io/openapi.json",
  tools
};

await writeFile(new URL("../tool_manifest.json", import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);

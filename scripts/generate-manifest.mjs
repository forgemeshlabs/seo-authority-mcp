import { readFile, writeFile } from "node:fs/promises";
import { tools } from "../dist/tools.js";

const { version } = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));

const manifest = {
  server: "seo-authority-mcp",
  version,
  source: "https://seo.forgemesh.io/openapi.json",
  tools
};

await writeFile(new URL("../tool_manifest.json", import.meta.url), `${JSON.stringify(manifest, null, 2)}\n`);

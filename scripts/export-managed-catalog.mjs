import { readFile, writeFile, rename, rm } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { managedPublicIndex } from "../lib/managed-catalog.mjs";
import { checkedManagedRelease } from "./lib/managed-release.mjs";

// This endpoint exposes only approved publications and uses the public key.
// A CI publisher never needs the Supabase service-role key.
const endpoint = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || "https://missing.invalid");
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (endpoint.protocol !== "https:" || endpoint.pathname !== "/" || endpoint.search || endpoint.hash || endpoint.username || endpoint.password || !key || endpoint.hostname === "missing.invalid") throw new Error("Configure the production Supabase HTTPS URL and public key.");
const response = await fetch(new URL("/rest/v1/rpc/public_catalog_snapshot", endpoint), { method: "POST", headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" }, body: "{}", redirect: "error", signal: AbortSignal.timeout(15000) });
if (!response.ok) throw new Error(`Public catalog export failed (HTTP ${response.status}). Existing files were preserved.`);
if (Number(response.headers.get("content-length")) > 25000000) throw new Error("Catalog export exceeds the release limit.");
let length = 0; const parts = [];
for await (const chunk of response.body) { length += chunk.length; if (length > 25000000) throw new Error("Catalog export exceeds the release limit."); parts.push(chunk); }
const previous = JSON.parse(await readFile("lib/data/managed-catalog.json", "utf8"));
const catalog = checkedManagedRelease(JSON.parse(Buffer.concat(parts).toString("utf8")), previous);
const files = [["lib/data/managed-catalog.json", catalog], ["lib/data/managed-public-index.json", managedPublicIndex(catalog)]];
const temporary = [];
try {
  // Prepare and validate both files before replacing either. CI also verifies
  // their consistency before a commit can be deployed.
  for (const [file, value] of files) { const temp = `${file}.${randomUUID()}.tmp`; temporary.push(temp); await writeFile(temp, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" }); }
  for (let index = 0; index < files.length; index++) await rename(temporary[index], files[index][0]);
} finally { await Promise.all(temporary.map(file => rm(file, { force: true }))); }
console.log(`Prepared approved catalog release ${catalog.revision}: ${catalog.entries.length} records. Review and merge the release PR to deploy.`);

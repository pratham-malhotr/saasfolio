import { readFile, readdir } from "node:fs/promises";
import { isolatedSchemaSql } from "./lib/database-schema.mjs";

const schema = process.argv[2];
if (!schema || process.argv.length !== 3) throw new Error("Usage: node scripts/prepare-database-schema.mjs <new_schema>");
const directory = new URL("../supabase/migrations/", import.meta.url);
const migrations = [];
for (const name of (await readdir(directory)).filter(name => name.endsWith(".sql")).sort()) {
  migrations.push({ name, sql: await readFile(new URL(name, directory), "utf8") });
}
process.stdout.write(isolatedSchemaSql(migrations, schema));

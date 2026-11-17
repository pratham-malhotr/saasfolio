import { createHash } from "node:crypto";
import { databaseSchema } from "../../lib/database-schema.mjs";

export function qualifyApplicationSql(sql, schema) {
  const selected = databaseSchema(schema);
  // Only qualified application objects change. PUBLIC role grants and the
  // project's auth/storage schemas retain their original meaning.
  return sql.replace(/\bpublic\./g, `${selected}.`);
}

/** Atomic first installation; deliberately refuses to reuse an existing schema. */
export function isolatedSchemaSql(migrations, schema) {
  const selected = databaseSchema(schema);
  if (selected === "public") throw new Error("Select a new isolated schema, not public.");
  let sql = `begin;\ncreate schema ${selected};\nrevoke all on schema ${selected} from public;\ngrant usage on schema ${selected} to anon, authenticated, service_role;\n`;
  for (const kind of ["tables", "sequences", "functions"]) {
    sql += `alter default privileges in schema ${selected} revoke all on ${kind} from public, anon, authenticated;\n`;
  }
  sql += `create table ${selected}._schema_migrations (name text primary key, sha256 text not null, applied_at timestamptz not null default now());\nalter table ${selected}._schema_migrations enable row level security;\nrevoke all on ${selected}._schema_migrations from public, anon, authenticated;\ngrant select on ${selected}._schema_migrations to service_role;\n`;
  for (const migration of migrations) {
    if (!/^[a-zA-Z0-9_]+\.sql$/.test(migration.name)) throw new Error("Invalid migration filename.");
    const hash = createHash("sha256").update(migration.sql).digest("hex");
    sql += `\n-- ${migration.name}\n${qualifyApplicationSql(migration.sql, selected)}\ninsert into ${selected}._schema_migrations(name,sha256) values ('${migration.name}','${hash}');\n`;
  }
  return `${sql}\nnotify pgrst, 'reload schema';\ncommit;\n`;
}

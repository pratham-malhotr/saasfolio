/** All application queries use one explicit namespace in a shared project. */
export function databaseSchema(value = process.env.SUPABASE_DB_SCHEMA) {
  const schema = value || "public";
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(schema) || ["auth", "storage", "extensions", "information_schema"].includes(schema) || schema.startsWith("pg_")) {
    throw new Error("SUPABASE_DB_SCHEMA must name an application schema.");
  }
  return schema;
}

import test from "node:test";
import assert from "node:assert/strict";
import { databaseSchema } from "../lib/database-schema.mjs";
import { isolatedSchemaSql, qualifyApplicationSql } from "./lib/database-schema.mjs";

test("schema selection refuses injection and reserved platform namespaces", () => {
  assert.equal(databaseSchema("saasfolio"), "saasfolio");
  for (const value of ["public; drop schema auth", "auth", "storage", "pg_catalog", "two.names"]) assert.throws(() => databaseSchema(value));
});
test("qualified migration changes preserve PUBLIC role revocations and auth references", () => {
  const sql = qualifyApplicationSql("select * from public.inquiries; revoke all on public.inquiries from public, anon; select auth.uid();", "saasfolio");
  assert.equal(sql, "select * from saasfolio.inquiries; revoke all on saasfolio.inquiries from public, anon; select auth.uid();");
  const generated = isolatedSchemaSql([{ name: "001_initial.sql", sql: "create table public.inquiries(id uuid);" }], "saasfolio");
  assert.ok(generated.startsWith("begin;\ncreate schema saasfolio;"));
  assert.ok(!generated.includes("create schema if not exists"));
  assert.match(generated, /revoke all on tables from public, anon, authenticated/);
  assert.match(generated, /_schema_migrations\(name,sha256\)/);
  assert.ok(generated.endsWith("commit;\n"));
  assert.throws(() => isolatedSchemaSql([], "public"));
});

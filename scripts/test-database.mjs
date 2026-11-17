import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { createDatabaseBackup, restoreDatabaseBackup } from "./lib/encrypted-backup.mjs";
import { databaseSchema } from "../lib/database-schema.mjs";
import { qualifyApplicationSql, isolatedSchemaSql } from "./lib/database-schema.mjs";
const schema = databaseSchema(process.env.DATABASE_TEST_SCHEMA || "public");
const qualify = sql => qualifyApplicationSql(sql, schema);
const exec = promisify(execFile);
let directory, started = false;
const env = { ...process.env, PGOPTIONS: "-c statement_timeout=15000" };
async function run(command, args) {
  try { return await exec(command, args, { env, maxBuffer: 2000000 }); }
  catch (error) { throw new Error(`${command} failed: ${(error.stderr || error.message).slice(-2000)}`); }
}
async function sqlFile(path, transform = true) { await run("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-c", transform ? qualify(await readFile(path, "utf8")) : await readFile(path, "utf8")]); }
try {
  if (process.env.DATABASE_TEST_URL) {
    const url = new URL(process.env.DATABASE_TEST_URL);
    assert.ok(["postgres:", "postgresql:"].includes(url.protocol) && ["127.0.0.1", "localhost"].includes(url.hostname) && /^\/saasfolio_test(?:_|$)/.test(url.pathname), "Database tests require an explicitly named local disposable saasfolio_test database");
    Object.assign(env, { PGHOST: url.hostname, PGPORT: url.port || "5432", PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: url.pathname.slice(1) });
  } else {
    directory = await mkdtemp(join(process.platform === "darwin" ? "/private/tmp" : tmpdir(), "saasfolio-db-"));
    await run("initdb", ["-D", join(directory, "data"), "-A", "trust", "-U", "postgres", "--locale=C", "--encoding=UTF8"]);
    await run("pg_ctl", ["-D", join(directory, "data"), "-l", join(directory, "postgres.log"), "-o", `-k ${directory} -h '' -p 5433`, "-w", "start"]);
    started = true;
    Object.assign(env, { PGHOST: directory, PGPORT: "5433", PGUSER: "postgres", PGDATABASE: "postgres" });
    await run("createdb", ["saasfolio_test"]); env.PGDATABASE = "saasfolio_test";
  }
  const existing = await run("psql", ["-X", "-At", "-c", "select count(*) from pg_tables where schemaname in ('public','auth')"]);
  assert.equal(existing.stdout.trim(), "0", "Tests only run against an empty disposable database");
  await sqlFile("supabase/tests/bootstrap.sql", false);
  const migrations = [];
  for (const name of (await readdir("supabase/migrations")).filter(name => name.endsWith(".sql")).sort()) migrations.push({ name, sql: await readFile(`supabase/migrations/${name}`, "utf8") });
  if (schema === "public") {
    for (const migration of migrations) await run("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-c", migration.sql]);
  } else {
    await run("psql", ["-X", "-q", "-c", "create table public.newsletter_subscribers (external_site_data text); insert into public.newsletter_subscribers values ('CircleOfIRA sentinel');"]);
    await run("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-c", isolatedSchemaSql(migrations, schema)]);
    // Test-only helpers are not part of a production installation.
    const bootstrap = await readFile("supabase/tests/bootstrap.sql", "utf8");
    await run("psql", ["-X", "-q", "-c", qualify(bootstrap.slice(bootstrap.indexOf("create function public.test_assert"))) + `grant execute on function ${schema}.test_assert(boolean,text), ${schema}.test_denied(text,text) to anon,authenticated,service_role;`]);
    await assert.rejects(run("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-c", isolatedSchemaSql(migrations, schema)]), /already exists/);
    const untouched = await run("psql", ["-X", "-At", "-c", "select external_site_data from public.newsletter_subscribers"]);
    assert.equal(untouched.stdout.trim(), "CircleOfIRA sentinel");
    console.log("Shared-project installation preserved the other site's same-named table and refused duplicate installation.");
  }
  for (const name of (await readdir("supabase/tests")).filter(name => name.endsWith(".sql") && name !== "bootstrap.sql").sort()) { await sqlFile(`supabase/tests/${name}`); console.log(`${name}: database checks passed`); }
  const submissionKey = randomUUID();
  const intakeSql = qualify(`set role service_role; select public.save_brand_submission('${submissionKey}','test@example.com','{"submissionType":"brand","toolName":"Concurrent disposable test"}','${"c".repeat(64)}')`);
  const receipts = await Promise.all(Array.from({ length: 8 }, () => run("psql", ["-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-c", intakeSql])));
  assert.equal(new Set(receipts.map(result => result.stdout.trim())).size, 1, "Concurrent retries must return one saved reference");
  const count = await run("psql", ["-X", "-qAt", "-c", qualify(`select count(*) from public.inquiries where submission_key='${submissionKey}'`)]);
  assert.equal(count.stdout.trim(), "1", "Concurrent retries must store exactly one record");
  await run("psql", ["-X", "-q", "-c", qualify(`delete from public.inquiries where submission_key='${submissionKey}'`)]);
  console.log("Eight concurrent brand submission retries returned one receipt and retained one private record.");
  const backupDirectory = await mkdtemp(join(tmpdir(), "saasfolio-backup-test-"));
  const restoreName = `saasfolio_restore_test_${randomBytes(6).toString("hex")}`;
  let restoreCreated = false;
  try {
    const file = join(backupDirectory, "database.sfb"); const key = randomBytes(32);
    await createDatabaseBackup({ env, destination: file, key });
    await run("createdb", [restoreName]); restoreCreated = true;
    await restoreDatabaseBackup({ file, key, env: { ...env, PGDATABASE: restoreName } });
    const checked = await exec("psql", ["-X", "-At", "-v", "ON_ERROR_STOP=1", "-c", qualify("select (select count(*) from public.catalog_revisions)=2 and (select count(*) from public.audit_events)>6 and (select relrowsecurity from pg_class where oid='public.saved_items'::regclass) and not has_table_privilege('anon','public.inquiries','SELECT') and (public.platform_readiness()->>'ready')::boolean")], { env: { ...env, PGDATABASE: restoreName } });
    assert.equal(checked.stdout.trim(), "t", "Restoration must retain data, RLS, private-table grants and readiness");
    console.log("Encrypted pg_dump and isolated pg_restore drill passed, including restored data and privileges.");
  } finally {
    if (restoreCreated) await run("dropdb", ["--if-exists", restoreName]);
    await rm(backupDirectory, { recursive: true, force: true });
  }
  console.log("PostgreSQL migrations, privileges, RLS and workflow checks passed. No production database was accessed.");
} finally {
  if (started) { try { await exec("pg_ctl", ["-D", join(directory, "data"), "-m", "fast", "-w", "stop"], { env }); } catch { console.error("Inspect the disposable database process before removing its directory."); started = false; directory = undefined; } }
  if (directory) await rm(directory, { recursive: true, force: true });
}

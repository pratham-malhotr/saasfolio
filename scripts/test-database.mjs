import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { createDatabaseBackup, restoreDatabaseBackup } from "./lib/encrypted-backup.mjs";
const exec = promisify(execFile);
let directory, started = false;
const env = { ...process.env, PGOPTIONS: "-c statement_timeout=15000" };
async function run(command, args) {
  try { return await exec(command, args, { env, maxBuffer: 2000000 }); }
  catch (error) { throw new Error(`${command} failed: ${(error.stderr || error.message).slice(-2000)}`); }
}
async function sqlFile(path) { await run("psql", ["-X", "-q", "-v", "ON_ERROR_STOP=1", "-f", path]); }
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
  await sqlFile("supabase/tests/bootstrap.sql");
  for (const name of (await readdir("supabase/migrations")).filter(name => name.endsWith(".sql")).sort()) await sqlFile(`supabase/migrations/${name}`);
  for (const name of (await readdir("supabase/tests")).filter(name => name.endsWith(".sql") && name !== "bootstrap.sql").sort()) { await sqlFile(`supabase/tests/${name}`); console.log(`${name}: database checks passed`); }
  const backupDirectory = await mkdtemp(join(tmpdir(), "saasfolio-backup-test-"));
  const restoreName = `saasfolio_restore_test_${randomBytes(6).toString("hex")}`;
  let restoreCreated = false;
  try {
    const file = join(backupDirectory, "database.sfb"); const key = randomBytes(32);
    await createDatabaseBackup({ env, destination: file, key });
    await run("createdb", [restoreName]); restoreCreated = true;
    await restoreDatabaseBackup({ file, key, env: { ...env, PGDATABASE: restoreName } });
    const checked = await exec("psql", ["-X", "-At", "-v", "ON_ERROR_STOP=1", "-c", "select (select count(*) from public.catalog_revisions)=2 and (select count(*) from public.audit_events)>6 and (select relrowsecurity from pg_class where oid='public.saved_items'::regclass) and not has_table_privilege('anon','public.inquiries','SELECT') and (public.platform_readiness()->>'ready')::boolean"], { env: { ...env, PGDATABASE: restoreName } });
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

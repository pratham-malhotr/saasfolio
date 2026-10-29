import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import { databaseEnvironment, restoreDatabaseBackup } from "./lib/encrypted-backup.mjs";
const exec = promisify(execFile);
const file = process.argv[2];
assert.ok(file && /^[a-f0-9]{64}$/i.test(process.env.BACKUP_ENCRYPTION_KEY || ""), "Provide a backup path and its encryption key.");
const env = databaseEnvironment(process.env.RESTORE_TEST_URL);
assert.ok(["localhost", "127.0.0.1"].includes(env.PGHOST) && env.PGDATABASE === "postgres", "The drill only connects to the postgres maintenance database on a local disposable server.");
const name = `saasfolio_restore_test_${randomBytes(8).toString("hex")}`;
let created = false;
try {
  await exec("createdb", [name], { env }); created = true;
  await restoreDatabaseBackup({ file, key: Buffer.from(process.env.BACKUP_ENCRYPTION_KEY, "hex"), env: { ...env, PGDATABASE: name } });
  const checks = await exec("psql", ["-X", "-At", "-v", "ON_ERROR_STOP=1", "-c", "select (public.platform_readiness()->>'schemaVersion')::integer>=3 and (public.platform_readiness()->>'ready')::boolean and (select relrowsecurity from pg_class where oid='public.saved_items'::regclass) and not has_table_privilege('anon','public.inquiries','SELECT')"], { env: { ...env, PGDATABASE: name } });
  assert.equal(checks.stdout.trim(), "t", "Restored schema, RLS and inquiry privileges must be valid");
  console.log("Local restore drill passed: authenticated archive, schema readiness, RLS and private-table privileges.");
} finally { if (created) await exec("dropdb", ["--if-exists", name], { env }); }

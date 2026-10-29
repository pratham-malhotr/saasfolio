import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, stat, readdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { randomBytes } from "node:crypto";
import { Readable } from "node:stream";
import { encryptStream, verifyEncryptedBackup, databaseEnvironment } from "./lib/encrypted-backup.mjs";
test("backups are authenticated, private, never overwrite existing files and leave no partial files", async () => {
  const directory = await mkdtemp(join(tmpdir(), "saasfolio-encryption-"));
  try {
    const file = join(directory, "test.sfb"); const key = randomBytes(32); const privateText = "Sensitive account and editorial data";
    await encryptStream(Readable.from([privateText]), file, key);
    assert.ok(!(await readFile(file)).includes(Buffer.from(privateText)));
    assert.equal((await stat(file)).mode & 0o777, 0o600);
    await verifyEncryptedBackup(file, key);
    await assert.rejects(() => verifyEncryptedBackup(file, randomBytes(32)));
    await assert.rejects(() => encryptStream(Readable.from(["different"]), file, key));
    await verifyEncryptedBackup(file, key);
    const bytes = await readFile(file); bytes[bytes.length - 1] ^= 1; await writeFile(file, bytes);
    await assert.rejects(() => verifyEncryptedBackup(file, key));
    assert.deepEqual(await readdir(directory), ["test.sfb"]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
test("database credentials remain in child environment and invalid URL options are rejected", () => {
  const env = databaseEnvironment("postgresql://backup_user:private%40password@db.example.com/postgres?sslmode=verify-full", {});
  assert.equal(env.PGPASSWORD, "private@password"); assert.equal(env.PGSSLMODE, "verify-full");
  assert.throws(() => databaseEnvironment("https://example.com"));
  assert.throws(() => databaseEnvironment("postgres://user:secret@db.example.com/db?options=unsafe"));
});

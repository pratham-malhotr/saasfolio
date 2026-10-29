import { randomBytes, createCipheriv, createDecipheriv } from "node:crypto";
import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { open, rm, stat, link } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import { Writable } from "node:stream";
const magic = Buffer.from("SFBACK01");
const headerSize = 36; // magic(8), random IV(12), GCM authentication tag(16)
function checkedKey(key) { if (!Buffer.isBuffer(key) || key.length !== 32) throw new Error("A 32-byte backup encryption key is required."); return key; }
function processResult(child, name) {
  child.stderr.resume();
  return new Promise((resolve, reject) => { child.once("error", () => reject(new Error(`${name} could not start.`))); child.once("exit", code => code === 0 ? resolve() : reject(new Error(`${name} failed (exit ${code}); inspect the database connection and client version.`))); });
}
export async function encryptStream(source, destination, key) {
  checkedKey(key);
  const temp = `${destination}.${randomBytes(8).toString("hex")}.partial`;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv); cipher.setAAD(magic);
  try {
    const output = createWriteStream(temp, { flags: "wx", mode: 0o600 });
    output.write(Buffer.concat([magic, iv, Buffer.alloc(16)]));
    await pipeline(source, cipher, output);
    const handle = await open(temp, "r+");
    try { await handle.write(cipher.getAuthTag(), 0, 16, 20); await handle.sync(); } finally { await handle.close(); }
    // Do not overwrite an existing completed backup, including a symlink.
    await link(temp, destination);
    await rm(temp);
  } finally { await rm(temp, { force: true }); }
}
async function decryptedStream(file, key) {
  checkedKey(key);
  if ((await stat(file)).size <= headerSize) throw new Error("Incomplete backup.");
  const handle = await open(file, "r"); const header = Buffer.alloc(headerSize);
  try { await handle.read(header, 0, headerSize, 0); } finally { await handle.close(); }
  if (!header.subarray(0, 8).equals(magic)) throw new Error("Unsupported backup format.");
  const decipher = createDecipheriv("aes-256-gcm", key, header.subarray(8, 20)); decipher.setAAD(magic); decipher.setAuthTag(header.subarray(20, 36));
  const input = createReadStream(file, { start: headerSize });
  input.on("error", error => decipher.destroy(error));
  decipher.once("close", () => input.destroy());
  return input.pipe(decipher);
}
export async function verifyEncryptedBackup(file, key) {
  await pipeline(await decryptedStream(file, key), new Writable({ write(_chunk, _encoding, done) { done(); } }));
}
export async function createDatabaseBackup({ env, destination, key }) {
  checkedKey(key);
  const dump = spawn("pg_dump", ["--format=custom", "--no-owner", "--lock-wait-timeout=10000"], { env, stdio: ["ignore", "pipe", "pipe"] });
  const completion = processResult(dump, "pg_dump");
  // A failed dump is never promoted to a completed backup.
  const staged = `${destination}.dump-${randomBytes(6).toString("hex")}`;
  try {
    const results = await Promise.allSettled([encryptStream(dump.stdout, staged, key), completion]);
    const failure = results.find(result => result.status === "rejected");
    if (failure) throw failure.reason;
    await verifyDatabaseBackup(staged, key);
    await link(staged, destination);
  } finally { dump.kill(); await rm(staged, { force: true }); }
}
export async function verifyDatabaseBackup(file, key) {
  await verifyEncryptedBackup(file, key);
  const source = await decryptedStream(file, key);
  const child = spawn("pg_restore", ["--list"], { stdio: ["pipe", "ignore", "pipe"] });
  await Promise.all([pipeline(source, child.stdin), processResult(child, "pg_restore archive verification")]);
}
export async function restoreDatabaseBackup({ file, key, env }) {
  // Authenticate the entire file before any database command is executed.
  await verifyDatabaseBackup(file, key);
  const source = await decryptedStream(file, key);
  const child = spawn("pg_restore", ["--exit-on-error", "--single-transaction", "--no-owner", "--dbname", env.PGDATABASE], { env, stdio: ["pipe", "ignore", "pipe"] });
  await Promise.all([pipeline(source, child.stdin), processResult(child, "pg_restore")]);
}
export function databaseEnvironment(connection, inherited = process.env) {
  let url;
  try { url = new URL(connection); } catch { throw new Error("Configure a PostgreSQL backup connection URL."); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) || !url.hostname || !url.pathname.slice(1) || url.hash || [...url.searchParams.keys()].some(key => !["sslmode", "sslrootcert"].includes(key))) throw new Error("Use a PostgreSQL URL with optional sslmode and sslrootcert settings.");
  return { ...inherited, PGHOST: url.hostname, PGPORT: url.port || "5432", PGUSER: decodeURIComponent(url.username), PGPASSWORD: decodeURIComponent(url.password), PGDATABASE: decodeURIComponent(url.pathname.slice(1)), PGSSLMODE: url.searchParams.get("sslmode") || "verify-full", ...(url.searchParams.has("sslrootcert") ? { PGSSLROOTCERT: url.searchParams.get("sslrootcert") } : {}), PGCONNECT_TIMEOUT: "10" };
}

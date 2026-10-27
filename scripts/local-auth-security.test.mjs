import test from "node:test";
import assert from "node:assert/strict";
import * as fs from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomBytes, scryptSync, createHmac } from "node:crypto";
import { createRequire } from "node:module";
import ts from "typescript";

// Exercise the real local account store in an isolated private temp directory.
// No provider SDK, email, production account, or workspace .local-data is used.
const nativeRequire = createRequire(import.meta.url);
const source = fs.readFileSync(new URL("../lib/server/local-auth.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
class HttpError extends Error { constructor(status, message) { super(message); this.status = status; } }
const password = "An isolated test passphrase!";
const unavailable = error => error instanceof HttpError && error.status === 503;

function fixture(t) {
  const directory = fs.realpathSync(fs.mkdtempSync(join(tmpdir(), "saasfolio-local-auth-")));
  fs.chmodSync(directory, 0o700);
  const keys = ["NODE_ENV", "LOCAL_AUTH_ENABLED", "LOCAL_AUTH_SECRET", "LOCAL_AUTH_DATA_DIR", "ADMIN_EMAILS"];
  const previous = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  process.env.NODE_ENV = "test";
  process.env.LOCAL_AUTH_ENABLED = "true";
  process.env.LOCAL_AUTH_SECRET = randomBytes(32).toString("hex");
  process.env.LOCAL_AUTH_DATA_DIR = directory;
  t.after(() => {
    for (const key of keys) if (previous[key] === undefined) delete process.env[key]; else process.env[key] = previous[key];
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const load = (options = {}) => {
    const loaded = { exports: {} };
    new Function("require", "module", "exports", "Date", compiled)(name => {
      if (name === "server-only") return {};
      if (name === "@/lib/server/http") return { HttpError };
      if (name === "node:fs") return options.fs || fs;
      return nativeRequire(name);
    }, loaded, loaded.exports, options.Date || Date);
    return loaded.exports;
  };
  return { directory, accounts: join(directory, "accounts.json"), load };
}

test("local accounts require explicit development/test configuration and can never activate in production", t => {
  const { directory, load } = fixture(t);
  const app = load();
  for (const [environment, enabled, secret] of [
    ["production", "true", randomBytes(32).toString("hex")],
    ["test", "false", randomBytes(32).toString("hex")],
    ["development", "true", ""],
    ["development", "true", "a-public-default-secret"],
    ["", "true", randomBytes(32).toString("hex")],
  ]) {
    process.env.NODE_ENV = environment;
    process.env.LOCAL_AUTH_ENABLED = enabled;
    process.env.LOCAL_AUTH_SECRET = secret;
    assert.equal(app.localAuthConfigured(), false);
    assert.equal(app.isLocalAuthEnabled(), false);
    assert.throws(() => app.createLocalAccount("A visitor", "visitor@example.com", password), unavailable);
    assert.equal(app.verifyLocalCredentials("visitor@example.com", password), null);
    assert.equal(app.verifySessionToken("v2." + "a".repeat(43)), null);
  }
  assert.equal(fs.readdirSync(directory).length, 0);
});

test("an empty store creates no seeded accounts and local email addresses never grant administration", t => {
  const { load } = fixture(t);
  const app = load();
  assert.equal(app.loadUsers().length, 0);
  process.env.ADMIN_EMAILS = "prefix-owner@example.com,owner@example.com";
  const user = app.createLocalAccount("Local visitor", "owner@example.com", password);
  assert.equal(user.isAdmin, false);
  const partial = app.createLocalAccount("Another visitor", "wner@example.com", password);
  assert.equal(partial.isAdmin, false);
  assert.ok(!app.loadUsers().some(item => ["usr-demo-001", "usr-admin-001"].includes(item.id)));
});

test("passwords have independent random salts and stronger hashes, with restrictive durable storage", t => {
  const { directory, accounts, load } = fixture(t);
  const app = load();
  const first = app.createLocalAccount("First person", "first@example.com", password);
  const second = app.createLocalAccount("Second person", "second@example.com", password);
  assert.ok(first.salt !== second.salt);
  assert.ok(first.passwordHash !== second.passwordHash);
  assert.equal(first.passwordVersion, 2);
  assert.equal(first.salt.length, 64);
  assert.equal(first.passwordHash.length, 128);
  assert.equal(fs.statSync(directory).mode & 0o077, 0);
  assert.equal(fs.statSync(accounts).mode & 0o077, 0);
  assert.ok(!fs.readFileSync(accounts, "utf8").includes(password));
  assert.equal(load().verifyLocalCredentials("FIRST@example.com", password)?.id, first.id);
  assert.equal(app.verifyLocalCredentials(first.email, "an incorrect passphrase"), null);
  assert.throws(() => app.createLocalAccount("Short password", "short@example.com", "too-short"), error => error.status === 400);
});

test("session tokens are opaque, tamper-resistant and persisted only as digests", t => {
  const { accounts, load } = fixture(t);
  const app = load();
  const user = app.createLocalAccount("Session person", "session@example.com", password);
  const token = app.createSessionToken(user.id);
  assert.ok(/^v2\.[a-z0-9_-]{43}$/i.test(token));
  assert.ok(!fs.readFileSync(accounts, "utf8").includes(token));
  assert.equal(load().verifySessionToken(token), user.id);
  assert.equal(app.verifySessionToken(token + ".extra"), null);
  const modified = token.slice(0, -1) + (token.endsWith("a") ? "b" : "a");
  assert.equal(app.verifySessionToken(modified), null);
  const legacyData = `${user.id}:${Date.now() + 86400000}`;
  const oldSignature = createHmac("sha256", "saasfolio-local-session-secret-salt-2026").update(legacyData).digest("hex");
  assert.equal(app.verifySessionToken(Buffer.from(`${legacyData}:${oldSignature}`).toString("base64url")), null);
  process.env.LOCAL_AUTH_SECRET = randomBytes(32).toString("hex");
  assert.equal(app.verifySessionToken(token), null);
});

test("logout revocation and password changes invalidate persisted sessions across module reloads", t => {
  const { load } = fixture(t);
  const app = load();
  const user = app.createLocalAccount("Revocable person", "revocable@example.com", password);
  const first = app.createSessionToken(user.id);
  const second = app.createSessionToken(user.id);
  app.revokeSessionToken(first);
  assert.equal(load().verifySessionToken(first), null);
  assert.equal(load().verifySessionToken(second), user.id);
  app.updateLocalUser(user.id, { password: "A different test passphrase!" });
  assert.equal(load().verifySessionToken(second), null);
  assert.equal(app.verifyLocalCredentials(user.email, password), null);
  assert.equal(app.verifyLocalCredentials(user.email, "A different test passphrase!")?.id, user.id);
  const latest = app.createSessionToken(user.id);
  app.revokeAllLocalSessions(user.id);
  assert.equal(load().verifySessionToken(latest), null);
});

test("sessions expire at their recorded deadline", t => {
  const { load } = fixture(t);
  let now = Date.now();
  class Clock extends Date { static now() { return now; } }
  const app = load({ Date: Clock });
  const user = app.createLocalAccount("Expiring person", "expiry@example.com", password);
  const token = app.createSessionToken(user.id);
  now += 30 * 86400000;
  assert.equal(app.verifySessionToken(token), null);
});

test("only known built-in identities are retired and genuine legacy accounts upgrade after password authentication", t => {
  const { accounts, load } = fixture(t);
  const app = load();
  const genuine = app.createLocalAccount("Genuine person", "demo@saasfolio.tech", password);
  const salt = randomBytes(16).toString("hex");
  const legacy = { ...genuine, salt, passwordHash: scryptSync(password, salt, 64).toString("hex"), passwordVersion: undefined, isAdmin: true };
  fs.writeFileSync(accounts, JSON.stringify([legacy,
    { ...genuine, id: "usr-demo-001", email: "demo@saasfolio.tech" },
    { ...genuine, id: "usr-admin-001", email: "owner@example.com" },
  ]), { mode: 0o600 });
  const users = app.loadUsers();
  assert.equal(users.length, 1);
  assert.equal(users[0].id, genuine.id);
  assert.equal(users[0].isAdmin, false);
  const upgraded = app.verifyLocalCredentials(genuine.email, password);
  assert.equal(upgraded?.passwordVersion, 2);
  assert.ok(upgraded?.salt !== salt);
  assert.equal(load().loadUsers().length, 1);
});

test("corrupt or symlinked stores fail closed without inventing a replacement account", t => {
  const { directory, accounts, load } = fixture(t);
  const app = load();
  fs.writeFileSync(accounts, "corrupt-store", { mode: 0o600 });
  assert.throws(() => app.loadUsers(), unavailable);
  assert.ok(fs.readFileSync(accounts, "utf8") === "corrupt-store");
  fs.unlinkSync(accounts);
  const target = join(directory, "unrelated-file");
  fs.writeFileSync(target, "untouched", { mode: 0o600 });
  fs.symlinkSync(target, accounts);
  assert.throws(() => app.loadUsers(), unavailable);
  assert.ok(fs.readFileSync(target, "utf8") === "untouched");
});

test("failed atomic writes never report successful accounts, sessions or inquiries", t => {
  const { directory, accounts, load } = fixture(t);
  const blocked = load({ fs: { ...fs, renameSync() { throw Object.assign(new Error("test write failure"), { code: "EACCES" }); } } });
  assert.throws(() => blocked.createLocalAccount("Unsaved person", "unsaved@example.com", password), unavailable);
  assert.equal(fs.existsSync(accounts), false);
  assert.throws(() => blocked.saveLocalInquiry("contact", "local@example.com", { message: "A local test message" }), unavailable);
  assert.equal(fs.existsSync(join(directory, "inquiries.json")), false);
  const app = load();
  const user = app.createLocalAccount("Saved person", "saved@example.com", password);
  assert.throws(() => blocked.createSessionToken(user.id), unavailable);
  assert.equal(load().getLocalUserById(user.id)?.sessions?.length, 0);
  assert.ok(!fs.readdirSync(directory).some(name => /\.(tmp|lock)$/.test(name)));
});

test("concurrent writers fail closed rather than overwrite a locked store", t => {
  const { accounts, load } = fixture(t);
  const app = load();
  const user = app.createLocalAccount("Existing person", "existing@example.com", password);
  fs.writeFileSync(`${accounts}.lock`, "owned-by-another-writer", { mode: 0o600 });
  assert.throws(() => app.updateLocalUser(user.id, { name: "Overwritten name" }), unavailable);
  assert.ok(fs.readFileSync(`${accounts}.lock`, "utf8") === "owned-by-another-writer");
  fs.unlinkSync(`${accounts}.lock`);
  assert.equal(load().getLocalUserById(user.id)?.name, "Existing person");
});

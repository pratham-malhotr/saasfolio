import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { once } from "node:events";

// Run real HTTP handlers and real local password/session storage. The child is
// development-only, all cloud configuration is cleared, and its test data is
// isolated in a temporary directory. No provider accounts or emails are used.
const root = resolve(import.meta.dirname, "..");
const dataDirectory = await mkdtemp(join(tmpdir(), "saasfolio-auth-http-"));
const port = process.env.AUTH_SMOKE_PORT || "3212";
assert.match(port, /^\d{4,5}$/);
const origin = `http://localhost:${port}`;
const email = "auth-http-smoke@example.test";
const initialPassword = "  initial HTTP test password  ";
const changedPassword = "  changed HTTP test password  ";
let output = "", failed = false;
const server = spawn(process.execPath, [join(root, "node_modules/next/dist/bin/next"), "dev", "--webpack", "--hostname", "127.0.0.1", "--port", port], {
  cwd: root,
  env: {
    ...process.env, NODE_ENV: "development", NEXT_TELEMETRY_DISABLED: "1", NEXT_PUBLIC_SITE_URL: origin,
    NEXT_PUBLIC_SUPABASE_URL: "", NEXT_PUBLIC_SUPABASE_ANON_KEY: "", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    SUPABASE_SERVICE_ROLE_KEY: "", RESEND_API_KEY: "", RATE_LIMIT_SECRET: "", VERCEL: "", TRUSTED_CLIENT_IP_HEADER: "",
    LOCAL_AUTH_ENABLED: "true", LOCAL_AUTH_SECRET: randomBytes(32).toString("hex"), LOCAL_AUTH_DATA_DIR: dataDirectory,
    ADMIN_EMAILS: email,
  }, stdio: ["ignore", "pipe", "pipe"],
});
const collect = data => { output = (output + data.toString()).slice(-3000); };
server.stdout.on("data", collect); server.stderr.on("data", collect);

async function api(path, { method = "GET", body, cookie, requestOrigin = origin } = {}) {
  const response = await fetch(`${origin}${path}`, {
    method, redirect: "manual", signal: AbortSignal.timeout(60000),
    headers: { Origin: requestOrigin, ...(body === undefined ? {} : { "Content-Type": "application/json" }), ...(cookie ? { Cookie: cookie } : {}) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const value = await response.json().catch(() => ({}));
  assert.doesNotMatch(JSON.stringify(value), /passwordHash|tokenHash|local-account-timing-only/);
  return { response, value };
}
function sessionCookie(response) {
  const cookies = response.headers.getSetCookie();
  const session = cookies.find(value => value.startsWith("saasfolio_session=v2."));
  assert.ok(session, "Successful local authentication sets an opaque session cookie");
  assert.match(session, /HttpOnly/i); assert.match(session, /SameSite=lax/i);
  return session.split(";")[0];
}

try {
  const deadline = Date.now() + 90000;
  while (true) {
    if (server.exitCode !== null) throw new Error("Isolated development server exited before becoming ready.");
    if (!/Ready in/.test(output)) {
      if (Date.now() >= deadline) throw new Error("Owned development server did not announce readiness.");
      await new Promise(resolve => setTimeout(resolve, 300));
      continue;
    }
    try {
      const { response, value } = await api("/api/health");
      if (response.ok && value.authMode === "local") break;
    } catch { /* The owned server may still be compiling the first route. */ }
    if (Date.now() >= deadline) throw new Error("Isolated development server did not become ready.");
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  const health = await api("/api/health");
  assert.deepEqual(health.value.authProviders, { google: false, apple: false });
  assert.equal((await api("/api/account")).response.status, 401);
  const signup = await api("/api/auth/signup", { method: "POST", body: { name: "HTTP Smoke Fixture", email, password: initialPassword } });
  assert.equal(signup.response.status, 200, JSON.stringify(signup.value)); assert.equal(signup.value.user.email, email);
  assert.equal(signup.value.user.isAdmin, false, "An unverified development address cannot grant admin privileges");
  assert.match(signup.response.headers.get("cache-control"), /private.*no-store/);
  const originalCookie = sessionCookie(signup.response);
  const [storedUser] = JSON.parse(await readFile(join(dataDirectory, "accounts.json"), "utf8"));
  assert.equal(storedUser.passwordVersion, 2); assert.notEqual(storedUser.passwordHash, initialPassword);
  assert.ok(!JSON.stringify(storedUser).includes(initialPassword));
  assert.equal((await stat(join(dataDirectory, "accounts.json"))).mode & 0o777, 0o600);
  assert.equal((await api("/api/auth/session", { cookie: originalCookie })).value.user.id, signup.value.user.id);
  assert.equal((await api("/api/admin/inquiries", { cookie: originalCookie })).response.status, 403);
  assert.equal((await api("/api/account", { cookie: originalCookie })).response.status, 200);
  assert.equal((await api("/api/account", { method: "PATCH", cookie: originalCookie, body: { name: "Updated HTTP fixture", bio: "Isolated test profile", user_id: "another-user" } })).response.status, 200);
  assert.equal((await api("/api/account", { cookie: originalCookie })).value.user.name, "Updated HTTP fixture");

  const passwordRequest = { method: "POST", cookie: originalCookie, body: { password: changedPassword } };
  assert.equal((await api("/api/auth/password", passwordRequest)).response.status, 400);
  assert.equal((await api("/api/auth/password", { ...passwordRequest, body: { ...passwordRequest.body, currentPassword: "wrong-password" } })).response.status, 401);
  const changed = await api("/api/auth/password", { ...passwordRequest, body: { ...passwordRequest.body, currentPassword: initialPassword } });
  assert.equal(changed.response.status, 200); assert.equal(changed.value.requiresReauthentication, true);
  assert.equal((await api("/api/auth/session", { cookie: originalCookie })).value.user, null, "Password changes revoke the original session");
  assert.equal((await api("/api/auth/login", { method: "POST", body: { email, password: initialPassword } })).response.status, 401);
  const login = await api("/api/auth/login", { method: "POST", body: { email, password: changedPassword } });
  assert.equal(login.response.status, 200); const newCookie = sessionCookie(login.response);
  assert.notEqual(newCookie, originalCookie);
  assert.equal((await api("/api/auth/logout", { method: "POST", cookie: newCookie, body: {}, requestOrigin: "https://attacker.example" })).response.status, 403);
  assert.ok((await api("/api/auth/session", { cookie: newCookie })).value.user, "Rejected cross-origin requests do not modify the session");
  assert.equal((await api("/api/auth/logout", { method: "POST", cookie: newCookie, body: {} })).response.status, 200);
  assert.equal((await api("/api/auth/session", { cookie: newCookie })).value.user, null, "Logout revokes a captured cookie on the server");
  assert.equal((await api("/api/auth/reset", { method: "POST", body: { email } })).response.status, 503, "Local mode cannot pretend to deliver reset email");
  assert.equal((await api("/api/auth/oauth", { method: "POST", body: { provider: "google" } })).response.status, 503);
  console.log("Real HTTP auth smoke passed: isolated signup, password whitespace/hash storage, account ownership, admin denial, reauthentication, password/session rotation, CSRF rejection, logout revocation and unavailable provider/email handling.");
} catch (error) {
  failed = true;
  throw error;
} finally {
  server.kill("SIGTERM");
  const exited = once(server, "exit");
  let timer;
  try { await Promise.race([exited, new Promise(resolve => { timer = setTimeout(resolve, 5000); })]); }
  finally { clearTimeout(timer); }
  if (server.exitCode === null && server.signalCode === null) { server.kill("SIGKILL"); await exited; }
  await rm(dataDirectory, { recursive: true, force: true });
  // Server diagnostics contain no fixture credentials; retain output only on failure.
  if (failed) console.error(output.replaceAll(initialPassword, "[redacted]").replaceAll(changedPassword, "[redacted]"));
}

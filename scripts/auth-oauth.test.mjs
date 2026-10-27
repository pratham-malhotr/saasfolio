import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Real handlers and cookie adapter; remote Auth/database boundaries are mocked.
// The PKCE generation case uses the installed SSR SDK without navigating or logging in.
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const user = { id: "user-1", email: "member@example.com", email_confirmed_at: "2026-10-26", user_metadata: { name: "Member" }, app_metadata: { provider: "email" } };
const context = action => ({ params: Promise.resolve({ action }) });

function app(options = {}) {
  process.env.NODE_ENV = options.production ? "production" : "test";
  process.env.NEXT_PUBLIC_SITE_URL = "https://saasfolio.tech";
  if (options.unconfigured) { delete process.env.NEXT_PUBLIC_SUPABASE_URL; delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; }
  else { process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co"; process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-public-key"; }
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key-that-is-long-enough-for-proof-signing";
  process.env.AUTH_RECOVERY_SECRET = "a".repeat(64);
  process.env.ADMIN_EMAILS = "member@example.com";
  const cache = new Map();
  const cookieMap = new Map(Object.entries(options.cookies || {}));
  const cookieWrites = [];
  const calls = { settings: [], oauth: [], exchange: [], signIn: [], signup: [], password: [], logout: [], local: [], limits: [] };
  let activeUser = options.user || null;
  const store = {
    get(name) { const value = cookieMap.get(name); return value === undefined ? undefined : { name, value }; },
    getAll() { return [...cookieMap].map(([name, value]) => ({ name, value })); },
    set(name, value, cookieOptions) { cookieWrites.push({ name, value, options: cookieOptions }); cookieMap.set(name, value); },
  };
  const database = { async rpc(_name, args) { calls.limits.push(args); return { data: !options.limited, error: options.limitFailure ? {} : null }; } };
  const auth = {
    async getUser() { return { data: { user: activeUser }, error: options.userFailure ? {} : null }; },
    async getSession() { return { data: { session: activeUser ? { access_token: options.accessToken || "test-session-token" } : null }, error: null }; },
    async signInWithOAuth(input) {
      calls.oauth.push(input);
      if (options.oauthFailure) return { data: { url: null }, error: new Error("upstream-secret-value") };
      const url = options.oauthUrl || `https://test-project.supabase.co/auth/v1/authorize?provider=${input.provider}&code_challenge=test-challenge&code_challenge_method=s256`;
      return { data: { url }, error: null };
    },
    async exchangeCodeForSession(code) {
      calls.exchange.push(code);
      if (options.exchangeFailure) return { data: { user: null, session: null }, error: new Error("upstream-secret-value") };
      if (options.emptyExchange) return { data: { user: null, session: null }, error: null };
      activeUser = user;
      return { data: { user, session: { access_token: options.accessToken || "test-session-token" }, redirectType: options.recovery ? "recovery" : null }, error: null };
    },
    async signInWithPassword(input) {
      calls.signIn.push(input);
      return { data: { user: options.loginFailure ? null : user }, error: options.loginFailure ? new Error("upstream-secret-value") : null };
    },
    async signUp(input) { calls.signup.push(input); return { data: { user, session: null }, error: null }; },
    async resetPasswordForEmail() { return { error: null }; },
    async updateUser(input) { calls.password.push(input); return { error: null }; },
    async signOut(input) { calls.logout.push(input); return { error: options.logoutFailure ? new Error("upstream-secret-value") : null }; },
  };
  const localUser = { id: user.id, name: "Local member", email: user.email, createdAt: "2026-10-26" };
  const overrides = {
    "server-only": {},
    "next/headers": { cookies: async () => store },
    "@supabase/ssr": options.realSdk ? require("@supabase/ssr") : { createServerClient: (_url, _key, settings) => { calls.clientSettings = settings; return { auth }; } },
    "@supabase/supabase-js": { createClient: () => database },
    "@/lib/server/local-auth": {
      localAuthConfigured: () => Boolean(options.local),
      verifyLocalCredentials(email, password) { calls.local.push({ action: "verify", email, password }); return password === "old-local-password" ? localUser : null; },
      getLocalUserById: () => localUser,
      verifySessionToken: token => token === "local-token" ? user.id : null,
      createSessionToken: () => "local-token",
      createLocalAccount() { calls.local.push({ action: "create" }); return localUser; },
      updateLocalUser(_id, updates) { calls.local.push({ action: "update", updates }); },
      revokeSessionToken(token) { calls.local.push({ action: "revoke", token }); },
    },
  };
  const mockFetch = async (url, init) => {
    calls.settings.push({ url, init });
    if (options.settingsThrow) throw new Error("upstream-secret-value");
    return Response.json(options.settings || { external: { google: true, apple: true } }, { status: options.settingsStatus || 200 });
  };
  function load(filename) {
    const file = resolve(root, filename);
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} }; cache.set(file, loadedModule);
    const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith("@/")) return load(`${name.slice(2)}${/\.[mc]?[jt]s$/.test(name) ? "" : ".ts"}`);
      if (name.startsWith(".")) return load(resolve(dirname(file), `${name}${/\.[mc]?[jt]s$/.test(name) ? "" : ".ts"}`));
      return require(name);
    };
    new Function("require", "module", "exports", "fetch", source)(localRequire, loadedModule, loadedModule.exports, mockFetch);
    return loadedModule.exports;
  }
  return { load, calls, cookieMap, cookieWrites };
}

function request(action, data = {}, headers = {}) {
  return new Request(`https://saasfolio.tech/api/auth/${action}`, { method: "POST", headers: { "Content-Type": "application/json", Origin: "https://saasfolio.tech", ...headers }, body: JSON.stringify(data) });
}

test("provider readiness reads strict public settings and exposes only booleans", async () => {
  const instance = app({ settings: { external: { google: true, apple: "true" }, secret: "never-return" } });
  const result = await instance.load("lib/server/supabase.ts").authProviderAvailability();
  assert.deepEqual(result, { google: true, apple: false });
  const [{ url, init }] = instance.calls.settings;
  assert.equal(url, "https://test-project.supabase.co/auth/v1/settings");
  assert.equal(init.headers.apikey, "test-public-key");
  assert.equal(init.cache, "no-store");
  assert.equal(init.redirect, "error");
  assert.ok(init.signal instanceof AbortSignal);
});

test("provider settings failure, disabled configuration and fake flags fail closed", async () => {
  for (const options of [{ settingsStatus: 403 }, { settingsThrow: true }, { unconfigured: true }, { settings: { external: {} } }]) {
    const instance = app(options);
    process.env.NEXT_PUBLIC_GOOGLE_ENABLED = "true";
    assert.deepEqual(await instance.load("lib/server/supabase.ts").authProviderAvailability(), { google: false, apple: false });
  }
  delete process.env.NEXT_PUBLIC_GOOGLE_ENABLED;
});

test("public health reports auth mode and conservative providers without credentials", async () => {
  for (const [options, mode, providers] of [
    [{ settings: { external: { google: true, apple: false } } }, "supabase", { google: true, apple: false }],
    [{ unconfigured: true, local: true }, "local", { google: false, apple: false }],
    [{ unconfigured: true }, "unavailable", { google: false, apple: false }],
  ]) {
    const instance = app(options);
    const response = await instance.load("app/api/health/route.ts").GET();
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.authMode, mode);
    assert.deepEqual(result.authProviders, providers);
    assert.equal(result.minimumPasswordLength, 12);
    assert.equal(result.checks.accountsConfigured, mode !== "unavailable");
    assert.match(response.headers.get("cache-control"), /no-store/);
    assert.doesNotMatch(JSON.stringify(result), /test-public-key|test-service-key|test-session-token|secret|apikey/);
  }
});

test("OAuth supports Google and Apple through a safe same-project PKCE start", async () => {
  for (const provider of ["google", "apple"]) {
    const instance = app();
    const response = await instance.load("app/api/auth/[action]/route.ts").POST(request("oauth", { provider, redirect: "/submit?type=code" }), context("oauth"));
    assert.equal(response.status, 200);
    const { url } = await response.json();
    assert.equal(new URL(url).origin, "https://test-project.supabase.co");
    assert.equal(instance.calls.oauth[0].provider, provider);
    assert.equal(instance.calls.oauth[0].options.skipBrowserRedirect, true);
    assert.equal(new URL(instance.calls.oauth[0].options.redirectTo).searchParams.get("next"), "/submit?type=code");
    assert.equal(instance.calls.clientSettings.auth.flowType, "pkce");
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
  }
});

test("installed SSR SDK actually generates S256 challenge and a protected verifier cookie", async () => {
  const instance = app({ realSdk: true, production: true });
  const response = await instance.load("app/api/auth/[action]/route.ts").POST(request("oauth", { provider: "google", redirect: "//attacker.example" }), context("oauth"));
  assert.equal(response.status, 200);
  const url = new URL((await response.json()).url);
  assert.equal(url.searchParams.get("code_challenge_method"), "s256");
  assert.ok(url.searchParams.get("code_challenge")?.length >= 43);
  const verifier = instance.cookieWrites.find(cookie => cookie.name.includes("code-verifier"));
  assert.ok(verifier?.value);
  assert.equal(verifier.options.httpOnly, true);
  assert.equal(verifier.options.secure, true);
  assert.equal(verifier.options.sameSite, "lax");
  assert.equal(verifier.options.path, "/");
  assert.equal(verifier.options.domain, undefined);
  assert.equal(verifier.options.maxAge, 3600);
  assert.equal(new URL(url.searchParams.get("redirect_to")).searchParams.get("next"), "/profile");
});

test("OAuth rejects unsupported providers, cross-origin starts and missing origin", async () => {
  const instance = app(); const route = instance.load("app/api/auth/[action]/route.ts");
  assert.equal((await route.POST(request("oauth", { provider: "github" }), context("oauth"))).status, 400);
  assert.equal((await route.POST(request("oauth", { provider: "google" }, { Origin: "https://attacker.example" }), context("oauth"))).status, 403);
  const absent = request("oauth", { provider: "google" }); absent.headers.delete("origin");
  assert.equal((await route.POST(absent, context("oauth"))).status, 403);
  assert.equal(instance.calls.oauth.length, 0);
});

test("OAuth availability, rate-limit and upstream URL failures never expose remote details", async () => {
  for (const options of [{ settings: { external: { google: false } } }, { limited: true }, { limitFailure: true }, { oauthFailure: true }, { oauthUrl: "https://attacker.example/auth/v1/authorize" }]) {
    const instance = app(options);
    const response = await instance.load("app/api/auth/[action]/route.ts").POST(request("oauth", { provider: "google" }), context("oauth"));
    assert.ok([429, 503].includes(response.status));
    assert.doesNotMatch(await response.text(), /upstream-secret-value|attacker\.example/);
  }
});

test("auth redirects reject encoded host escapes and preserve ordinary local navigation", () => {
  const instance = app(); const { safeAuthRedirect } = instance.load("lib/auth-navigation.ts");
  for (const value of ["https://attacker.example", "//attacker.example", "/\\attacker.example", "/%2f%2fattacker.example", "/%255cattacker.example", "/%0aLocation:evil", "/bad%", " /profile"]) assert.equal(safeAuthRedirect(value), "/profile");
  assert.equal(safeAuthRedirect("/submit?type=code#proof"), "/submit?type=code#proof");
});

test("callback exchanges code, uses canonical origin and rejects external next targets", async () => {
  const instance = app({ production: true });
  const response = await instance.load("app/auth/callback/route.ts").GET(new Request("https://untrusted-host.example/auth/callback?code=one-use-code&next=%2F%2Fattacker.example", { headers: { "x-forwarded-host": "attacker.example" } }));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), "https://saasfolio.tech/profile");
  assert.deepEqual(instance.calls.exchange, ["one-use-code"]);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});

test("callback cancellation, malformed code and exchange failure have recoverable generic errors", async () => {
  for (const [options, query] of [[{}, "error=access_denied&error_description=upstream-secret-value"], [{}, "code=bad%0acode"], [{ exchangeFailure: true }, "code=used-code"], [{ emptyExchange: true }, "code=empty-result"], [{}, ""]]) {
    const instance = app(options);
    const response = await instance.load("app/auth/callback/route.ts").GET(new Request(`https://saasfolio.tech/auth/callback?flow=oauth&${query}`));
    assert.equal(response.headers.get("location"), "https://saasfolio.tech/login?error=oauth");
    assert.doesNotMatch(response.headers.get("location"), /upstream-secret-value|used-code/);
  }
});

test("a session alone cannot change a password and current passwords are not trimmed", async () => {
  const instance = app({ user }); const route = instance.load("app/api/auth/[action]/route.ts");
  assert.equal((await route.POST(request("password", { password: "new-password-long" }), context("password"))).status, 400);
  assert.equal(instance.calls.password.length, 0);
  const response = await route.POST(request("password", { password: " new-password-long ", currentPassword: " old-password " }), context("password"));
  assert.equal(response.status, 200);
  assert.equal(instance.calls.signIn[0].password, " old-password ");
  assert.equal(instance.calls.password[0].password, " new-password-long ");
  assert.equal((await response.json()).requiresReauthentication, true);
  assert.match(response.headers.get("set-cookie"), /saasfolio_session=.*Max-Age=0/i);
});

test("only a real recovery exchange mints a session-bound short-lived password proof", async () => {
  const instance = app({ recovery: true });
  const callback = await instance.load("app/auth/callback/route.ts").GET(new Request("https://saasfolio.tech/auth/callback?code=recovery-code&next=/reset-password"));
  const cookie = callback.cookies.get("saasfolio_recovery");
  assert.ok(cookie?.value);
  const { verifyRecoveryProof } = instance.load("lib/auth-config.ts");
  assert.equal(verifyRecoveryProof(cookie.value, user.id, "test-session-token"), true);
  assert.equal(verifyRecoveryProof(cookie.value, "another-user", "test-session-token"), false);
  assert.equal(verifyRecoveryProof(cookie.value, user.id, "another-session"), false);
  assert.equal(verifyRecoveryProof(`${cookie.value}tampered`, user.id, "test-session-token"), false);
  instance.cookieMap.set("saasfolio_recovery", cookie.value);
  const route = instance.load("app/api/auth/[action]/route.ts");
  assert.equal((await (await route.GET(new Request("https://saasfolio.tech/api/auth/session"), context("session"))).json()).recoveryAllowed, true);
  assert.equal((await route.POST(request("password", { password: "new-recovery-password" }), context("password"))).status, 200);
  assert.equal(instance.calls.signIn.length, 0);
});

test("a recovery query flag and a normal OAuth exchange cannot mint recovery permission", async () => {
  const instance = app();
  const response = await instance.load("app/auth/callback/route.ts").GET(new Request("https://saasfolio.tech/auth/callback?code=ordinary-code&type=recovery&next=/reset-password"));
  assert.equal(response.cookies.get("saasfolio_recovery")?.value, "");
});

test("email credentials retain whitespace, signup minimum and confirmation semantics", async () => {
  const instance = app(); const route = instance.load("app/api/auth/[action]/route.ts");
  assert.equal((await route.POST(request("signup", { name: "Member", email: user.email, password: "too-short" }), context("signup"))).status, 400);
  const response = await route.POST(request("signup", { name: "Member", email: user.email, password: "  long-password  " }), context("signup"));
  assert.equal(instance.calls.signup[0].password, "  long-password  ");
  assert.equal((await response.json()).user, null);
});

test("a failed cloud login never falls back to a local account", async () => {
  const instance = app({ loginFailure: true, local: true });
  const response = await instance.load("app/api/auth/[action]/route.ts").POST(request("login", { email: user.email, password: "old-local-password" }), context("login"));
  assert.equal(response.status, 401);
  assert.equal(instance.calls.local.length, 0);
  assert.doesNotMatch(await response.text(), /upstream-secret-value/);
});

test("unconfigured accounts and local email reset do not pretend success", async () => {
  let instance = app({ unconfigured: true });
  assert.equal((await instance.load("app/api/auth/[action]/route.ts").POST(request("login", { email: user.email, password: "old-local-password" }), context("login"))).status, 503);
  instance = app({ unconfigured: true, local: true });
  assert.equal((await instance.load("app/api/auth/[action]/route.ts").POST(request("reset", { email: user.email }), context("reset"))).status, 503);
});

test("logout revokes local tokens and clears cookies even when cloud sign-out fails", async () => {
  let instance = app({ unconfigured: true, local: true, cookies: { saasfolio_session: "local-token" } });
  let response = await instance.load("app/api/auth/[action]/route.ts").POST(request("logout"), context("logout"));
  assert.equal(response.status, 200);
  assert.ok(instance.calls.local.some(call => call.action === "revoke"));
  instance = app({ logoutFailure: true, cookies: { "sb-test-project-auth-token": "test-cookie-value" } });
  response = await instance.load("app/api/auth/[action]/route.ts").POST(request("logout"), context("logout"));
  assert.equal(response.status, 503);
  assert.match(response.headers.get("set-cookie"), /sb-test-project-auth-token=.*Max-Age=0/i);
  assert.doesNotMatch(await response.text(), /upstream-secret-value/);
  instance = app({ limitFailure: true, cookies: { "sb-test-project-auth-token": "test-cookie-value" } });
  response = await instance.load("app/api/auth/[action]/route.ts").POST(request("logout"), context("logout"));
  assert.equal(response.status, 503);
  assert.match(response.headers.get("set-cookie"), /sb-test-project-auth-token=.*Max-Age=0/i);
});

test("public config rejects secret keys and supports the current publishable-key field", () => {
  const instance = app(); const { supabasePublicConfig } = instance.load("lib/auth-config.ts");
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test-key";
  assert.equal(supabasePublicConfig().key, "sb_publishable_test-key");
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_secret_do-not-use-publicly";
  assert.equal(supabasePublicConfig(), null);
  delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
});

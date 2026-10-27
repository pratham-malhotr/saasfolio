import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { createRequire } from "node:module";
import ts from "typescript";

// Execute real route handlers with provider SDK boundaries replaced by test doubles.
// No email is sent and no external database or auth account is modified.
const require = createRequire(import.meta.url);
const root = resolve(import.meta.dirname, "..");
const testUser = { id: "user-1", email: "owner@example.com", email_confirmed_at: "2026-10-21", user_metadata: { name: "Owner" } };

function platform(options = {}) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test-project.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service";
  process.env.ADMIN_EMAILS = "owner@example.com";
  const cache = new Map();
  const writes = [];
  const limits = [];
  const authCookies = new Map();
  let user = options.user || null;
  const database = {
    rpc: async (_name, args) => { limits.push(args); return { data: options.limited ? false : true, error: options.limitFailure ? {} : null }; },
    from(table) {
      const operation = { table, filters: [] };
      const query = {
        insert(value) { operation.action = "insert"; operation.value = value; writes.push(operation); return query; },
        upsert(value) { operation.action = "upsert"; operation.value = value; writes.push(operation); return query; },
        update(value) { operation.action = "update"; operation.value = value; writes.push(operation); return query; },
        delete() { operation.action = "delete"; writes.push(operation); return query; },
        select() { return query; },
        eq(key, value) { operation.filters.push([key, value]); return query; },
        order() { return query; }, limit() { return query; }, gt() { return query; },
        async single() { return { data: options.writeFailure ? null : { id: "92aa27bf-1b80-4de7-a7dc-6fc50c3af820" }, error: options.writeFailure ? {} : null }; },
        async maybeSingle() { return { data: options.row || null, error: null }; },
        then(done, fail) { return Promise.resolve({ data: [], error: options.writeFailure ? {} : null }).then(done, fail); },
      };
      return query;
    },
  };
  const auth = {
    async getUser() { return { data: { user }, error: null }; },
    async signInWithPassword(data) {
      if (data.password !== "correct-password") return { data: { user: null }, error: {} };
      user = testUser; return { data: { user }, error: null };
    },
    async signUp() { return { data: { user: testUser, session: null }, error: null }; },
    async resetPasswordForEmail() { return { error: null }; },
    async updateUser() { return { error: null }; },
    async signOut() { user = null; return { error: null }; },
  };
  const overrides = {
    "server-only": {},
    "next/headers": { cookies: async () => ({
      get: name => authCookies.has(name) ? { name, value: authCookies.get(name) } : undefined,
      getAll: () => [...authCookies].map(([name, value]) => ({ name, value })),
      set: (name, value, options) => { if (options?.maxAge === 0) authCookies.delete(name); else authCookies.set(name, value); },
      delete: name => { authCookies.delete(name); },
    }) },
    "@supabase/ssr": { createServerClient: () => ({ ...database, auth }) },
    "@supabase/supabase-js": { createClient: () => database },
    "@/lib/data/deals-data": { getDealBySlug: slug => slug === "valid-offer" ? { slug, title: "Valid offer" } : undefined },
    "@/lib/data/articles-data": { getArticleBySlug: slug => slug === "valid-article" ? { slug, title: "Valid article" } : undefined },
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
    new Function("require", "module", "exports", source)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return { load, writes, limits };
}
const request = (path, data, options = {}) => new Request(`https://saasfolio.tech${path}`, {
  method: options.method || "POST", headers: { "Content-Type": "application/json", Origin: options.origin || "https://saasfolio.tech" }, body: options.raw || JSON.stringify(data),
});
const context = action => ({ params: Promise.resolve({ action }) });
const contact = { kind: "contact", name: "Test visitor", email: "visitor@example.com", department: "support", subject: "Incorrect listing", message: "Please review this software offer and its conditions." };

test("contact submissions are saved server-side and return the database reference", async () => {
  const app = platform();
  const response = await app.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", contact));
  assert.equal(response.status, 201);
  assert.equal((await response.json()).id, "92aa27bf-1b80-4de7-a7dc-6fc50c3af820");
  assert.equal(app.writes[0].table, "inquiries");
  assert.equal(app.writes[0].value.email, contact.email);
});

test("code submissions require authentication and remain pending after input checks", async () => {
  const unauthApp = platform();
  const codeSubmission = {
    kind: "submission",
    submissionType: "code",
    toolName: "Hostinger",
    websiteUrl: "https://hostinger.com",
    code: "SAVE20",
    codeType: "coupon",
    discountPercentage: 20,
    discountDescription: "20% off web hosting plans",
    verificationProof: "https://hostinger.com/pricing",
    verificationStatus: "verified",
    verificationScore: 100,
    sourceChecked: true,
    checkoutTested: true,
  };
  const unauthRes = await unauthApp.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", codeSubmission));
  assert.equal(unauthRes.status, 401);

  const authApp = platform({ user: testUser });
  const authRes = await authApp.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", codeSubmission));
  assert.equal(authRes.status, 201);
  assert.equal(authApp.writes[0].table, "inquiries");
  assert.equal(authApp.writes[0].value.payload.submissionType, "code");
  assert.equal(authApp.writes[0].value.payload.code, "SAVE20");
  assert.equal(authApp.writes[0].value.payload.submittedBy.id, testUser.id);
  const payload = authApp.writes[0].value.payload;
  assert.equal(payload.verificationScore, 0);
  assert.equal(payload.verificationStatus, "pending_review");
  assert.equal(payload.verificationBadge, "UNREVIEWED SUBMISSION");
  assert.equal(payload.preflightValid, true);
  assert.equal(payload.reviewStatus, "pending");
  assert.equal(payload.sourceChecked, false);
  assert.equal(payload.checkoutTested, false);
});

test("preflight of an invented code never claims source or checkout verification or writes a submission", async () => {
  const app = platform();
  const route = app.load("app/api/verify-code/route.ts");
  const response = await route.POST(request("/api/verify-code", {
    code: "INVENTED2026", codeType: "coupon", toolName: "Hostinger", websiteUrl: "https://hostinger.com",
    discountPercentage: 20, sourceChecked: true, checkoutTested: true,
  }));
  assert.equal(response.status, 200);
  assert.match(response.headers.get("cache-control"), /no-store/);
  const { report } = await response.json();
  assert.equal(report.valid, true);
  assert.equal(report.status, "pending_review");
  assert.equal(report.reviewStatus, "pending");
  assert.equal(report.score, 0);
  assert.equal(report.sourceChecked, false);
  assert.equal(report.checkoutTested, false);
  assert.equal(report.scope, "input-preflight");
  assert.equal(app.writes.length, 0);
});

test("preflight reports invalid input and rejects cross-origin requests without writes", async () => {
  const app = platform();
  const route = app.load("app/api/verify-code/route.ts");
  const input = { code: "SAVE20", codeType: "coupon", toolName: "Hostinger", websiteUrl: "https://127.0.0.1", discountPercentage: "not-a-number", expirationDate: "2099-02-31" };
  const response = await route.POST(request("/api/verify-code", input));
  assert.equal(response.status, 200);
  const { report } = await response.json();
  assert.equal(report.valid, false);
  assert.equal(report.status, "needs_changes");
  for (const id of ["domain", "discount_amount", "expiration"]) assert.equal(report.checks.find(check => check.id === id).passed, false);
  assert.equal((await route.POST(request("/api/verify-code", input, { origin: "https://attacker.example" }))).status, 403);
  assert.equal(app.writes.length, 0);
});

test("invalid, cross-origin, oversized, malformed and honeypot forms do not write", async () => {
  const app = platform(); const route = app.load("app/api/inquiries/route.ts");
  for (const [data, options, status] of [
    [{ ...contact, email: "invalid" }, {}, 400],
    [contact, { origin: "https://attacker.example" }, 403],
    [contact, { raw: "x".repeat(24001) }, 413],
    [contact, { raw: "{" }, 400],
    [{ ...contact, companyWebsite: "spam" }, {}, 400],
    [{ ...contact, kind: "unknown" }, {}, 400],
  ]) assert.equal((await route.POST(request("/api/inquiries", data, options))).status, status);
  assert.equal(app.writes.length, 0);
});

test("rate limits, database failure, and absent configuration never report success", async () => {
  for (const [options, status] of [[{ limited: true }, 429], [{ limitFailure: true }, 503], [{ writeFailure: true }, 503]]) {
    const app = platform(options);
    assert.equal((await app.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", contact))).status, status);
  }
  const app = platform(); delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  assert.equal((await app.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", contact))).status, 503);
});

test("password sign-in rejects invented users and signup requires confirmation", async () => {
  const app = platform(); const auth = app.load("app/api/auth/[action]/route.ts");
  assert.equal((await auth.POST(request("/api/auth/login", { email: "test@example.com", password: "wrong" }), context("login"))).status, 401);
  const signedUp = await auth.POST(request("/api/auth/signup", { name: "New member", email: "test@example.com", password: "a-valid-long-password" }), context("signup"));
  assert.equal((await signedUp.json()).user, null);
  const signedIn = await auth.POST(request("/api/auth/login", { email: "owner@example.com", password: "correct-password" }), context("login"));
  assert.equal((await signedIn.json()).user.id, testUser.id);
  await auth.POST(request("/api/auth/logout", {}), context("logout"));
  assert.equal((await (await auth.GET(request("/api/auth/session", {}), context("session"))).json()).user, null);
});

test("private accounts and admin endpoints require verified authorization", async () => {
  let app = platform();
  assert.equal((await app.load("app/api/account/route.ts").GET()).status, 401);
  assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET()).status, 401);
  for (const user of [{ ...testUser, email: "other@example.com" }, { ...testUser, email_confirmed_at: null }]) {
    app = platform({ user });
    assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET()).status, 403);
  }
  app = platform({ user: testUser });
  assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET()).status, 200);
});

test("saved items use the authenticated user and reject unknown catalog entries", async () => {
  const app = platform({ user: testUser }); const account = app.load("app/api/account/route.ts");
  assert.equal((await account.POST(request("/api/account", { kind: "deal", slug: "valid-offer", user_id: "someone-else" }))).status, 200);
  assert.equal(app.writes[0].value.user_id, testUser.id);
  assert.equal((await account.POST(request("/api/account", { kind: "deal", slug: "missing" }))).status, 404);
  assert.equal((await account.POST(request("/api/account", { kind: "deal", slug: "valid-offer", saved: false }))).status, 200);
  assert.ok(app.writes[1].filters.some(([key, value]) => key === "user_id" && value === testUser.id));
});

test("newsletter requires explicit consent and a configured delivery provider", async () => {
  const app = platform(); const newsletter = app.load("app/api/newsletter/route.ts");
  assert.equal((await newsletter.POST(request("/api/newsletter", { email: "test@example.com" }))).status, 400);
  delete process.env.RESEND_API_KEY;
  assert.equal((await newsletter.POST(request("/api/newsletter", { email: "test@example.com", consent: true }))).status, 503);
  assert.equal(app.writes.length, 0);
});

test("redirects cannot escape the site", () => {
  const { safeRedirect } = platform().load("lib/server/http.ts");
  for (const url of ["//evil.example", "https://evil.example", "/\\evil.example", "/\n/evil.example"]) assert.equal(safeRedirect(url), "/profile");
  assert.equal(safeRedirect("/deals?category=marketing"), "/deals?category=marketing");
});

test("rate limiting ignores spoofed client IP headers unless an ingress header is explicitly trusted", async () => {
  delete process.env.TRUSTED_CLIENT_IP_HEADER; delete process.env.VERCEL;
  const app = platform();
  const { enforceLimit } = app.load("lib/server/supabase.ts");
  await enforceLimit(new Request("https://saasfolio.tech/api/inquiries", { headers: { "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "2.2.2.2" } }), "test");
  await enforceLimit(new Request("https://saasfolio.tech/api/inquiries", { headers: { "cf-connecting-ip": "3.3.3.3", "x-forwarded-for": "4.4.4.4" } }), "test");
  assert.equal(app.limits[0].bucket_key, app.limits[1].bucket_key);
  process.env.TRUSTED_CLIENT_IP_HEADER = "cf-connecting-ip";
  await enforceLimit(new Request("https://saasfolio.tech/api/inquiries", { headers: { "cf-connecting-ip": "1.1.1.1" } }), "test");
  await enforceLimit(new Request("https://saasfolio.tech/api/inquiries", { headers: { "cf-connecting-ip": "3.3.3.3" } }), "test");
  assert.notEqual(app.limits[2].bucket_key, app.limits[3].bucket_key);
  delete process.env.TRUSTED_CLIENT_IP_HEADER;
});

test("submitted websites reject private addresses, credentials and local-name bypasses", () => {
  const { website } = platform().load("lib/server/http.ts");
  for (const url of ["https://127.0.0.1", "https://[::ffff:127.0.0.1]", "https://admin:secret@example.com", "https://example.internal.", "https://x.localhost", "https://host.home.arpa"]) assert.throws(() => website({ url }, "url"));
  assert.equal(website({ url: "https://example.com./pricing?coupon=SAVE" }, "url"), "https://example.com/pricing?coupon=SAVE");
});

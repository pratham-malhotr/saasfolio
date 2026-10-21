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
  let user = options.user || null;
  const database = {
    rpc: async () => ({ data: options.limited ? false : true, error: options.limitFailure ? {} : null }),
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
    "next/headers": { cookies: async () => ({ getAll: () => [], set: () => {} }) },
    "@supabase/ssr": { createServerClient: () => ({ ...database, auth }) },
    "@supabase/supabase-js": { createClient: () => database },
    "@/lib/data/deals-data": { getDealBySlug: slug => slug === "valid-offer" ? { slug, title: "Valid offer" } : undefined },
    "@/lib/data/articles-data": { DETAILED_ARTICLES: [{ slug: "valid-article", title: "Valid article" }] },
  };
  function load(filename) {
    const file = resolve(root, filename);
    if (cache.has(file)) return cache.get(file).exports;
    const loadedModule = { exports: {} }; cache.set(file, loadedModule);
    const source = ts.transpileModule(readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    const localRequire = name => {
      if (Object.hasOwn(overrides, name)) return overrides[name];
      if (name.startsWith("@/")) return load(`${name.slice(2)}.ts`);
      if (name.startsWith(".")) return load(resolve(dirname(file), `${name}.ts`));
      return require(name);
    };
    new Function("require", "module", "exports", source)(localRequire, loadedModule, loadedModule.exports);
    return loadedModule.exports;
  }
  return { load, writes };
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

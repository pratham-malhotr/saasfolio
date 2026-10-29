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
  const rpcCalls = [], authCalls = [];
  const authCookies = new Map();
  let user = options.user || null;
  const database = {
    rpc: async (name, args) => {
      rpcCalls.push({ name, args });
      if (options.rpc?.[name]) return options.rpc[name];
      if (name === "staff_self") return { data: user?.email === testUser.email && user?.email_confirmed_at ? { role: "owner", mfaVerified: options.mfa !== false } : null, error: null };
      if (name === "bootstrap_staff_owner") return { data: false, error: null };
      if (name === "review_inquiries") return { data: [], error: null };
      limits.push(args); return { data: options.limited ? false : true, error: options.limitFailure ? {} : null };
    },
    from(table) {
      const operation = { table, filters: [] };
      const query = {
        insert(value) { operation.action = "insert"; operation.value = value; writes.push(operation); return query; },
        upsert(value) { operation.action = "upsert"; operation.value = value; writes.push(operation); return query; },
        update(value) { operation.action = "update"; operation.value = value; writes.push(operation); return query; },
        delete() { operation.action = "delete"; writes.push(operation); return query; },
        select() { return query; },
        eq(key, value) { operation.filters.push([key, value]); return query; },
        order() { return query; }, limit() { return query; }, gt() { return query; }, range() { return query; },
        async single() { return { data: options.writeFailure ? null : { id: "92aa27bf-1b80-4de7-a7dc-6fc50c3af820" }, error: options.writeFailure ? {} : null }; },
        async maybeSingle() { return { data: options.row || null, error: null }; },
        then(done, fail) { return Promise.resolve({ data: options.rows?.[table] || [], error: options.writeFailure ? {} : null }).then(done, fail); },
      };
      return query;
    },
  };
  const auth = {
    admin: { async deleteUser(id, soft) { authCalls.push({ action: "delete", id, soft }); return { error: options.deleteFailure ? {} : null }; } },
    mfa: {
      async listFactors() { return { data: { all: options.factors || [], totp: (options.factors || []).filter(factor => factor.status === "verified") }, error: null }; },
      async getAuthenticatorAssuranceLevel() { return { data: { currentLevel: options.mfa === false ? "aal1" : "aal2" }, error: null }; },
      async enroll() { authCalls.push({ action: "enroll" }); return { data: { id: "00000000-0000-4000-8000-000000000010", totp: { qr_code: "data:image/svg+xml;utf8,test", secret: "test-only-secret" } }, error: null }; },
      async challengeAndVerify(value) { authCalls.push({ action: "verify", ...value }); return { data: {}, error: options.verifyFailure ? {} : null }; },
      async unenroll(value) { authCalls.push({ action: "unenroll", ...value }); return { error: null }; },
    },
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
    "@supabase/supabase-js": { createClient: () => ({ ...database, auth }) },
    "@/lib/data/deals-data": { getDealBySlug: slug => slug === "valid-offer" ? { slug, toolSlug: "example", title: "Valid offer" } : undefined, getHistoricOfferToolSlug: slug => slug === "historic-offer" ? "example" : undefined },
    "@/lib/data/tools-data": { getToolBySlug: slug => ["example", "other-brand"].includes(slug) ? { slug, name: slug } : undefined },
    "@/lib/data/managed-content": { MANAGED_OFFERS: [], RETIRED_MANAGED_OFFERS: new Set() },
    "@/lib/data/articles-data": { getArticleBySlug: slug => slug === "valid-article" ? { slug, title: "Valid article" } : undefined },
    "@/lib/data/offer-snapshot.json": { lastRun: new Date().toISOString(), sources: {} },
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
  return { load, writes, limits, rpcCalls, authCalls };
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
test("correction reports retain validated listing identities as unreviewed context", async () => {
  for (const offerSlug of ["valid-offer", "historic-offer"]) {
    const app = platform();
    const response = await app.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", { ...contact, reportOffer: offerSlug, reportBrand: "example", reportStatus: "verified" }));
    assert.equal(response.status, 201);
    assert.equal(app.writes[0].value.payload.offerSlug, offerSlug);
    assert.equal(app.writes[0].value.payload.brandSlug, "example");
    assert.equal(app.writes[0].value.payload.reportStatus, "unreviewed");
  }
  for (const context of [{ reportOffer: "invented" }, { reportBrand: "invented" }, { reportOffer: "valid-offer", reportBrand: "other-brand" }, { reportOffer: "valid-offer?token=private" }]) {
    const app = platform();
    assert.equal((await app.load("app/api/inquiries/route.ts").POST(request("/api/inquiries", { ...contact, ...context }))).status, 400);
    assert.equal(app.writes.length, 0);
  }
});
test("offer operations require confirmed MFA staff and validate pagination without provider writes", async () => {
  const url = "https://saasfolio.tech/api/admin/offers";
  for (const [options, status] of [[{}, 401], [{ user: testUser, mfa: false }, 403], [{ user: { ...testUser, email: "visitor@example.test" } }, 403], [{ user: testUser }, 200]]) {
    const app = platform(options);
    const response = await app.load("app/api/admin/offers/route.ts").GET(new Request(url));
    assert.equal(response.status, status);
    assert.equal(response.headers.get("cache-control"), "private, no-store");
    assert.equal(app.writes.length, 0);
  }
  for (const query of ["?reason=invented", "?page=-1", "?page=1.5", "?page=Infinity"]) {
    assert.equal((await platform({ user: testUser }).load("app/api/admin/offers/route.ts").GET(new Request(url + query))).status, 400);
  }
});
test("product analytics respect current consent, private routes and privacy signals without disrupting user actions", () => {
  const saved = Object.fromEntries(["window", "location", "navigator", "localStorage"].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)]));
  const events = [], browserLocation = { pathname: "/discounts/example", origin: "https://saasfolio.tech", search: "?private=never-send" }, browserNavigator = { doNotTrack: null, globalPrivacyControl: false };
  let consent = null;
  try {
    for (const [key, value] of Object.entries({ window: { gtag: (...args) => events.push(args) }, location: browserLocation, navigator: browserNavigator, localStorage: { getItem: () => consent } })) Object.defineProperty(globalThis, key, { value, configurable: true });
    const { trackProductEvent } = platform().load("lib/client-analytics.ts");
    const copy = () => trackProductEvent("coupon_copy", { result: "copied", code: "NEVER-SEND-CODE" });
    copy(); assert.equal(events.length, 0);
    consent = JSON.stringify({ version: 1, allowed: true, at: Date.now() });
    copy(); assert.equal(events.length, 1);
    assert.equal(events[0][2].page_location, "https://saasfolio.tech/discounts/example");
    assert.ok(!JSON.stringify(events).includes("NEVER-SEND") && !JSON.stringify(events).includes("private="));
    browserNavigator.doNotTrack = "1"; copy();
    browserNavigator.doNotTrack = null; browserNavigator.globalPrivacyControl = true; copy();
    browserNavigator.globalPrivacyControl = false; browserLocation.pathname = "/profile"; copy();
    browserLocation.pathname = "/discounts/example"; consent = JSON.stringify({ version: 1, allowed: false, at: Date.now() }); copy();
    assert.equal(events.length, 1);
    consent = JSON.stringify({ version: 1, allowed: true, at: Date.now() });
    globalThis.window.gtag = () => { throw new Error("Third-party fixture failure"); };
    assert.doesNotThrow(copy);
  } finally {
    for (const [key, descriptor] of Object.entries(saved)) { if (descriptor) Object.defineProperty(globalThis, key, descriptor); else delete globalThis[key]; }
  }
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
  assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET(new Request("https://saasfolio.tech/api/admin/inquiries"))).status, 401);
  for (const user of [{ ...testUser, email: "other@example.com" }, { ...testUser, email_confirmed_at: null }]) {
    app = platform({ user });
    assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET(new Request("https://saasfolio.tech/api/admin/inquiries"))).status, 403);
  }
  app = platform({ user: testUser });
  assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET(new Request("https://saasfolio.tech/api/admin/inquiries"))).status, 200);
  app = platform({ user: testUser, mfa: false });
  assert.equal((await app.load("app/api/admin/inquiries/route.ts").GET(new Request("https://saasfolio.tech/api/admin/inquiries"))).status, 403);
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

test("authenticator enrollment recognizes pending factors and never permits verified-factor cancellation", async () => {
  const id = "00000000-0000-4000-8000-000000000010";
  let app = platform({ user: testUser, factors: [{ id, factor_type: "totp", status: "unverified" }] });
  let route = app.load("app/api/auth/mfa/route.ts");
  assert.equal((await (await route.GET()).json()).factors[0].status, "unverified");
  assert.equal((await route.POST(request("/api/auth/mfa", { action: "verify", factorId: id, code: "123456" }))).status, 200);
  assert.equal(app.authCalls[0].action, "verify");
  assert.equal((await route.POST(request("/api/auth/mfa", { action: "verify", factorId: "00000000-0000-4000-8000-000000000011", code: "123456" }))).status, 400);
  app = platform({ user: testUser, mfa: false, factors: [{ id, factor_type: "totp", status: "verified" }] }); route = app.load("app/api/auth/mfa/route.ts");
  assert.equal((await route.POST(request("/api/auth/mfa", { action: "cancel", factorId: id }))).status, 403);
  assert.equal((await route.POST(request("/api/auth/mfa", { action: "enroll" }))).status, 403);
  assert.equal(app.authCalls.length, 0);
});
test("account deletion verifies the explicit request and database authentication before provider removal", async () => {
  const input = { email: testUser.email, confirmation: "DELETE MY ACCOUNT" };
  let app = platform({ user: testUser, rpc: { prepare_account_deletion: { data: null, error: { code: "42501" } } } });
  assert.equal((await app.load("app/api/account/deletion/route.ts").POST(request("/api/account/deletion", input))).status, 403);
  assert.equal(app.authCalls.length, 0);
  app = platform({ user: testUser });
  assert.equal((await app.load("app/api/account/deletion/route.ts").POST(request("/api/account/deletion", { ...input, email: "other@example.test" }))).status, 400);
  assert.equal(app.rpcCalls.some(call => call.name === "prepare_account_deletion"), false);
});
test("failed account removal does not erase linked records or claim success", async () => {
  const app = platform({ user: testUser, deleteFailure: true, rpc: { prepare_account_deletion: { data: "request-id", error: null } } });
  const response = await app.load("app/api/account/deletion/route.ts").POST(request("/api/account/deletion", { email: testUser.email, confirmation: "DELETE MY ACCOUNT" }));
  assert.equal(response.status, 503); assert.equal((await response.json()).code, "ACCOUNT_DELETION_UNCONFIRMED");
  assert.equal(app.rpcCalls.some(call => call.name === "complete_account_deletion"), false);
});
test("account deletion reports incomplete cleanup honestly and supplies a repair reference", async () => {
  for (const failed of [false, true]) {
    const app = platform({ user: testUser, rpc: { prepare_account_deletion: { data: "request-id", error: null }, complete_account_deletion: { data: null, error: failed ? {} : null } } });
    const response = await app.load("app/api/account/deletion/route.ts").POST(request("/api/account/deletion", { email: testUser.email, confirmation: "DELETE MY ACCOUNT" }));
    assert.equal(response.status, failed ? 202 : 200);
    assert.equal((await response.json()).status, failed ? "pending_cleanup" : "deleted");
    assert.deepEqual(app.authCalls[0], { action: "delete", id: testUser.id, soft: false });
  }
});
test("account export is private and excludes authentication secrets and arbitrary provider metadata", async () => {
  const app = platform({ user: { ...testUser, user_metadata: { ...testUser.user_metadata, provider_token: "never-export-this-secret" } }, rows: { saved_items: [{ kind: "deal", slug: "valid-offer", created_at: "2026-10-21" }] } });
  const response = await app.load("app/api/account/export/route.ts").GET(new Request("https://saasfolio.tech/api/account/export"));
  assert.equal(response.status, 200); assert.match(response.headers.get("cache-control"), /private, no-store/); assert.match(response.headers.get("content-disposition"), /attachment/);
  const body = await response.json(); assert.equal(body.savedItems.length, 1); assert.ok(!JSON.stringify(body).includes("never-export"));
});
test("suppressed newsletter addresses do not receive a new confirmation message", async () => {
  const app = platform({ row: { id: "subscriber-id", status: "unsubscribed", delivery_suppressed: true } });
  process.env.RESEND_API_KEY = "test-provider-key"; process.env.NEWSLETTER_FROM_EMAIL = "newsletter@example.test";
  const response = await app.load("app/api/newsletter/route.ts").POST(request("/api/newsletter", { email: "bounced@example.test", consent: true }));
  assert.equal(response.status, 200); assert.equal(app.writes.length, 0);
  delete process.env.RESEND_API_KEY; delete process.env.NEWSLETTER_FROM_EMAIL;
});

test("readiness requires live dependency probes and the current schema, and caches briefly", async () => {
  const original = globalThis.fetch;
  try {
    for (const [schemaVersion, expected] of [[3, 200], [2, 503]]) {
      const app = platform(); let requests = 0;
      globalThis.fetch = async url => { requests++; return new Response(JSON.stringify(String(url).includes("platform_readiness") ? { ready: true, schemaVersion } : {}), { status: 200 }); };
      const ready = app.load("app/api/ready/route.ts");
      assert.equal((await ready.GET()).status, expected);
      assert.equal((await ready.GET()).status, expected); assert.equal(requests, 2);
      const body = await (await ready.GET()).json(); assert.equal(body.checks, undefined); assert.ok(!JSON.stringify(body).includes("test-service"));
    }
    const app = platform(); globalThis.fetch = async () => { throw new Error("provider outage with private credentials"); };
    assert.equal((await app.load("app/api/ready/route.ts").GET()).status, 503);
  } finally { globalThis.fetch = original; }
});
test("operational status rejects placeholder, missing and incorrect monitoring credentials", async () => {
  const app = platform(); const { authorizedMonitor } = app.load("lib/server/readiness.ts");
  try {
    process.env.MONITORING_TOKEN = "replace-with-a-long-random-monitoring-secret";
    assert.equal(authorizedMonitor(new Request("https://saasfolio.tech", { headers: { authorization: `Bearer ${process.env.MONITORING_TOKEN}` } })), false);
    process.env.MONITORING_TOKEN = "a1b2c3d4e5f6".repeat(4);
    assert.equal(authorizedMonitor(new Request("https://saasfolio.tech")), false);
    assert.equal(authorizedMonitor(new Request("https://saasfolio.tech", { headers: { authorization: "Bearer incorrect" } })), false);
    assert.equal(authorizedMonitor(new Request("https://saasfolio.tech", { headers: { authorization: `Bearer ${process.env.MONITORING_TOKEN}` } })), true);
  } finally { delete process.env.MONITORING_TOKEN; }
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

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";

// Real Next request/response cookie behavior; Auth network calls are replaced.
// No real session, provider account, email or database is read or written.
const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
// This installed release still exports the matcher test helper under its
// previous name, although its local guide calls it doesProxyMatch.
const { unstable_doesMiddlewareMatch: doesProxyMatch } = require("next/experimental/testing/server");
const prefix = "sb-test-project-auth-token";
const source = readFileSync(new URL("../proxy.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

function app(options = {}) {
  const calls = [];
  const loaded = { exports: {} };
  new Function("require", "module", "exports", compiled)(name => {
    if (name === "@/lib/auth-config") return { supabasePublicConfig: () => options.unconfigured ? null : { url: "https://test-project.supabase.co", key: "test-public-key" } };
    if (name === "@supabase/ssr") return { createServerClient(url, key, settings) {
      calls.push({ url, key, settings });
      return { auth: { async getUser() {
        calls.push({ action: "getUser", before: settings.cookies.getAll() });
        for (const batch of options.batches || []) settings.cookies.setAll(batch);
        if (options.throw) throw new Error("provider-private-detail");
        return { data: { user: options.noUser ? null : { id: "private-user-id", email: "private@example.com" } }, error: options.error || null };
      } } };
    } };
    return require(name);
  }, loaded, loaded.exports);
  return { ...loaded.exports, calls };
}

const request = cookie => new NextRequest("https://saasfolio.tech/admin", {
  headers: { ...(cookie ? { cookie } : {}), authorization: "Bearer incoming-browser-value", "x-request-context": "preserve-upstream-only" },
});

test("the refresh proxy matches only actual admin Server Component routes", () => {
  const { config } = app();
  for (const url of ["/admin", "/admin/review"]) assert.equal(doesProxyMatch({ config, nextConfig: {}, url }), true);
  for (const url of ["/", "/discounts/semrush", "/login", "/api/auth/session", "/api/admin/inquiries", "/_next/static/test.js"]) assert.equal(doesProxyMatch({ config, nextConfig: {}, url }), false);
});

test("anonymous, local-only, verifier-only and unconfigured requests do not contact Auth", async () => {
  for (const [options, cookie] of [[{}, ""], [{}, "saasfolio_session=local-demo-token"], [{}, `${prefix}-code-verifier=pkce-verifier`], [{}, "sb-another-project-auth-token=unrelated"], [{ unconfigured: true }, `${prefix}=old-session`]]) {
    const instance = app(options);
    const response = await instance.proxy(request(cookie));
    assert.equal(instance.calls.length, 0);
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
    assert.equal(response.cookies.getAll().length, 0);
  }
});

test("rotated chunked cookies and deletions reach both this render and the browser", async t => {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  t.after(() => { if (previous === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = previous; });
  const instance = app({ batches: [
    [{ name: prefix, value: "", options: { maxAge: 0 } }, { name: `${prefix}.0`, value: "rotated-first", options: { maxAge: 3600, domain: ".untrusted.example", httpOnly: false, sameSite: "none", path: "/wrong" } }],
    [{ name: `${prefix}.1`, value: "rotated-second", options: { maxAge: 3600 } }, { name: `${prefix}.2`, value: "", options: { maxAge: 0 } }],
  ] });
  const incoming = request(`${prefix}=old-unsplit; ${prefix}.0=old-first; ${prefix}.2=old-extra; ordinary=keep`);
  const response = await instance.proxy(incoming);
  assert.equal(instance.calls.filter(call => call.action === "getUser").length, 1);
  assert.equal(incoming.cookies.get(prefix), undefined);
  assert.equal(incoming.cookies.get(`${prefix}.0`)?.value, "rotated-first");
  assert.equal(incoming.cookies.get(`${prefix}.1`)?.value, "rotated-second");
  assert.equal(incoming.cookies.get(`${prefix}.2`), undefined);
  assert.equal(incoming.cookies.get("ordinary")?.value, "keep");
  const forwarded = response.headers.get("x-middleware-request-cookie");
  assert.ok(forwarded.includes(`${prefix}.0=rotated-first`) && forwarded.includes(`${prefix}.1=rotated-second`));
  assert.ok(!forwarded.includes("old-unsplit") && !forwarded.includes("old-extra"));
  assert.equal(response.cookies.get(prefix)?.maxAge, 0);
  assert.equal(response.cookies.get(`${prefix}.2`)?.maxAge, 0);
  for (const name of [`${prefix}.0`, `${prefix}.1`]) {
    const cookie = response.cookies.get(name);
    assert.equal(cookie.httpOnly, true);
    assert.equal(cookie.secure, true);
    assert.equal(cookie.sameSite, "lax");
    assert.equal(cookie.path, "/");
    assert.equal(cookie.domain, undefined);
  }
  assert.equal(response.headers.get("x-middleware-request-x-request-context"), "preserve-upstream-only");
  // Next consumes x-middleware-request-* internally. Credentials must never be
  // copied to ordinary browser response headers or invented identity headers.
  for (const name of ["cookie", "authorization", "x-user-id", "x-user-email", "x-request-context"]) assert.equal(response.headers.get(name), null);
  assert.match(response.headers.get("cache-control"), /private.*no-store/);
  assert.equal(response.headers.get("pragma"), "no-cache");
});

test("invalid sessions carry SDK cookie deletion to the page's independent authorization check", async () => {
  const instance = app({ noUser: true, error: { status: 401 }, batches: [[{ name: `${prefix}.0`, value: "", options: { expires: new Date(0) } }]] });
  const incoming = request(`${prefix}.0=invalid-cookie`);
  const response = await instance.proxy(incoming);
  assert.equal(response.headers.get("x-middleware-next"), "1");
  assert.equal(incoming.cookies.get(`${prefix}.0`), undefined);
  assert.equal(response.cookies.get(`${prefix}.0`)?.value, "");
  assert.equal(response.headers.get("x-user-id"), null);
});

test("provider outages and thrown failures return generic unavailable responses without fabricated credentials", async () => {
  for (const options of [{ error: { status: 503, message: "provider-private-detail" } }, { throw: true }]) {
    const instance = app(options);
    const response = await instance.proxy(request(`${prefix}=existing-session`));
    assert.equal(response.status, 503);
    assert.equal(response.headers.get("x-middleware-next"), null);
    assert.equal(response.cookies.getAll().length, 0);
    assert.equal(response.headers.get("authorization"), null);
    assert.doesNotMatch(await response.text(), /provider-private-detail|private-user-id|private@example.com|existing-session/);
    assert.match(response.headers.get("cache-control"), /private.*no-store/);
  }
});

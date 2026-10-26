import test from "node:test";
import assert from "node:assert/strict";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const { verifyCodeLocally } = loadCatalogModule("lib/code-verification.ts");
const input = { code: "MADEUP2026", codeType: "coupon", toolName: "Hostinger", websiteUrl: "https://hostinger.com", discountPercentage: 20 };

test("well-formed invented coupon and referral codes remain unreviewed without any network request", t => {
  const network = t.mock.method(globalThis, "fetch", () => { throw new Error("Input preflight must not request a website or checkout"); });
  for (const codeType of ["coupon", "referral", "discount"]) {
    const report = verifyCodeLocally({ ...input, codeType });
    assert.equal(report.valid, true);
    assert.equal(report.status, "pending_review");
    assert.equal(report.reviewStatus, "pending");
    assert.equal(report.recommendedBadge, "UNREVIEWED SUBMISSION");
    assert.equal(report.score, 0);
    assert.ok(report.checks.every(check => check.score === 0));
    assert.equal(report.sourceChecked, false);
    assert.equal(report.checkoutTested, false);
    assert.equal(report.scope, "input-preflight");
    assert.ok(!report.checks.some(check => check.id === "uniqueness"));
    assert.match(report.summary, /Submit.*editorial review/);
    assert.doesNotMatch(report.summary, /confidence|queued|active|success rate/i);
  }
  assert.equal(network.mock.callCount(), 0);
});

test("unknown brands can submit details without inferred website ownership or automatic catalog admission", () => {
  const report = verifyCodeLocally({ ...input, toolName: "A New Provider", websiteUrl: "https://hostinger.com.evil.example" });
  assert.equal(report.valid, true);
  assert.equal(report.matchedBrand, undefined);
  assert.equal(report.status, "pending_review");
  assert.equal(report.sourceChecked, false);
  assert.doesNotMatch(report.checks.map(check => check.detail).join(" "), /ready for directory ingestion|registered SaaS brand|live.*verified/i);
});

test("URL checks reject private, credentialed and local targets rather than calling them secure vendors", () => {
  for (const websiteUrl of ["http://hostinger.com", "https://127.0.0.1", "https://[::1]", "https://name:password@example.com", "https://service.internal", "https://site.localhost", "https://host.home.arpa"]) {
    const report = verifyCodeLocally({ ...input, websiteUrl });
    assert.equal(report.valid, false, websiteUrl);
    assert.equal(report.status, "needs_changes");
    assert.equal(report.checks.find(check => check.id === "domain").passed, false);
    assert.equal(report.sourceChecked, false);
  }
});

test("reported percentages are format checks, including the full supported range", () => {
  for (const discountPercentage of [0, 20, 100]) {
    const report = verifyCodeLocally({ ...input, discountPercentage });
    assert.equal(report.valid, true);
    assert.equal(report.status, "pending_review");
    assert.equal(report.checkoutTested, false);
  }
  for (const discountPercentage of [-1, 101, Infinity, NaN]) {
    const report = verifyCodeLocally({ ...input, discountPercentage });
    assert.equal(report.valid, false);
    assert.equal(report.checks.find(check => check.id === "discount_amount").passed, false);
  }
});

test("expiry input accepts real future dates without asserting a promotion is fresh", () => {
  for (const expirationDate of ["", "2099-01-01"]) assert.equal(verifyCodeLocally({ ...input, expirationDate }).valid, true);
  for (const expirationDate of ["2099-02-31", "2000-01-01", "soon", "2099-13-01"]) {
    const report = verifyCodeLocally({ ...input, expirationDate });
    assert.equal(report.valid, false, expirationDate);
    assert.equal(report.checks.find(check => check.id === "expiration").passed, false);
  }
});

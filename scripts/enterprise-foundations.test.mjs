import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { EventEmitter } from "node:events";
import { Readable } from "node:stream";
import { operationalRecord, routeTemplate, catalogFreshness } from "../lib/observability.mjs";
import { validateManagedPayload, validateManagedCatalog, managedPublicIndex, managedBrand } from "../lib/managed-catalog.mjs";
import { validateManagedRelease } from "../lib/managed-release.mjs";
import { verifyDeliverySignature } from "../lib/webhook-signature.mjs";
import { analyticsConsent, publicAnalyticsPath, productAnalyticsFields } from "../lib/analytics-policy.mjs";
import { pinnedPublicPage, publicResolvedAddresses, checkOfferSource } from "../lib/server/source-fetch.mjs";

const now = Date.now();
const brand = { name: "Example Brand", categorySlug: "productivity", website: "https://example.com", pricingUrl: "https://example.com/pricing", description: "A specific productivity platform for independent teams to organize their working knowledge.", longDescription: "This profile explains the actual product and its audience. ".repeat(6), keyFeatures: ["Shared documents", "Team knowledge", "Project organization"], pricingModel: "Paid", reviewedAt: new Date(now).toISOString().slice(0, 10) };
const offer = { toolSlug: "example", title: "Example first-purchase offer", dealType: "coupon", code: "SAVE20", discountPercentage: 20, sourceKind: "vendor", sourceUrl: "https://example.com/coupons", destinationUrl: "https://example.com/pricing", evidence: ["SAVE20", "20% off your first purchase"], terms: "New customers only, on the eligible annual plan. Check continuing costs and provider eligibility. Checkout has not been tested." };
const publication = (kind, slug, payload) => ({ kind, slug, payload, revision: 1, retired: false, publishedAt: new Date(now).toISOString() });
const release = entries => ({ schemaVersion: 1, revision: 1, publishedAt: new Date(now).toISOString(), entries });
const publishedOffer = () => publication("offer", "example-code", { ...offer, checkedAt: new Date(now).toISOString(), contentHash: "a".repeat(64) });

test("operational records omit secrets, user content, raw errors and URL parameters", () => {
  const output = operationalRecord("request.failed", { route: "/reset-password?token=secret", errorName: "TypeError", message: "password=secret", stack: "secret", cookie: "session", status: 503, requestId: "id-with-newline\nprivate" });
  assert.equal(output.route, "/reset-password"); assert.equal(output.requestId, "unknown");
  assert.ok(!JSON.stringify(output).includes("secret")); assert.equal(output.errorName, "TypeError");
  assert.equal(routeTemplate("/discounts/private-customer-name?email=a@b.test"), "/discounts/[slug]");
});
test("readiness distinguishes source freshness from fetch failures without inventing dates", () => {
  const value = catalogFreshness({ lastRun: new Date(now).toISOString(), sources: { good: { status: "ok", checkedAt: new Date(now - 1000).toISOString() }, future: { status: "ok", checkedAt: new Date(now + 1000).toISOString() }, failed: { status: "error" } } }, now);
  assert.equal(value.currentSources, 1); assert.equal(value.failedSources, 1); assert.equal(value.status, "current");
  assert.equal(catalogFreshness({ lastRun: new Date(now - 27 * 3600000).toISOString() }, now).status, "stale");
});
test("managed drafts cannot submit verification flags, check timestamps, ratings or prototype keys", () => {
  assert.deepEqual(validateManagedPayload("brand", "example", brand), brand);
  for (const extra of [{ rating: 5 }, { verified: true }, { reviewCount: 100 }, JSON.parse('{"__proto__":{"polluted":true}}')]) assert.throws(() => validateManagedPayload("brand", "example", { ...brand, ...extra }));
  assert.throws(() => validateManagedPayload("offer", "example-code", { ...offer, checkedAt: new Date().toISOString() }));
  assert.throws(() => validateManagedPayload("offer", "example-code", { ...offer, evidence: ["SAVE20 gives 120% off"] }));
  assert.throws(() => validateManagedPayload("brand", "example", { ...brand, reviewedAt: "2026-02-31" }));
  assert.equal(managedBrand(publication("brand", "example", brand)).rating, 0);
});
test("release validation preserves offer identities and requires original guide coverage", () => {
  const item = publishedOffer();
  const context = { tools: [{ slug: "example", ...brand }], guideSlugs: ["example"] };
  assert.equal(validateManagedRelease(release([item]), context).entries.length, 1);
  assert.throws(() => validateManagedRelease(release([item]), { ...context, offerIdentities: { "example-code": "different-brand" } }));
  assert.throws(() => validateManagedRelease(release([{ ...item, payload: { ...item.payload, destinationUrl: "https://other.example/" } }]), context));
  assert.throws(() => validateManagedRelease(release([publication("brand", "new-brand", { ...brand, name: "Different Name" })]), context), /guide/);
  assert.throws(() => validateManagedRelease(release([publication("brand", "duplicate", brand)]), context), /Duplicate/);
  assert.throws(() => validateManagedRelease(release([]), { ...context, previous: release([item]) }), /Retire/);
  const compact = managedPublicIndex({ ...release([item]), entries: [item, { kind: "guide", slug: "example", retired: true, payload: { privateDraft: "never project guide bodies" } }] });
  assert.equal(compact.entries.length, 1); assert.deepEqual(compact.retiredGuideSlugs, ["example"]); assert.ok(!JSON.stringify(compact).includes("privateDraft"));
  assert.throws(() => validateManagedCatalog(release([item, item])), /Duplicate/);
});
test("optional analytics defaults off, expires and excludes private routes and URL parameters", () => {
  for (const input of [null, "invalid", '{}', JSON.stringify({ version: 1, allowed: true, at: now + 1000 }), JSON.stringify({ version: 1, allowed: true, at: now - 181 * 86400000 })]) assert.equal(analyticsConsent(input, now), null);
  assert.equal(analyticsConsent(JSON.stringify({ version: 1, allowed: false, at: now }), now), false);
  assert.equal(publicAnalyticsPath("/discounts/example?email=private#token"), "/discounts/example");
  for (const path of ["/profile", "/admin", "/login", "/contact", "/submit", "/newsletter/confirm?token=secret", "/u/private", "/api/auth/login"]) assert.equal(publicAnalyticsPath(path), null);
});
test("delivery signatures cover raw bytes, reject stale/future replays and support key rotation signatures", () => {
  const key = Buffer.alloc(32, 7); const secret = `whsec_${key.toString("base64")}`;
  const body = Buffer.from('{"type":"email.bounced","data":{"to":["person@example.test"]}}');
  const timestamp = String(Math.floor(now / 1000)); const id = "msg_test-1";
  const signature = createHmac("sha256", key).update(`${id}.${timestamp}.`).update(body).digest("base64");
  const headers = new Headers({ "svix-id": id, "svix-timestamp": timestamp, "svix-signature": `v2,ignored v1,${signature}` });
  assert.equal(verifyDeliverySignature(body, headers, secret, now), true);
  assert.equal(verifyDeliverySignature(Buffer.from(body.toString()+" "), headers, secret, now), false);
  assert.equal(verifyDeliverySignature(body, headers, secret, now + 301000), false);
  assert.equal(verifyDeliverySignature(body, headers, secret, now - 301000), false);
  assert.equal(verifyDeliverySignature(body, new Headers(), secret, now), false);
});
test("product events omit search text, coupon values, personal data and unknown fields", () => {
  assert.deepEqual(productAnalyticsFields("search_results", { scope: "brands", resultCount: 0, query: "private@example.test", coupon: "SECRET", arbitrary: "private" }), { search_scope: "brands", result_count: 0, has_results: false });
  assert.deepEqual(productAnalyticsFields("coupon_copy", { result: "manual", code: "SECRET" }), { copy_result: "manual" });
  assert.deepEqual(productAnalyticsFields("offer_report", { offerSlug: "example-code", email: "private@example.test" }), { offer_slug: "example-code" });
  for (const [name, fields] of [["unknown", {}], ["search_results", { scope: "private@example.test", resultCount: 1 }], ["search_results", { scope: "all", resultCount: -1 }], ["offer_report", { offerSlug: "example?email=private" }]]) assert.equal(productAnalyticsFields(name, fields), null);
});
test("source checks reject mixed public/private DNS answers and pin the actual connection", async () => {
  assert.equal(publicResolvedAddresses([{ address: "93.184.216.34", family: 4 }, { address: "127.0.0.1", family: 4 }]), false);
  assert.equal(publicResolvedAddresses([{ address: "::1", family: 6 }]), false);
  let contacted = false;
  await assert.rejects(() => pinnedPublicPage("https://example.com", { lookupImpl: async () => [{ address: "10.0.0.1", family: 4 }], requestImpl: () => { contacted = true; } }));
  assert.equal(contacted, false);
  let lookupCount = 0;
  const result = await pinnedPublicPage("https://example.com/coupons", { lookupImpl: async () => { lookupCount++; return [{ address: "93.184.216.34", family: 4 }]; }, requestImpl: (options, callback) => {
    options.lookup("example.com", {}, (error, address) => { assert.ifError(error); assert.equal(address, "93.184.216.34"); });
    const request = new EventEmitter(); request.end = () => { const response = Readable.from([Buffer.from("Public source page")]); response.statusCode = 200; response.headers = { "content-type": "text/html" }; callback(response); }; return request;
  } });
  assert.equal(lookupCount, 1); assert.equal(result.status, 200);
});
test("source checks refuse unrelated redirects and nonstandard ports", async () => {
  await assert.rejects(() => pinnedPublicPage("https://example.com:8443"));
  await assert.rejects(() => pinnedPublicPage("https://example.com", { lookupImpl: async () => [{ address: "93.184.216.34", family: 4 }], requestImpl: (_options, callback) => {
    const request = new EventEmitter(); request.end = () => { const response = Readable.from([]); response.statusCode = 302; response.headers = { location: "https://other.example/" }; callback(response); }; return request;
  } }), /outside/);
});
test("source checks respect robots and never use an unrelated vendor destination", async () => {
  let calls = 0;
  const getPage = async () => { calls++; return { status: 200, html: "User-agent: *\nDisallow: /coupons" }; };
  await assert.rejects(() => checkOfferSource(offer, brand.website, { getPage }), /disallows/); assert.equal(calls, 1);
  await assert.rejects(() => checkOfferSource({ ...offer, destinationUrl: "https://unrelated.example/" }, brand.website, { getPage }), /provider/); assert.equal(calls, 1);
});

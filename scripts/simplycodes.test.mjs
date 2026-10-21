import test from "node:test";
import assert from "node:assert/strict";
import { parseSimplyCodes, parseReaSimplyCodes, compareDiscoveryCandidates } from "./lib/simplycodes.mjs";
import { retryAfterSeconds, sourceBackoff, shouldAttemptSource } from "./lib/source-backoff.mjs";
import { fetchPublicPage, hash } from "./lib/offer-sources.mjs";

const options = { sourceUrl: "https://simplycodes.com/store/example.com", toolSlug: "example", observedAt: "2026-10-21T03:00:00.000Z" };
// Constructed fixtures exercise the fields observed on public store pages.
// They are not claimed to be a captured production DOM or a recovered code.
const html = `<!doctype html><html><body>
<nav><h3>90% off</h3><code>UNRELATED</code></nav>
<h1>Example Promo Codes &amp; Coupons</h1>
<h2>Today's Example promo codes &amp; verification report</h2>
<article><h3>30% off</h3><p>Verified</p><button>Show Code</button>
<p>30% Off Annual Plan (members Only) at Example w/Code</p>
<p>Last used: 9h ago</p><p>Uses today: 4</p><p>Health: 99%</p>
<h3>About this code</h3><dl><dt>Total uses</dt><dd>28K</dd><dt>Verifications</dt><dd>78</dd></dl>
<h4>Code restrictions</h4><ul><li>members</li><li>annual billing</li></ul>
<script type="application/ld+json">{"couponCode":"HIDDEN"}</script><code hidden>SECRET</code></article>
<article><h3>20% off</h3><p>Community Code</p><code>PUBLIC20</code><button>Show Code</button>
<p>Last used: 1w ago</p><p>Uses today: 2</p><p>Last Verified: 1w ago</p></article>
<h2>Similar Deals</h2><h3>80% off</h3><code>COMPETITOR80</code>
</body></html>`;

test("store parser keeps card provenance, conditions and reported health separate", () => {
  const report = parseSimplyCodes(html, options);
  assert.equal(report.status, "parsed");
  assert.equal(report.offers.length, 2);
  const [first, second] = report.offers;
  assert.equal(first.code, null);
  assert.equal(first.status, "hidden-code");
  assert.equal(first.reportedHealthPercent, 99);
  assert.equal(first.reportedLastUsed, "9h ago");
  assert.equal(first.reportedUsesToday, 4);
  assert.equal(first.reportedTotalUses, 28000);
  assert.equal(first.reportedVerificationCount, 78);
  assert.deepEqual(first.restrictions, ["members", "annual billing"]);
  assert.equal(first.checkoutTested, false);
  assert.equal(first.sourceOfferId, null);
  assert.equal(first.expiresAt, null);
  assert.equal(second.code, "PUBLIC20");
  assert.equal(second.status, "needs-review");
  assert.equal(second.reportedVerification, "community-submission");
  assert.equal(second.reportedLastVerified, "1w ago");
  assert.deepEqual(second.restrictions, []);
});
test("review ordering prioritizes an inspectable code without inventing a success rate", () => {
  const report = parseSimplyCodes(html, options);
  report.offers.sort(compareDiscoveryCandidates);
  assert.equal(report.offers[0].code, "PUBLIC20");
  assert.equal(report.offers[0].successRate, undefined);
  assert.equal(report.offers[0].verifiedAt, undefined);
});
test("a reported code retains its candidate identity when another card disappears", () => {
  const original = parseSimplyCodes(html, options).offers.find(offer => offer.code);
  const changed = parseSimplyCodes(html.replace(/<article>[\s\S]*?<\/article>/, ""), options).offers.find(offer => offer.code);
  assert.equal(original.candidateId, changed.candidateId);
  assert.notEqual(original.sourcePosition, changed.sourcePosition);
});
test("non-store sources, changed layouts and challenge pages cannot create coupons", () => {
  assert.throws(() => parseSimplyCodes(html, { ...options, sourceUrl: "https://simplycodes.com/api/coupons" }), /store URL/);
  assert.equal(parseSimplyCodes("<h1>Attention Required!</h1><p>Sorry, you have been blocked</p>", options).status, "blocked");
  assert.equal(parseSimplyCodes("<h1>50% off a competitor</h1>", options).status, "unrecognized");
  assert.equal(parseSimplyCodes("<h1>50% off a competitor</h1>", options).offers.length, 0);
});
test("REA importer validates retained DOM bytes and preserves original observation time", () => {
  const capture = { operation: "capture_browser_scenario", evidence_id: `ev_${"a".repeat(64)}`, normalized_result: { steps: [
    { after_url: { url: options.sourceUrl }, artifacts: { dom: { state: "captured", value: { text: html, sha256: hash(html), bytes: Buffer.byteLength(html) } } } },
  ] } };
  const report = parseReaSimplyCodes(capture, options);
  assert.equal(report.evidenceId, capture.evidence_id);
  assert.equal(report.observedAt, options.observedAt);
  assert.throws(() => parseReaSimplyCodes(capture, { ...options, observedAt: undefined }), /original capture/);
  capture.normalized_result.steps[0].artifacts.dom.value.text += "tampered";
  assert.throws(() => parseReaSimplyCodes(capture, options), /digest/);
});
test("server retry policies preserve evidence dates and honor Retry-After", async () => {
  const now = Date.parse(options.observedAt);
  assert.equal(retryAfterSeconds("120", now), 120);
  assert.equal(retryAfterSeconds(new Date(now + 180000).toUTCString(), now), 180);
  assert.equal(retryAfterSeconds("invalid", now), null);
  let failure;
  try {
    await fetchPublicPage("https://example.com", { fetchImpl: async () => new Response("Busy", { status: 429, headers: { "retry-after": "7200" } }) });
  } catch (error) { failure = error; }
  const blocked = sourceBackoff({ failureCount: 1 }, failure, now);
  assert.equal(blocked.httpStatus, 429);
  assert.equal(blocked.failureCount, 2);
  assert.equal(Date.parse(blocked.nextAttemptAt), now + 7200000);
  assert.equal(shouldAttemptSource(blocked, now), false);
  assert.equal(shouldAttemptSource(blocked, now + 7200000), true);
  assert.equal(sourceBackoff({}, { status: 403 }, now).nextAttemptAt, new Date(now + 86400000).toISOString());
  assert.equal(blocked.checkedAt, undefined);
});

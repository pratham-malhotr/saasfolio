import test from "node:test";
import assert from "node:assert/strict";
import { buildOfferReviewQueue } from "../lib/offer-operations.mjs";

const now = Date.parse("2026-10-29T12:00:00Z"), DAY = 86400000;
const at = offset => new Date(now + offset * DAY).toISOString();
const offer = overrides => ({ slug: "example-code", title: "Example offer", toolSlug: "example", sourceKey: "reviewed:example-code", sourceUrl: "https://example.com/offers", checkedAt: at(-1), ...overrides });
const source = overrides => ({ toolSlug: "example", url: "https://example.com/offers", status: "ok", checkedAt: at(-1), ...overrides });

test("offer reviews retain evidence dates and distinguish blocked requests from invalid offers", () => {
  const snapshot = { lastRun: at(0), sources: { "reviewed:example-code": source({ status: "error", httpStatus: 403, lastAttemptAt: at(0), nextAttemptAt: at(1), error: "secret implementation details" }) }, offers: [offer({})] };
  const before = structuredClone(snapshot);
  const queue = buildOfferReviewQueue(snapshot, { now });
  assert.deepEqual(queue.items[0].reasons, ["blocked"]);
  assert.equal(queue.items[0].checkedAt, at(-1));
  assert.equal(queue.items[0].nextAttemptAt, at(1));
  assert.equal(queue.items[0].offers[0].checkedAt, at(-1));
  assert.ok(!JSON.stringify(queue).includes("secret"));
  assert.deepEqual(snapshot, before);
});
test("the queue orders removed and expired evidence before retryable failures and approaching expiry", () => {
  const queue = buildOfferReviewQueue({ sources: { removed: source({ httpStatus: 410, status: "error" }), retry: source({ status: "error", httpStatus: 503 }) }, offers: [offer({ sourceKey: "expired", slug: "expired", expiryDate: at(0) }), offer({ sourceKey: "soon", slug: "soon", expiryDate: at(7) }), offer({ sourceKey: "later", slug: "later", expiryDate: at(8) })] }, { now });
  assert.deepEqual(queue.items.map(item => item.id), ["removed", "expired", "retry", "soon"]);
  assert.equal(queue.counts.expired, 1); assert.equal(queue.counts.expiring, 1);
});
test("a successful source request cannot renew stale, future or missing offer evidence", () => {
  const queue = buildOfferReviewQueue({ sources: { current: source({ checkedAt: at(0) }), missing: source({ checkedAt: null }) }, offers: [offer({ sourceKey: "current", checkedAt: at(-14) }), offer({ sourceKey: "future", slug: "future", checkedAt: at(1) })] }, { now });
  assert.equal(queue.counts.stale, 3);
  assert.deepEqual(queue.items.find(item => item.id === "current").reasons, ["stale"]);
  assert.equal(queue.items.find(item => item.id === "future").checkedAt, null);
  const safe = buildOfferReviewQueue({ sources: { bad: source({ url: "https://user:password@example.com", checkedAt: "invalid" }) } }, { now });
  assert.equal(safe.items[0].sourceUrl, null);
});
test("changed evidence is tied to the current observation and older candidates do not reopen a resolved issue", () => {
  const candidate = { toolSlug: "example", sourceUrl: "https://example.com/offers", status: "evidence-changed", observedAt: at(-1) };
  assert.deepEqual(buildOfferReviewQueue({ sources: { reviewed: source({}) }, candidates: [candidate] }, { now }).items[0].reasons, ["evidence_changed"]);
  assert.equal(buildOfferReviewQueue({ sources: { reviewed: source({ checkedAt: at(0) }) }, candidates: [candidate] }, { now }).total, 0);
});
test("managed revisions supersede older observations, retain current withdrawals and exclude retired offers", () => {
  const managed = offer({ managedRevision: 2, checkedAt: at(0) });
  const older = { sources: { "reviewed:example-code": source({ managedRevision: 1, status: "error", httpStatus: 404 }) }, offers: [offer({ checkedAt: at(-20) })] };
  assert.equal(buildOfferReviewQueue(older, { now, managedOffers: [managed] }).total, 0);
  const withdrawn = { sources: { "reviewed:example-code": source({ managedRevision: 2, checkedAt: at(0) }) }, offers: [] };
  assert.deepEqual(buildOfferReviewQueue(withdrawn, { now, managedOffers: [managed] }).items[0].reasons, ["evidence_changed"]);
  assert.equal(buildOfferReviewQueue(older, { now, retiredOffers: ["example-code"] }).total, 0);
});

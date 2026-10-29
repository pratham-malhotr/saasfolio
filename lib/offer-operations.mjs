import { normalizePublicHttpsUrl } from "./public-url.mjs";

const DAY = 86400000;
export const OFFER_REVIEW_REASONS = ["removed", "expired", "evidence_changed", "blocked", "unavailable", "stale", "expiring"];
const timestamp = value => {
  const parsed = typeof value === "string" ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
};
const recordedDate = value => timestamp(value) === null ? null : new Date(timestamp(value)).toISOString();

// This queue describes recorded evidence, never checkout acceptance. Building it
// makes no network requests and does not renew evidence or bypass crawl backoff.
/** @param {object} snapshot
 * @param {{now?: number, managedOffers?: Array<Record<string, any>>, retiredOffers?: string[]}} [options]
 */
export function buildOfferReviewQueue(snapshot, { now = Date.now(), managedOffers = [], retiredOffers = [] } = {}) {
  const retired = new Set(retiredOffers);
  const managed = new Map(managedOffers.map(offer => [offer.slug, offer]));
  const groups = new Map();
  const collectedOffers = snapshot.offers || [];
  for (const [key, observation] of Object.entries(snapshot.sources || {})) {
    if (key.startsWith("reviewed:") && retired.has(key.slice(9))) continue;
    const replacement = key.startsWith("reviewed:") ? managed.get(key.slice(9)) : null;
    // A failed observation of an older managed revision cannot describe a new
    // publication. Its approved source evidence is used until its own recheck.
    const source = replacement && observation.managedRevision !== replacement.managedRevision ? {} : observation;
    groups.set(key, { key, source, toolSlug: replacement?.toolSlug || observation.toolSlug, sourceUrl: replacement?.sourceUrl || observation.url, offers: [] });
  }
  for (const offer of [...collectedOffers.filter(offer => !managed.has(offer.slug)), ...managedOffers]) {
    if (retired.has(offer.slug)) continue;
    if (!groups.has(offer.sourceKey)) groups.set(offer.sourceKey, { key: offer.sourceKey, source: {}, toolSlug: offer.toolSlug, sourceUrl: offer.sourceUrl, offers: [] });
    const group = groups.get(offer.sourceKey);
    const renewed = managed.has(offer.slug) && group.source.status === "ok" && timestamp(group.source.checkedAt) >= timestamp(offer.checkedAt)
      ? collectedOffers.find(item => item.slug === offer.slug) : null;
    group.offers.push(renewed || offer);
  }
  const changed = new Set((snapshot.candidates || []).filter(candidate => candidate.status === "evidence-changed").map(candidate => `${candidate.toolSlug}|${candidate.sourceUrl}|${candidate.observedAt}`));
  const counts = Object.fromEntries(OFFER_REVIEW_REASONS.map(reason => [reason, 0]));
  const items = [];
  for (const group of groups.values()) {
    const { source, offers } = group;
    const reasons = new Set();
    const removed = [404, 410].includes(source.httpStatus);
    if (removed) reasons.add("removed");
    else if (source.status === "error") reasons.add([401, 403, 429].includes(source.httpStatus) || /robots|challenge|host paused/i.test(source.error || "") ? "blocked" : "unavailable");
    if (changed.has(`${group.toolSlug}|${group.sourceUrl}|${source.checkedAt}`)) reasons.add("evidence_changed");
    const observations = [source.checkedAt, ...offers.map(offer => offer.checkedAt)].map(timestamp).filter(value => value !== null && value <= now);
    const latest = observations.length ? Math.max(...observations) : null;
    if (latest === null || now - latest >= 14 * DAY) reasons.add("stale");
    // An offer can age out independently of a successful source fetch that did
    // not establish that particular offer's wording.
    for (const offer of offers) {
      const checked = timestamp(offer.checkedAt), expiry = timestamp(offer.expiryDate);
      if (checked === null || checked > now || now - checked >= 14 * DAY) reasons.add("stale");
      if (offer.expiryDate && expiry === null) reasons.add("evidence_changed");
      else if (expiry !== null && expiry <= now) reasons.add("expired");
      else if (expiry !== null && expiry - now <= 7 * DAY) reasons.add("expiring");
      if (managed.has(offer.slug) && source.status === "ok" && timestamp(source.checkedAt) >= timestamp(offer.checkedAt) && !collectedOffers.some(item => item.slug === offer.slug)) reasons.add("evidence_changed");
    }
    if (!reasons.size) continue;
    const flags = OFFER_REVIEW_REASONS.filter(reason => reasons.has(reason));
    for (const reason of flags) counts[reason]++;
    items.push({ id: group.key, toolSlug: group.toolSlug || "", sourceUrl: normalizePublicHttpsUrl(group.sourceUrl) || null,
      reasons: flags, priority: OFFER_REVIEW_REASONS.indexOf(flags[0]), checkedAt: latest === null ? null : new Date(latest).toISOString(),
      lastAttemptAt: recordedDate(source.lastAttemptAt || source.checkedAt || source.lastSkippedAt), nextAttemptAt: recordedDate(source.nextAttemptAt),
      httpStatus: Number.isInteger(source.httpStatus) ? source.httpStatus : null,
      offers: offers.map(offer => ({ slug: offer.slug, title: offer.title, checkedAt: recordedDate(offer.checkedAt), expiryDate: recordedDate(offer.expiryDate) })) });
  }
  items.sort((a, b) => a.priority - b.priority || (timestamp(a.checkedAt) || 0) - (timestamp(b.checkedAt) || 0) || a.id.localeCompare(b.id));
  return { generatedAt: new Date(now).toISOString(), collectedAt: recordedDate(snapshot.lastRun), total: items.length, counts, items };
}

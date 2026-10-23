import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { discoverVendorOffer, extractCouponCandidates, fetchPublicPage, plainText, robotsAllows, hash } from "./lib/offer-sources.mjs";
import { parseSimplyCodes, compareDiscoveryCandidates } from "./lib/simplycodes.mjs";
import { sourceBackoff, shouldAttemptSource } from "./lib/source-backoff.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (name, fallback) => { try { return JSON.parse(await fs.readFile(path.join(root, name), "utf8")); } catch { return fallback; } };
const write = async (name, data) => fs.writeFile(path.join(root, name), `${JSON.stringify(data, null, 2)}\n`);
const extra = (await fs.readFile(path.join(root, "lib/data/brand-expansion.txt"), "utf8")).split(/\r?\n/).filter(l => l && !l.startsWith("#")).map(l => {
  const [name, slug, categorySlug, url, description, features] = l.split("|");
  return { name, slug, categorySlug, url, description, features: features.split(";") };
});
const base = await read("lib/data/catalog-seeds.json", []);
const reviewed = await read("lib/data/reviewed-offers.json", []);
const state = await read("lib/data/offer-snapshot.json", { sources: {}, offers: [], candidates: [] });
const selected = process.argv.find(a => a.startsWith("--only="))?.slice(7).split(",");
const providerLinks = await read("lib/data/provider-links.json", {});
const vendorSeeds = [...base, ...extra].filter((b, i, all) => all.findIndex(t => t.slug === b.slug) === i && (!selected || selected.includes(b.slug)) && providerLinks[b.slug]?.providerStatus !== "unavailable")
  .map(seed => ({ ...seed, url: providerLinks[seed.slug]?.pricingUrl || seed.url }));
const discoveryOnly = process.argv.includes("--discovery-only");
const jobs = discoveryOnly ? [] : vendorSeeds.map(b => ({ ...b, kind: "vendor", key: `vendor:${b.slug}` }));
if (!discoveryOnly) for (const item of reviewed) if (!selected || selected.includes(item.toolSlug)) jobs.push({ ...item, offerSlug: item.slug, slug: item.toolSlug, url: item.sourceUrl, kind: item.sourceKind, key: `reviewed:${item.slug}` });
// Public discovery pages are deliberately separate from merchant offers.
if (process.argv.includes("--discovery") || discoveryOnly) for (const source of await read("lib/data/discount-source-registry.json", [])) {
  if (!selected || selected.includes(source.toolSlug)) jobs.push({ slug: source.toolSlug,
    key: `${source.provider}:${new URL(source.url).pathname.split("/").filter(Boolean).at(-1)}`,
    url: source.url, kind: "coupon-site", provider: source.provider });
}

const robots = new Map(), hostQueue = new Map(), blockedHosts = new Map();
let sourceRequests = 0, skippedJobs = 0;
async function allowed(url) {
  const parsed = new URL(url);
  if (!robots.has(parsed.origin)) robots.set(parsed.origin, (async () => {
    try { return (await fetchPublicPage(`${parsed.origin}/robots.txt`)).html; }
    catch (error) { if (/HTTP 404|HTTP 410/.test(error.message)) return ""; throw error; }
  })());
  return robotsAllows(await robots.get(parsed.origin), parsed.pathname + parsed.search);
}
async function run(job) {
  const previous = state.sources[job.key];
  if (!shouldAttemptSource(previous)) { skippedJobs++; return; }
  const now = new Date().toISOString();
  const definitionHash = hash(JSON.stringify(job));
  try {
    // Serialize requests to the same host and keep a one-second crawl interval.
    const host = new URL(job.url).hostname;
    const pending = hostQueue.get(host) || Promise.resolve();
    let release;
    hostQueue.set(host, new Promise(resolve => { release = resolve; }));
    await pending;
    let page;
    try {
      if (blockedHosts.has(host)) {
        const blocked = blockedHosts.get(host);
        state.sources[job.key] = { ...previous, toolSlug: job.slug, url: job.url, kind: job.kind, status: "error",
          lastSkippedAt: new Date().toISOString(), nextAttemptAt: blocked.backoff.nextAttemptAt,
          httpStatus: blocked.error.status, error: `Host paused after HTTP ${blocked.error.status}; page request skipped` };
        skippedJobs++;
        return;
      }
      if (!await allowed(job.url)) throw new Error("Disallowed by robots.txt");
      sourceRequests++;
      page = await fetchPublicPage(job.url, {
        etag: previous?.definitionHash === definitionHash ? previous.etag : undefined,
        lastModified: previous?.definitionHash === definitionHash ? previous.lastModified : undefined,
      });
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally { release(); }
    if (page.unchanged) {
      if (!previous?.contentHash) throw new Error("304 without previous source evidence");
      state.sources[job.key] = { ...previous, checkedAt: now, status: "ok", error: null, failureCount: 0, nextAttemptAt: null, httpStatus: 304 };
      state.offers = state.offers.filter(o => o.sourceKey !== job.key || !job.key.startsWith("vendor:") || discoverVendorOffer(o.evidence)?.type === o.dealType)
        .map(o => o.sourceKey === job.key ? { ...o, checkedAt: now } : o);
      return;
    }
    const text = plainText(page.html);
    if (text.length < 100) throw new Error("Insufficient visible source content");
    const contentHash = hash(text);
    state.sources[job.key] = { toolSlug: job.slug, url: page.url, kind: job.kind, status: "ok", checkedAt: now, definitionHash,
      failureCount: 0, nextAttemptAt: null, httpStatus: 200,
      changedAt: previous?.contentHash === contentHash ? previous.changedAt : now, contentHash, etag: page.etag, lastModified: page.lastModified, error: null };
    state.offers = state.offers.filter(o => o.sourceKey !== job.key);
    const found = job.key.startsWith("vendor:") ? discoverVendorOffer(text) : null;
    if (found) state.offers.push({ slug: `${job.slug}-${found.type.replaceAll("_", "-")}`, toolSlug: job.slug,
      title: found.type === "free_trial" ? `${job.name} free trial` : `${job.name} free plan`, dealType: found.type,
      discountPercentage: 0, sourceUrl: page.url, destinationUrl: page.url, sourceKind: "vendor", sourceKey: job.key,
      evidence: found.evidence, checkedAt: now, updatedAt: state.sources[job.key].changedAt,
      terms: "See the provider for eligible plans, usage limits, regional availability, billing requirements, and current terms. Source checked; signup and checkout have not been tested." });
    if (job.key.startsWith("reviewed:")) {
      const evidenceFound = job.evidence.every(fragment => text.toLowerCase().includes(fragment.toLowerCase()));
      if (evidenceFound && (!job.expiryDate || Date.parse(job.expiryDate) > Date.now())) {
        const { key, url, kind, evidence, offerSlug, ...offer } = job;
        void key; void url; void kind;
        state.offers.push({ ...offer, slug: offerSlug, sourceKey: job.key, evidence: evidence.join("; "), checkedAt: now, updatedAt: state.sources[job.key].changedAt });
      } else state.candidates.push({ toolSlug: job.slug, sourceUrl: job.url, status: "evidence-changed", observedAt: now });
    }
    if (job.provider === "simplycodes") {
      const report = parseSimplyCodes(page.html, { sourceUrl: page.url, toolSlug: job.slug, observedAt: now });
      state.sources[job.key].discovery = { status: report.status, observedAt: now, offerCount: report.offers.length,
        visibleCodeCount: report.offers.filter(o => o.code).length, limitations: report.limitations };
      if (report.status === "blocked") { const error = new Error("Public store returned a browser challenge"); error.status = 403; throw error; }
      state.candidates.push(...report.offers.sort(compareDiscoveryCandidates));
    } else if (job.kind === "coupon-site") state.candidates.push(...extractCouponCandidates(page.html, page.url, job.slug).map(c => ({ ...c, observedAt: now })));
  } catch (error) {
    const backoff = sourceBackoff(previous, error);
    if (error.status === 401 || error.status === 403 || error.status === 429) blockedHosts.set(new URL(job.url).hostname, { error, backoff });
    state.sources[job.key] = { ...previous, toolSlug: job.slug, url: job.url, kind: job.kind, status: "error", lastAttemptAt: now,
      ...backoff, error: error.message };
    if ([404, 410].includes(error.status)) state.offers = state.offers.filter(offer => offer.sourceKey !== job.key);
    // Failed fetches never advance checkedAt. Old records age out after 14 days.
  }
}
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < jobs.length) {
    const job = jobs[cursor++];
    await run(job);
    if (cursor % 25 === 0) console.log(`Checked ${cursor}/${jobs.length} sources`);
  }
}));
state.offers.sort((a, b) => a.slug.localeCompare(b.slug));
state.sources = Object.fromEntries(Object.entries(state.sources).sort(([a], [b]) => a.localeCompare(b)));
state.candidates = [...new Map(state.candidates.map(c => [`${c.sourceUrl}:${c.candidateId || c.code || c.status}`, c])).values()].slice(-1000);
state.lastRun = new Date().toISOString();
await write("lib/data/offer-snapshot.json", state);
console.log(JSON.stringify({ sources: Object.keys(state.sources).length, successful: Object.values(state.sources).filter(s => s.status === "ok").length,
  offers: state.offers.length, candidates: state.candidates.length, scheduledJobs: jobs.length, sourceRequests, skippedJobs }));
if (jobs.length && skippedJobs < jobs.length && jobs.every(j => state.sources[j.key]?.status !== "ok")) { console.error("All attempted sources failed; prior evidence retained, no offers refreshed."); process.exitCode = 1; }

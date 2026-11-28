// Re-check brand discount guides against their official sources.
//
// A guide stays current for 30 days after its editorial review. This check can
// renew that window only when every concrete figure the guide states in its
// savings options and pricing observations (percentages, prices and trial
// lengths) is found again on the guide's own official pages. A failed fetch or a
// missing figure never advances the verified date, so the page falls back to
// its "needs review" state exactly as before.
//
//   node scripts/verify-guide-sources.mjs [--only=slug,slug]
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { fetchPublicPage, plainText, robotsAllows } from "./lib/offer-sources.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import { editorialGuideIssues } from "../lib/editorial-quality.mjs";
import { extractClaimTokens, guideClaimTexts, guideSourceUrls, missingClaimTokens, missingSavingTypes } from "../lib/guide-claims.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "lib/data/guide-source-checks.json");
const previous = JSON.parse(await fs.readFile(output, "utf8").catch(() => "{}"));
const { BRAND_DISCOUNT_GUIDES } = loadCatalogModule("lib/data/brand-discount-guides.ts");
const selected = process.argv.find(arg => arg.startsWith("--only="))?.slice(7).split(",");

const guides = Object.entries(BRAND_DISCOUNT_GUIDES)
  .filter(([slug, guide]) => (!selected || selected.includes(slug)) && editorialGuideIssues(guide).length === 0);

const robots = new Map(), hostQueue = new Map(), pages = new Map();
async function allowed(url) {
  const { origin, pathname, search } = new URL(url);
  if (!robots.has(origin)) robots.set(origin, fetchPublicPage(`${origin}/robots.txt`).then(page => page.html, error => /HTTP 40[4]|HTTP 410/.test(error.message) ? "" : Promise.reject(error)));
  return robotsAllows(await robots.get(origin), pathname + search);
}
// One request at a time per host, one second apart; each URL is fetched once.
function fetchText(url) {
  if (pages.has(url)) return pages.get(url);
  const host = new URL(url).hostname;
  const task = (hostQueue.get(host) || Promise.resolve()).catch(() => {}).then(async () => {
    try {
      if (!await allowed(url)) throw new Error("Disallowed by robots.txt");
      const page = await fetchPublicPage(url);
      const text = plainText(page.html);
      if (text.length < 100) throw new Error("Insufficient visible source content");
      return text;
    } finally { await new Promise(resolve => setTimeout(resolve, 1000)); }
  });
  hostQueue.set(host, task);
  pages.set(url, task);
  return task;
}

const results = { ...previous };
let cursor = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (cursor < guides.length) {
    const [slug, guide] = guides[cursor++];
    const now = new Date().toISOString();
    const tokens = extractClaimTokens(guideClaimTexts(guide));
    const sources = guideSourceUrls(guide);
    const prior = previous[slug] || {};
    const texts = [], errors = [];
    for (const url of sources) {
      try { texts.push(await fetchText(url)); } catch (error) { errors.push(`${url}: ${error.message}`); }
    }
    const page = texts.join("\n");
    // Stated figures must all be found again; savings that state no amount need
    // their defining term; a guide with neither needs its primary source to load.
    const missing = texts.length ? [...missingClaimTokens(tokens, page), ...missingSavingTypes(guide, page)] : tokens;
    const method = tokens.length ? "figures" : guide.savingsOptions?.length ? "savings-terms" : "source-available";
    const primaryLoaded = texts.length && !errors.some(error => error.startsWith(`${guide.sourceUrl}:`));
    const passed = texts.length && !missing.length && (method !== "source-available" || primaryLoaded);
    // Keep the last successful verification date unless this run re-establishes the guide.
    results[slug] = passed
      ? { verifiedAt: now, status: "verified", method, checkedAt: now, tokens, missing: [], sources }
      : { verifiedAt: prior.verifiedAt, status: texts.length ? "changed" : "error", method, checkedAt: now, tokens, missing, ...(errors.length ? { errors } : {}) };
    if (cursor % 20 === 0) console.log(`Checked ${cursor}/${guides.length} guides`);
  }
}));

const sorted = Object.fromEntries(Object.entries(results).sort(([a], [b]) => a.localeCompare(b)));
const temporary = `${output}.${randomUUID()}.tmp`;
await fs.writeFile(temporary, `${JSON.stringify(sorted, null, 2)}\n`, { flag: "wx" });
await fs.rename(temporary, output);
const counts = Object.values(sorted).reduce((all, row) => ({ ...all, [row.status]: (all[row.status] || 0) + 1 }), {});
console.log(JSON.stringify({ guides: guides.length, ...counts }));

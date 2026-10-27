import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { parse } from "parse5";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Verify the answers served for each search intent; this does not query or
// simulate a search engine and must never be presented as a ranking test.
const args = process.argv.slice(2);
const origin = (args.find(arg => /^https?:\/\//.test(arg)) || "http://127.0.0.1:3210").replace(/\/$/, "");
const reportPath = args.find(arg => arg.startsWith("--report="))?.slice(9);
const selected = args.find(arg => arg.startsWith("--only="))?.slice(7).split(",");
const { getIndexableDiscountBrands, getBrandDiscountData } = loadCatalogModule("lib/brand-discounts.ts");
const { getBrandSearchIntents } = loadCatalogModule("lib/brand-search-intents.ts");
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech").origin;
const allBrands = getIndexableDiscountBrands();
if (selected) for (const slug of selected) assert.ok(allBrands.some(tool => tool.slug === slug), `${slug}: selected guide exists and is indexable`);
const brands = allBrands.filter(tool => !selected || selected.includes(tool.slug));
assert.ok(brands.length, "At least one brand is selected");

const attr = (node, name) => node?.attrs?.find(item => item.name === name)?.value;
const nodes = (node, predicate) => !node ? [] : [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, predicate))];
const elements = (node, tag) => nodes(node, item => item.tagName === tag);
const contents = node => !node ? "" : node.nodeName === "#text" ? node.value : ["script", "style"].includes(node.tagName) ? "" : (node.childNodes || []).map(contents).join(" ");
const byId = (document, id) => nodes(document, node => attr(node, "id") === id)[0];
const words = node => contents(node).trim().split(/\s+/).filter(Boolean).length;
const result = { type: "rendered-content-intent-audit", rankingMeasurement: false, origin, checkedAt: new Date().toISOString(), brands: [] };
const failures = [];
let cases = 0;

for (const tool of brands) {
  const path = `/discounts/${tool.slug}`;
  const response = await fetch(`${origin}${path}`, { headers: { "User-Agent": "Googlebot" }, signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 200, `${path}: responds successfully`);
  assert.ok(!response.redirected, `${path}: canonical resolves directly`);
  const document = parse(await response.text());
  const canonical = elements(document, "link").find(node => attr(node, "rel") === "canonical");
  assert.equal(attr(canonical, "href"), `${canonicalOrigin}${path}`, `${path}: query variants share one canonical`);
  assert.ok(elements(document, "h1").length === 1 && contents(elements(document, "h1")[0]).includes(tool.name), `${path}: brand heading`);
  const data = getBrandDiscountData(tool);
  const intents = getBrandSearchIntents(tool.name, data.guide?.billingModel, data.savingsOptions.some(option => option.type === "Annual billing"));
  assert.equal(intents.length, 9, `${path}: all nine defined buying intents are covered`);
  assert.equal(new Set(intents.map(intent => intent.id)).size, intents.length, `${path}: intent identifiers are unique`);
  assert.equal(new Set(intents.map(intent => intent.query.toLowerCase())).size, intents.length, `${path}: query cases are distinct`);
  const record = { slug: tool.slug, name: tool.name, url: `${canonicalOrigin}${path}`, queries: [] };
  for (const intent of intents) {
    const section = byId(document, intent.section);
    const label = `${path}: ${intent.query}`;
    assert.ok(/^[a-z][a-z0-9-]*$/.test(intent.section), `${label}: valid section identifier`);
    if (section) assert.equal(nodes(document, node => attr(node, "id") === intent.section).length, 1, `${label}: section identifier is unique`);
    let status = "pass";
    const reasons = [];
    try {
      if (!data.sourceNotesCurrent && ["eligibility", "code-help"].includes(intent.id)) {
      assert.match(contents(document), /previous savings amounts are hidden/i, `${label}: expired observations are disclosed`);
      status = "review-needed";
    } else {
      assert.ok(section, `${label}: answer section #${intent.section} is in initial HTML`);
      const text = contents(section).replace(/\s+/g, " ").trim();
      if (intent.id === "discount-code") {
        assert.ok(text.includes(tool.name), `${label}: direct answer names the brand`);
        assert.match(text, /sourced|no current|no separate public/i, `${label}: truthful recorded availability`);
      } else if (intent.id === "promo-code") {
        assert.match(text, /coupon.*promo codes/i, `${label}: promo-code status is explicit`);
        assert.match(text, /sourced code|no current code recorded/i, `${label}: code availability is distinguished from billing offers`);
      } else if (intent.id === "best-discount") {
        assert.ok(words(section) >= 30, `${label}: substantive best-value answer`);
        assert.match(text, /plan|package|account|usage|workload|seat|invoice|billing|annual|year|credit|cost|renewal/i, `${label}: best-value answer identifies a buying criterion`);
      } else if (intent.id === "billing-savings") {
        assert.ok(elements(section, "tbody").flatMap(node => elements(node, "tr")).length >= 3, `${label}: compares at least three buying routes`);
        assert.match(contents(byId(document, "saving-guide")), /annual|yearly|monthly|billing|usage|self.host|credit|pricing|price|invoice/i, `${label}: brand guidance covers its actual purchase model`);
        assert.equal(Boolean(byId(document, "compare-costs")), data.guide?.billingModel !== "usage", `${label}: calculator fits billing model`);
      } else if (intent.id === "redemption") {
        assert.equal(elements(section, "li").length, 4, `${label}: four actionable claim steps`);
        assert.ok(words(section) >= 35, `${label}: steps include meaningful conditions`);
      } else if (intent.id === "eligibility") {
        assert.ok(elements(section, "dt").length >= 3, `${label}: account-specific eligibility checks`);
      } else if (intent.id === "code-help") {
        assert.ok(elements(section, "h3").length >= 2, `${label}: multiple actionable failure scenarios`);
      } else if (intent.id === "renewal") {
        const continuingCost = `${text} ${contents(byId(document, "redemption"))} ${contents(byId(document, "questions"))}`;
        assert.match(continuingCost, data.guide?.billingModel === "usage" ? /prepaid|balance|refund|top.up|renew|cancell|ongoing/i : /renew|cancell|recurring|next invoice|future invoice/i, `${label}: continuing cost or cancellation fits the billing model`);
      } else if (intent.id === "free-access") {
        assert.match(text, /free plans.*trials/i, `${label}: free access is labeled separately`);
        assert.match(text, /sourced option|no current listing/i, `${label}: free access is evidence-based`);
      }
      }
    } catch (error) {
      // Keep collecting independent content gaps. Unexpected runtime errors and
      // the page/source assertions outside this block remain hard failures.
      if (error.code !== "ERR_ASSERTION") throw error;
      status = "fail";
      const reason = error.message.split("\n")[0];
      reasons.push(reason);
      failures.push({ slug: tool.slug, id: intent.id, query: intent.query, expectedSection: `#${intent.section}`, reason });
    }
    record.queries.push({ id: intent.id, query: intent.query, section: section ? `#${intent.section}` : null, expectedSection: `#${intent.section}`, status, ...(reasons.length ? { reasons } : {}) });
    cases++;
  }
  const guideSources = [data.guide?.sourceUrl, ...(data.guide?.sources || []).map(source => source.url)].filter(Boolean);
  const sourceLinks = elements(byId(document, "saving-guide"), "a").map(node => attr(node, "href"));
  assert.ok(guideSources.length && guideSources.every(url => sourceLinks.includes(url)), `${path}: official source evidence is visible`);
  result.brands.push(record);
}
const reviewNeeded = result.brands.flatMap(brand => brand.queries).filter(query => query.status === "review-needed").length;
result.status = failures.length ? "failed" : "passed";
result.summary = { guides: brands.length, cases, passed: cases - reviewNeeded - failures.length, failed: failures.length, reviewNeeded };
result.failures = failures;
if (reportPath) await writeFile(resolve(reportPath), `${JSON.stringify(result, null, 2)}\n`);
console.log(`Brand search intent audit ${result.status}: ${brands.length} guides, ${cases} query cases; ${result.summary.passed} passed content checks, ${failures.length} failed and ${reviewNeeded} require source review. This is rendered content coverage, not search ranking measurement.`);
if (failures.length) {
  console.error(failures.map(failure => `- ${failure.reason}`).join("\n"));
  process.exitCode = 1;
}

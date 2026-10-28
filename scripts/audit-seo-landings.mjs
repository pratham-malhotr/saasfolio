import assert from "node:assert/strict";
import { writeFile } from "node:fs/promises";
import { parse } from "parse5";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Rendered-content and crawl evidence only. No search ranking, search volume,
// Search Console access, coupon redemption or provider application is implied.
const origin = (process.argv.find(value => /^https?:\/\//.test(value)) || "http://127.0.0.1:3238").replace(/\/$/, "");
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech").origin;
const reportPath = process.argv.find(value => value.startsWith("--report="))?.slice(9) || `docs/reports/seo-landings-${new Date().toISOString().slice(0, 10)}.json`;
const { SEARCH_LANDING_TARGETS } = loadCatalogModule("lib/data/search-intent-map.ts");
const { SAVINGS_COLLECTIONS } = loadCatalogModule("lib/data/savings-collections.ts");
const { getCollectionOffers, getCollectionPrograms, getPublishedSavingsOffers } = loadCatalogModule("lib/savings-collections.ts");
const { getAllDeals } = loadCatalogModule("lib/data/deals-data.ts");
const attr = (node, name) => node?.attrs?.find(attribute => attribute.name === name)?.value;
function elements(node, result = []) { if (node.tagName) result.push(node); for (const child of node.childNodes || []) elements(child, result); return result; }
function content(node) { return !node || ["script", "style"].includes(node.tagName) ? "" : node.value || (node.childNodes || []).map(content).join(" "); }
const normalized = value => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const local = href => { try { const url = new URL(href, origin); return [origin, canonicalOrigin].includes(url.origin) ? url.pathname : null; } catch { return null; } };
const failures = [], results = [], documents = new Map(), titles = new Set();
const fetchPage = async path => {
  const response = await fetch(`${origin}${path}`, { headers: { "User-Agent": "Googlebot" }, signal: AbortSignal.timeout(30000) });
  const raw = await response.text();
  return { response, raw, nodes: elements(parse(raw)) };
};
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const sitemapPaths = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname));

for (const target of SEARCH_LANDING_TARGETS) {
  try {
    const page = await fetchPage(target.path);
    const { response, raw, nodes } = page;
    documents.set(target.path, page);
    assert.equal(response.status, 200, "Canonical page returns HTTP 200");
    assert.equal(response.redirected, false, "Canonical page resolves directly");
    assert.ok(sitemapPaths.has(target.path), "Discoverable through the canonical sitemap");
    const main = nodes.filter(node => node.tagName === "main");
    assert.equal(main.length, 1, "One primary main landmark, without a nested main");
    const mainText = content(main[0]);
    const headings = nodes.filter(node => node.tagName === "h1");
    assert.equal(headings.length, 1, "One initial-HTML primary heading");
    const title = content(nodes.find(node => node.tagName === "title")).trim();
    assert.ok(!titles.has(title), "Distinct title ownership"); titles.add(title);
    const canonical = nodes.filter(node => node.tagName === "link" && attr(node, "rel") === "canonical");
    assert.equal(canonical.length, 1);
    assert.equal(attr(canonical[0], "href"), `${canonicalOrigin}${target.path === "/" ? "" : target.path}`);
    assert.ok(!nodes.some(node => node.tagName === "meta" && ["robots", "googlebot"].includes(attr(node, "name")) && attr(node, "content")?.includes("noindex")), "Landing page allows indexing");
    const queryTokens = normalized(target.primaryQuery).split(" ").filter(word => !["how", "to", "and", "after"].includes(word));
    const headingText = normalized(`${title} ${content(headings[0])}`);
    assert.ok(queryTokens.every(token => headingText.includes(token)), "Title and heading match the assigned primary buying intent");
    const queries = [target.primaryQuery, ...target.relatedQueries].map(query => ({ query, tokensPresent: normalized(query).split(" ").filter(word => !["how", "to", "and", "for", "a", "after"].includes(word)).every(token => normalized(mainText).includes(token)) }));
    assert.ok(queries.every(query => query.tokensPresent), "Related buying language is answered in the rendered content");
    const links = nodes.filter(node => node.tagName === "a");
    const linkTargets = links.map(node => local(attr(node, "href"))).filter(Boolean);
    const graph = nodes.filter(node => node.tagName === "script" && attr(node, "type") === "application/ld+json").flatMap(node => { const data = JSON.parse((node.childNodes || []).map(child => child.value || "").join("")); return data["@graph"] || [data]; });
    const collection = SAVINGS_COLLECTIONS.find(item => `/${item.slug}` === target.path);
    if (collection) {
      const offers = getCollectionOffers(collection.slug);
      const ids = nodes.map(node => attr(node, "data-collection-offer")).filter(Boolean);
      assert.deepEqual(ids, offers.map(deal => deal.slug), "Visible records match the current catalog selection exactly");
      for (const program of getCollectionPrograms(collection.slug)) assert.ok(linkTargets.includes(program.path), `Program guidance link: ${program.path}`);
      const list = graph.find(item => item["@type"] === "CollectionPage")?.mainEntity;
      assert.ok(list && list["@type"] === "ItemList");
      assert.equal(list.numberOfItems, list.itemListElement.length);
      for (const item of list.itemListElement) assert.ok(linkTargets.includes(new URL(item.url).pathname), "Structured list links are also visible");
      for (const deal of offers) {
        assert.ok(raw.includes(deal.sourceUrl.replaceAll("&", "&amp;")), "Visible offer source attribution");
        assert.ok(raw.includes(deal.checkedAt), "Actual recorded check date is shown");
      }
      assert.match(mainText, /not checkout tested|have not been tested/);
      assert.ok(nodes.some(node => node.tagName === "table"), "Original comparison criteria are visible");
    }
    if (target.path.startsWith("/deals/category/")) assert.ok(nodes.some(node => attr(node, "data-category-buying-guide")), "Category-specific buying guidance is rendered");
    if (target.path === "/deals" || target.path.startsWith("/deals/category/")) {
      assert.ok(!links.some(node => /^\/deals\/[^/]+-pricing$/.test(attr(node, "href") || "")), "Ordinary pricing is not advertised as a current deal");
      const expected = getPublishedSavingsOffers(getAllDeals()).filter(deal => (deal.dealPrice ?? 0) <= 500 && (target.path === "/deals" || deal.categorySlug === target.path.split("/").at(-1)));
      const list = graph.find(item => item["@type"] === "CollectionPage")?.mainEntity;
      assert.equal(list?.numberOfItems, expected.length, "Schema counts match the default visible offer filter");
    }
    const words = mainText.trim().split(/\s+/).length;
    assert.ok(words >= 250, "Substantive initial HTML beyond a title or keyword list");
    results.push({ path: target.path, title, primaryQuery: target.primaryQuery, words, queries, status: "pass" });
  } catch (error) { failures.push({ path: target.path, issue: error.message }); results.push({ path: target.path, status: "fail", issue: error.message }); }
}

// Real anchor discovery, not a search-form simulation.
const home = documents.get("/");
const direct = new Set(home?.nodes.filter(node => node.tagName === "a").map(node => local(attr(node, "href"))).filter(Boolean));
for (const collection of SAVINGS_COLLECTIONS) if (!direct.has(`/${collection.slug}`)) failures.push({ path: `/${collection.slug}`, issue: "New collection is not directly linked from the homepage" });
for (const [path, indexable] of [["/compare/coolify-vs-vercel", true], ["/compare/vercel-vs-coolify", true], ["/compare/notion-vs-linear", false]]) {
  try {
    const { response, nodes } = await fetchPage(path);
    assert.equal(response.status, 200);
    const noindex = nodes.some(node => node.tagName === "meta" && attr(node, "name") === "robots" && attr(node, "content")?.includes("noindex"));
    assert.equal(noindex, !indexable, "Only curated comparisons are search landing pages");
    assert.equal(sitemapPaths.has(path), path === "/compare/coolify-vs-vercel", "Custom selector combinations and reversed aliases stay outside the sitemap");
  } catch (error) { failures.push({ path, issue: error.message }); }
}
const report = { checkedAt: new Date().toISOString(), origin, rankingMeasurement: false, searchVolumeMeasurement: false, searchConsoleData: false, summary: { pages: results.length, queryCases: results.reduce((count, page) => count + (page.queries?.length || 0), 0), passed: results.filter(page => page.status === "pass").length, failures: failures.length }, failures, pages: results };
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
console.log(JSON.stringify(report.summary));
console.log(`Report: ${reportPath}. These are content and crawl checks, not ranking measurements.`);
if (failures.length) { console.error(failures); process.exitCode = 1; }

import assert from "node:assert/strict";
import { parse } from "parse5";
import { DISCOUNT_BRAND_ALIASES } from "../lib/data/brand-discount-aliases.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

// Exercise production HTML, including content available before JavaScript runs.
// Usage: npm run seo:audit:brands -- http://localhost:3210
const origin = (process.argv[2] || "http://localhost:3210").replace(/\/$/, "");
const canonicalOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://saasfolio.tech").origin;
const { getIndexableDiscountBrands, getBrandDiscountData } = loadCatalogModule("lib/brand-discounts.ts");
const { COMPARISON_SLUGS } = loadCatalogModule("lib/data/comparisons-data.ts");
const brands = getIndexableDiscountBrands();

async function fetchPage(path, userAgent = "Googlebot") {
  const response = await fetch(`${origin}${path}`, { headers: { "User-Agent": userAgent }, signal: AbortSignal.timeout(30000) });
  return { response, document: parse(await response.text()) };
}
function nodes(node, predicate) {
  return [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, predicate))];
}
const attr = (node, name) => node.attrs?.find(attr => attr.name === name)?.value;
const elements = (document, tag) => nodes(document, node => node.tagName === tag);
const contents = node => node.nodeName === "#text" ? node.value : ["script", "style"].includes(node.tagName) ? "" : (node.childNodes || []).map(contents).join(" ");
const metadata = (document, key) => attr(elements(document, "meta").find(node => [attr(node, "name"), attr(node, "property")].includes(key)) || {}, "content");
const canonical = document => attr(elements(document, "link").find(node => attr(node, "rel") === "canonical") || {}, "href");
const links = document => elements(document, "a").map(node => attr(node, "href"));
function assertDiscoveryLink(document, path, label, brandName) {
  const candidates = elements(document, "a").filter(node => attr(node, "href") === path);
  assert.ok(candidates.length, `${label}: crawlable HTML link to ${path}`);
  assert.ok(candidates.some(node => {
    const rel = (attr(node, "rel") || "").toLowerCase().split(/\s+/);
    const text = contents(node).replace(/\s+/g, " ").trim();
    return !rel.includes("nofollow") && text.length > 0 && (!brandName || text.toLowerCase().includes(brandName.toLowerCase()));
  }), `${label}: descriptive followed link to ${path}`);
}
function assertSectionNavigation(document, path) {
  const navigation = elements(document, "nav").find(node => attr(node, "aria-label") === "On this page");
  assert.ok(navigation, `${path}: section navigation is present in HTML`);
  const availability = nodes(document, node => attr(node, "id") === "discount-availability")[0];
  assert.equal(elements(availability, "dt").length, 3, `${path}: code, provider savings and free-access status are distinguished`);
  for (const href of [...links(navigation), ...links(availability)]) {
    if (!href?.startsWith("#")) continue;
    const id = decodeURIComponent(href.slice(1));
    assert.equal(nodes(document, node => attr(node, "id") === id).length, 1, `${path}: ${href} reaches exactly one section`);
  }
}
const { response: sitemapResponse } = await fetchPage("/sitemap.xml");
assert.equal(sitemapResponse.status, 200);
const sitemap = await (await fetch(`${origin}/sitemap.xml`)).text();
const guidePaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, url]) => new URL(url).pathname).filter(path => /^\/discounts\/[^/]+$/.test(path));
assert.equal(guidePaths.length, brands.length, "Every indexable brand guide is covered by this audit");
const { response: directoryResponse, document: directory } = await fetchPage("/discounts");
assert.equal(directoryResponse.status, 200, "Discount directory returns HTTP 200");
assert.ok(!directoryResponse.redirected, "Discount directory resolves without a redirect");
const { document: homepage } = await fetchPage("/");
// React may stream a route's HTML outside <main> before moving the boundary
// into place. Inspect the actual brand section rather than the loading shell.
const homeBrands = nodes(homepage, node => attr(node, "aria-labelledby") === "brand-discounts-heading")[0];
assert.match(contents(elements(homepage, "h1")[0]), /SaaS discounts.*software deals/i, "Homepage heading describes the SaaS discount business");
assert.match(contents(elements(homepage, "title")[0]), /SaaS Discounts.*(?:Coupon Codes|Software Deals)/i, "Homepage title targets software savings");
assert.ok(homeBrands && links(homeBrands).includes("/discounts"), "Brand directory is linked from homepage content");
assertDiscoveryLink(homeBrands, "/discounts", "Homepage content");
assert.ok(links(homeBrands).filter(href => /^\/discounts\/[^/]+$/.test(href)).length >= 6, "Homepage offers varied direct brand discovery");
for (const slug of ["beehiiv", "predis-ai", "taplio", "baremetrics"]) {
  assert.ok(links(directory).includes(`/discounts/${slug}`), `${slug}: brand directory links to guide`);
  assertDiscoveryLink(homeBrands, `/discounts/${slug}`, "Homepage priority brands");
}
assert.match(contents(elements(directory, "h1")[0]), /SaaS discounts/i, "Brand directory heading has SaaS discount intent");
const titles = new Set();
const descriptions = new Set();

for (const categorySlug of new Set(brands.map(tool => tool.categorySlug))) {
  const path = `/deals/category/${categorySlug}`;
  const { response, document } = await fetchPage(path);
  assert.equal(response.status, 200, `${path}: category returns HTTP 200`);
  const categoryGuides = brands.filter(tool => tool.categorySlug === categorySlug);
  // Exclude global navigation/footer shortcuts: this must be a contextual route
  // from the category's buying content to a relevant brand guide.
  const section = nodes(document, node => attr(node, "data-related-discount-guides") !== undefined)[0];
  assert.ok(section, `${path}: contextual discount guidance is rendered`);
  assert.deepEqual(new Set(links(section)), new Set(categoryGuides.map(tool => `/discounts/${tool.slug}`)), `${path}: all related guides match the category`);
  for (const tool of categoryGuides) assertDiscoveryLink(section, `/discounts/${tool.slug}`, path, tool.name);
}
for (const comparison of COMPARISON_SLUGS) {
  const comparedBrands = brands.filter(tool => comparison.split("-vs-").includes(tool.slug));
  if (!comparedBrands.length) continue;
  const path = `/compare/${comparison}`;
  const { response, document } = await fetchPage(path);
  assert.equal(response.status, 200, `${path}: comparison returns HTTP 200`);
  const section = nodes(document, node => attr(node, "data-related-discount-guides") !== undefined)[0];
  assert.ok(section, `${path}: contextual discount guidance is rendered`);
  assert.deepEqual(new Set(links(section)), new Set(comparedBrands.map(tool => `/discounts/${tool.slug}`)), `${path}: discount guides belong to compared brands`);
  for (const tool of comparedBrands) assertDiscoveryLink(section, `/discounts/${tool.slug}`, path, tool.name);
}

for (const tool of brands) {
  const { slug, name } = tool;
  const expected = getBrandDiscountData(tool);
  const path = `/discounts/${slug}`;
  const { response, document } = await fetchPage(path);
  assert.equal(response.status, 200, `${path}: HTTP 200`);
  assert.ok(!response.redirected, `${path}: canonical sitemap URL resolves directly`);
  assert.ok(sitemap.includes(`<loc>${canonicalOrigin}${path}</loc>`), `${path}: discoverable in sitemap`);
  assert.ok(links(directory).includes(path), `${path}: discoverable from brand directory`);
  assertDiscoveryLink(directory, path, "Discount directory", name);
  const h1s = elements(document, "h1");
  assert.equal(h1s.length, 1, `${path}: one primary heading`);
  assert.ok(contents(h1s[0]).includes(name) && /discount/i.test(contents(h1s[0])), `${path}: brand discount intent in heading`);
  const title = contents(elements(document, "title")[0]);
  const description = metadata(document, "description");
  assert.ok(title.includes(name) && /discount/i.test(title), `${path}: brand discount intent in title`);
  assert.ok(!titles.has(title), `${path}: unique title`);
  assert.ok(description?.toLowerCase().includes(name.toLowerCase()) && description.length >= 70 && description.length <= 160, `${path}: useful brand-specific description`);
  assert.ok(!descriptions.has(description), `${path}: unique description`);
  titles.add(title); descriptions.add(description);
  assert.equal(canonical(document), `${canonicalOrigin}${path}`, `${path}: self canonical`);
  const head = elements(document, "head")[0];
  assert.equal(elements(head, "title").length, 1, `${path}: one title in the document head`);
  assert.equal(elements(head, "link").filter(node => attr(node, "rel") === "canonical").length, 1, `${path}: one canonical in the document head`);
  assert.equal(metadata(document, "og:url"), canonical(document), `${path}: social URL matches canonical`);
  assert.ok(!metadata(document, "robots")?.includes("noindex"), `${path}: indexable`);
  assert.ok(!metadata(document, "googlebot")?.includes("noindex"), `${path}: Googlebot-specific directive allows indexing`);
  assert.ok(!response.headers.get("x-robots-tag")?.includes("noindex"), `${path}: indexable response header`);
  assert.ok(links(document).includes(`/tools/${slug}`), `${path}: links to software profile`);
  assert.ok(links(document).includes("/affiliate-disclosure"), `${path}: disclosure linked`);
  assertSectionNavigation(document, path);
  const faqs = elements(document, "details");
  assert.ok(faqs.length >= 3 && faqs.every(node => contents(node).length > 100), `${path}: answers included before interaction`);
  const text = contents(document);
  {
    const currentOffers = nodes(document, node => attr(node, "id") === "current-offers")[0];
    const answer = nodes(currentOffers, node => attr(node, "id") === "discount-answer")[0];
    assert.ok(answer && contents(answer).includes(name) && contents(answer).length > 100, `${path}: useful direct answer about sourced discount availability`);
    const best = nodes(currentOffers, node => attr(node, "id") === "best-discount")[0];
    assert.ok(best && /best.*discount/i.test(contents(elements(best, "h3")[0])) && contents(best).includes(name) && contents(best).length > 150, `${path}: useful answer to brand best-discount intent`);
    const savingsTable = elements(currentOffers, "table")[0];
    const reviewedAt = Date.parse(attr(elements(document, "time")[0] || {}, "datetime") || "");
    const reviewAge = Date.now() - reviewedAt;
    // Editorial observations intentionally disappear when their review expires.
    if (reviewAge >= 0 && reviewAge <= 30 * 86400000) {
      assert.equal(Boolean(savingsTable), expected.savingsOptions.length > 0, `${path}: savings table appears only for recorded provider options`);
      const eligibility = nodes(document, node => attr(node, "id") === "eligibility")[0];
      assert.ok(eligibility && elements(eligibility, "dt").length >= 3, `${path}: brand-specific eligibility checks`);
      const troubleshooting = nodes(document, node => attr(node, "id") === "coupon-help")[0];
      assert.ok(troubleshooting && elements(troubleshooting, "h3").length >= 2, `${path}: actionable coupon troubleshooting`);
    }
    if (savingsTable) {
      for (const option of expected.savingsOptions) assert.ok(contents(savingsTable).includes(option.saving) && links(savingsTable).includes(option.sourceUrl), `${path}: each provider saving and its source are visible`);
      assert.ok(elements(savingsTable, "a").every(node => attr(node, "href")?.startsWith("https://")), `${path}: savings link to provider sources`);
      assert.match(contents(currentOffers), /Source reviewed/, `${path}: savings show their review date`);
    }
    assert.equal(links(document).includes("#compare-costs"), expected.guide?.billingModel !== "usage", `${path}: annual calculator navigation fits the billing model`);
  }
  {
    const table = elements(document, "table").find(node => contents(node).includes("Option to evaluate"));
    assert.ok(table && elements(table, "tbody").flatMap(node => elements(node, "tr")).length >= 3, `${path}: server-rendered buying considerations`);
    const redemption = nodes(document, node => attr(node, "id") === "redemption")[0];
    assert.equal(elements(redemption, "li").length, 4, `${path}: four actionable redemption steps`);
    const section = nodes(document, node => attr(node, "id") === "saving-guide")[0];
    assert.ok(elements(section, "h3").length >= 5 && contents(section).split(/\s+/).length >= 220, `${path}: substantial original savings guidance`);
    const sources = elements(section, "a").map(node => attr(node, "href"));
    assert.ok(sources.some(href => href?.startsWith("https://")), `${path}: official sources linked`);
    const related = links(document).filter(href => /^\/discounts\/[^/]+$/.test(href || "") && href !== path);
    assert.ok(new Set(related).size >= 3, `${path}: related brand guides are crawlable`);
    for (const relatedPath of new Set(related)) assertDiscoveryLink(document, relatedPath, path);
  }
  assert.match(text, /not.*checkout tested|not been tested at checkout/i, `${path}: testing status is explicit`);
  assert.ok(!/Hand-Tested Codes|Every coupon is checked in real checkouts/.test(text), `${path}: no unsupported testing claims`);

  const schemas = elements(document, "script").filter(node => attr(node, "type") === "application/ld+json")
    .flatMap(node => JSON.parse(node.childNodes.map(child => child.value || "").join(""))["@graph"] || []);
  const page = schemas.find(node => node["@type"] === "CollectionPage");
  assert.equal(page?.url, canonical(document), `${path}: page entity URL`);
  assert.ok(schemas.some(node => node["@type"] === "BreadcrumbList"), `${path}: breadcrumb schema`);
  assert.ok(page.citation?.length && page.citation.every(url => links(document).includes(url)), `${path}: structured citations match visible provider links`);
  const itemLinks = page.mainEntity.itemListElement.map(item => new URL(item.url).pathname);
  assert.ok(itemLinks.every(href => links(document).includes(href)), `${path}: schema describes visible linked offers`);
  for (const offerPath of itemLinks) {
    const { document: offer } = await fetchPage(offerPath);
    assert.ok(links(offer).includes(path), `${offerPath}: links back to brand guide`);
  }
  const { response: profileResponse, document: profile } = await fetchPage(`/tools/${slug}`);
  assert.equal(profileResponse.status, 200, `${path}: software profile returns HTTP 200`);
  assert.ok(!profileResponse.redirected, `${path}: software profile resolves directly`);
  assert.equal(canonical(profile), `${canonicalOrigin}/tools/${slug}`, `${path}: product and discount intent keep distinct canonicals`);
  assert.notEqual(contents(elements(profile, "title")[0]), title, `${path}: product and discount intent keep distinct titles`);
  assert.ok(links(profile).includes(path), `${path}: profile links to savings guide`);
  assertDiscoveryLink(profile, path, "Software profile", name);
  for (const href of links(profile).filter(href => href?.startsWith(`${path}#`))) {
    const id = decodeURIComponent(new URL(href, canonicalOrigin).hash.slice(1));
    assert.equal(nodes(document, node => attr(node, "id") === id).length, 1, `${path}: profile shortcut ${href} reaches a rendered guide section`);
  }
  const { document: tracked } = await fetchPage(`${path}?utm_source=brand-audit`);
  assert.equal(canonical(tracked), canonical(document), `${path}: tracking does not duplicate canonical`);
  const { document: browser } = await fetchPage(path, "Mozilla/5.0");
  assert.equal(metadata(browser, "description"), description, `${path}: consistent browser and bot metadata`);

  for (const imageKey of ["og:image", "twitter:image"]) {
    const image = metadata(document, imageKey);
    assert.ok(new URL(image).pathname.includes(path), `${path}: brand-specific ${imageKey}`);
    const imageResponse = await fetch(`${origin}${new URL(image).pathname}${new URL(image).search}`, { signal: AbortSignal.timeout(30000) });
    assert.equal(imageResponse.status, 200, `${path}: ${imageKey} loads`);
    assert.match(imageResponse.headers.get("content-type"), /^image\//);
    assert.ok((await imageResponse.arrayBuffer()).byteLength > 1000, `${path}: image has content`);
  }
  console.log(`Passed ${path}: crawlable content, metadata, canonicals, schema, internal links and sharing images.`);
}
for (const [alias, destination] of Object.entries(DISCOUNT_BRAND_ALIASES)) {
  assert.ok(!sitemap.includes(`<loc>${canonicalOrigin}/discounts/${alias}</loc>`), `${alias}: alias excluded from sitemap`);
  for (const suffix of ["?utm_source=brand-audit", "/opengraph-image"]) {
    const response = await fetch(`${origin}/discounts/${alias}${suffix}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 308, `${alias}: permanent HTTP redirect before rendering`);
    const location = new URL(response.headers.get("location"), origin);
    assert.equal(location.pathname, `/discounts/${destination}${suffix.startsWith("/") ? suffix : ""}`, `${alias}: direct canonical destination`);
    if (suffix.startsWith("?")) assert.equal(location.searchParams.get("utm_source"), "brand-audit", `${alias}: query retained`);
  }
}
for (const [from, to] of [["/tools/kit-convertkit", "/tools/convertkit"], ["/deals/kit-convertkit-pricing", "/deals/convertkit-pricing"]]) {
  const response = await fetch(`${origin}${from}`, { redirect: "manual", signal: AbortSignal.timeout(30000) });
  assert.equal(response.status, 308, `${from}: duplicate Kit URL permanently consolidated`);
  assert.equal(new URL(response.headers.get("location"), origin).pathname, to, `${from}: canonical destination`);
}
for (const path of ["/discounts/seo-missing", "/discounts/not-a-real-brand"]) {
  const { response } = await fetchPage(path);
  assert.equal(response.status, 404, `${path}: missing brands return 404`);
}
console.log(`Brand SEO audit passed for ${brands.length} brands.`);

import assert from "node:assert/strict";
import test from "node:test";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const published = loadCatalogModule("lib/published-catalog.ts");
const { getAllTools, getToolBySlug } = loadCatalogModule("lib/data/tools-data.ts");
const { BRAND_DISCOUNT_GUIDES } = loadCatalogModule("lib/data/brand-discount-guides.ts");
const { COMPARISON_SLUGS } = loadCatalogModule("lib/data/comparisons-data.ts");
const { COMPARISON_GUIDES } = loadCatalogModule("lib/data/comparison-guides.ts");
const { DETAILED_ARTICLES } = loadCatalogModule("lib/data/articles-data.ts");

test("generated catalog records and a pricing link do not publish a profile", () => {
  for (const slug of ["cogniflow-ai", "metricpulse", "syntaxai", "claude-ai", "phind"]) {
    assert.ok(getToolBySlug(slug), `${slug} is retained in historical catalog data`);
    assert.equal(published.hasPublishedToolProfile(slug), false, slug);
    assert.equal(published.getPublishedTool(slug), undefined, slug);
  }
  assert.ok(published.getPublishedTools().length < getAllTools().length);
});

test("existing original brand guides retain their published software profiles", () => {
  for (const slug of Object.keys(BRAND_DISCOUNT_GUIDES)) {
    const tool = getToolBySlug(slug);
    if (tool && tool.providerStatus !== "unavailable") assert.ok(published.getPublishedTool(slug), slug);
  }
  assert.equal(published.getPublishedTool("kit-convertkit")?.slug, "convertkit");
});

test("approved managed brand profiles enter the public directory while retired brands stay excluded", () => {
  const managed = loadCatalogModule("lib/data/managed-content.ts");
  const template = published.getPublishedTool("notion");
  const approved = { ...template, id: "tool-intake-fixture", name: "Intake Fixture", slug: "intake-fixture", providerStatus: undefined, alternatives: [] };
  const retired = { ...approved, id: "tool-retired-intake-fixture", name: "Retired Fixture", slug: "retired-intake-fixture", providerStatus: "unavailable" };
  const catalog = loadCatalogModule("lib/published-catalog.ts", { "lib/data/managed-content.ts": { ...managed, MANAGED_BRANDS: [approved, retired] } });
  assert.equal(catalog.getPublishedTool(approved.slug)?.slug, approved.slug);
  assert.ok(catalog.getPublishedTools().some(tool => tool.slug === approved.slug));
  assert.equal(catalog.getPublishedTool(retired.slug), undefined);
  assert.ok(!catalog.getPublishedTools().some(tool => tool.slug === retired.slug));
});

test("new documented profiles replace legacy claims without mutating source records", () => {
  const before = JSON.stringify(getToolBySlug("pocketbase"));
  const tool = published.getPublishedTool("pocketbase");
  assert.match(tool.longDescription, /cautions|warns/);
  assert.equal(tool.sourceUrl, "https://pocketbase.io/docs/");
  assert.equal(tool.reviewCount, 0);
  assert.deepEqual(tool.reviews, []);
  assert.equal(JSON.stringify(getToolBySlug("pocketbase")), before);
  for (const item of published.getPublishedTools()) for (const alt of item.alternatives) assert.ok(published.hasPublishedToolProfile(alt.slug), `${item.slug}: ${alt.slug}`);
});

test("published offer selection excludes generated pricing pages and unreviewed brands", () => {
  const offers = published.getPublishedOffers();
  const records = [
    { slug: "notion-editorial-offer", toolSlug: "notion", dealType: "offer" },
    { slug: "phind-unreviewed-offer", toolSlug: "phind", dealType: "offer" },
    { slug: "notion-pricing", toolSlug: "notion", dealType: "pricing" },
  ];
  assert.deepEqual(published.getPublishedOffers(records).map(offer => offer.slug), ["notion-editorial-offer"]);
  for (const offer of offers) {
    assert.notEqual(offer.dealType, "pricing");
    assert.ok(published.hasPublishedToolProfile(offer.toolSlug));
  }
});

test("browser search receives only public projections rather than the generated catalog or article bodies", () => {
  const catalog = published.getPublicSearchCatalog();
  assert.ok(catalog.tools.length && Array.isArray(catalog.offers) && catalog.articles.length);
  assert.ok(catalog.tools.every(tool => published.hasPublishedToolProfile(tool.slug) && !Object.hasOwn(tool, "longDescription") && !Object.hasOwn(tool, "reviews")));
  assert.ok(catalog.articles.every(article => !Object.hasOwn(article, "sections") && !Object.hasOwn(article, "sources")));
  assert.ok(Buffer.byteLength(JSON.stringify(catalog)) < 300000, "Search projection remains compact enough for the public layout");
});

test("only comparisons with their own decision analysis enter the sitemap", () => {
  assert.ok(COMPARISON_SLUGS.length);
  for (const slug of COMPARISON_SLUGS) {
    const guide = COMPARISON_GUIDES[slug];
    assert.ok(guide, slug);
    assert.ok(guide.rows.some(row => row.situation && row.approach && row.reason));
    assert.ok(guide.exercise.length && guide.sources.length);
    for (const part of slug.split("-vs-")) assert.ok(published.hasPublishedToolProfile(part), part);
  }
  assert.ok(!COMPARISON_SLUGS.includes("cogniflow-ai-vs-syntaxai"));
  const urls = loadCatalogModule("app/sitemap.ts").default().map(item => item.url);
  for (const tool of getAllTools()) assert.equal(urls.includes(`https://saasfolio.tech/tools/${tool.slug}`), published.hasPublishedToolProfile(tool.slug), tool.slug);
});

test("article decision exercises have unique anchors and matching navigation", () => {
  for (const article of DETAILED_ARTICLES) {
    const ids = article.sections.map(section => section.id);
    assert.equal(new Set(ids).size, ids.length, article.slug);
    assert.deepEqual(article.tableOfContents.map(item => item.id), ids);
    assert.ok(ids.includes("worked-example") && ids.includes("decision-record") && ids.includes("common-mistake"), article.slug);
    assert.match(article.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(article.updatedAt >= article.publishedAt, `${article.slug}: update follows publication`);
    assert.ok(Date.parse(article.updatedAt) <= Date.now(), `${article.slug}: no future review date`);
    assert.ok(article.sources.length);
  }
});

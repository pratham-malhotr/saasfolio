import { emptyManaged } from "./lib/empty-managed-fixture.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { readFileSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import ts from "typescript";
import { createRequire } from "node:module";
import { emptyOfferUrlHistory, rememberOfferIdentifiers, rememberOfferUrls, validateOfferUrlHistory } from "./lib/offer-url-history.mjs";
import { discoverVendorOffer } from "./lib/offer-sources.mjs";
import { loadCatalogModule } from "./lib/load-catalog.mjs";

const run = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");
const nativeRequire = createRequire(import.meta.url);

function loadTs(relativePath, dependencies, date = Date) {
  dependencies = { "./managed-content": emptyManaged, ...dependencies };
  const source = readFileSync(path.join(root, relativePath), "utf8");
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", "Date", js)(name => {
    if (Object.hasOwn(dependencies, name)) return dependencies[name];
    if (name === "react" || name === "react/jsx-runtime") return nativeRequire(name);
    throw new Error(`Unexpected test dependency: ${name}`);
  }, loaded, loaded.exports, date);
  return loaded.exports;
}

test("history retains only exact recorded URL identifiers and canonical brands", () => {
  const history = emptyOfferUrlHistory();
  const canonicalize = slug => slug === "example-old" ? "example" : slug;
  rememberOfferIdentifiers(history, [["previous-example-code", "example-old"]], canonicalize);
  rememberOfferUrls(history, [{ slug: "example-coupon", toolSlug: "example-old", code: "NOT-A-CURRENT-CLAIM", checkedAt: "2020-01-01" }], canonicalize);
  assert.deepEqual(history.offers, {
    "deal-example-coupon": "example", "example-coupon": "example", "previous-example-code": "example",
  });
  assert.equal(JSON.stringify(history).includes("NOT-A-CURRENT-CLAIM"), false);
  assert.equal(Object.hasOwn(history.offers, "example-unrecorded-coupon"), false);
  assert.throws(() => rememberOfferIdentifiers(history, [["example-coupon", "unrelated-brand"]]), /Conflicting/);
  for (const id of [undefined, null, 123, "__proto__", "https://example.com", "example/offer", "../example"]) {
    assert.throws(() => rememberOfferIdentifiers(history, [[id, "example"]]), /exact safe identifier/);
  }
  assert.throws(() => validateOfferUrlHistory({ offers: {} }), /refusing to discard/);
});

test("the actual refresh script preserves URL identity after successful offer removal and source 404", async () => {
  const fixture = await fs.mkdtemp(path.join(os.tmpdir(), "saasfolio-offer-history-"));
  try {
    await fs.mkdir(path.join(fixture, "scripts/lib"), { recursive: true });
    await fs.mkdir(path.join(fixture, "lib/data"), { recursive: true });
    await fs.copyFile(path.join(root, "scripts/refresh-offers.mjs"), path.join(fixture, "scripts/refresh-offers.mjs"));
    await fs.copyFile(path.join(root, "lib/managed-catalog.mjs"), path.join(fixture, "lib/managed-catalog.mjs"));
    await fs.copyFile(path.join(root, "lib/public-url.mjs"), path.join(fixture, "lib/public-url.mjs"));
    await fs.copyFile(path.join(root, "scripts/lib/offer-url-history.mjs"), path.join(fixture, "scripts/lib/offer-url-history.mjs"));
    await fs.writeFile(path.join(fixture, "scripts/lib/load-catalog.mjs"), 'export const loadCatalogModule = () => ({ getToolBySlug: slug => ({ slug }) });');
    await fs.writeFile(path.join(fixture, "scripts/lib/source-backoff.mjs"), 'export const shouldAttemptSource = () => true; export const sourceBackoff = (_previous, error) => ({ httpStatus: error.status, failureCount: 1 });');
    await fs.writeFile(path.join(fixture, "scripts/lib/simplycodes.mjs"), 'export const parseSimplyCodes = () => ({}); export const compareDiscoveryCandidates = () => 0;');
    await fs.writeFile(path.join(fixture, "scripts/lib/offer-sources.mjs"), `
      export const discoverVendorOffer = () => null;
      export const extractCouponCandidates = () => [];
      export const plainText = html => html;
      export const robotsAllows = () => true;
      export const hash = () => 'mock-content-hash';
      export async function fetchPublicPage(url) {
        if (url.endsWith('/robots.txt')) return { html: '' };
        if (url.includes('missing.example')) { const error = new Error('HTTP 404'); error.status = 404; throw error; }
        return { url, html: 'The provider now offers paid subscriptions only. '.repeat(8) };
      }
    `);
    const writeJson = (name, value) => fs.writeFile(path.join(fixture, "lib/data", name), JSON.stringify(value));
    await fs.writeFile(path.join(fixture, "lib/data/brand-expansion.txt"), "");
    await writeJson("catalog-seeds.json", [
      { slug: "changed", name: "Changed", url: "https://changed.example/pricing" },
      { slug: "missing", name: "Missing", url: "https://missing.example/pricing" },
    ]);
    await writeJson("reviewed-offers.json", []);
    await writeJson("managed-catalog.json", { schemaVersion: 1, revision: 0, publishedAt: null, entries: [] });
    await writeJson("provider-links.json", {});
    await writeJson("legacy-deal-aliases.json", {});
    await writeJson("offer-url-history.json", emptyOfferUrlHistory());
    await writeJson("offer-snapshot.json", { sources: {}, candidates: [], offers: [
      { slug: "changed-free-plan", toolSlug: "changed", sourceKey: "vendor:changed" },
      { slug: "missing-free-trial", toolSlug: "missing", sourceKey: "vendor:missing" },
    ] });
    await run(process.execPath, [path.join(fixture, "scripts/refresh-offers.mjs")], { cwd: fixture });
    const history = JSON.parse(await fs.readFile(path.join(fixture, "lib/data/offer-url-history.json"), "utf8"));
    const snapshot = JSON.parse(await fs.readFile(path.join(fixture, "lib/data/offer-snapshot.json"), "utf8"));
    assert.deepEqual(snapshot.offers, []);
    assert.equal(snapshot.sources["vendor:missing"].httpStatus, 404);
    assert.deepEqual(history.offers, {
      "changed-free-plan": "changed", "deal-changed-free-plan": "changed",
      "deal-missing-free-trial": "missing", "missing-free-trial": "missing",
    });
  } finally { await fs.rm(fixture, { recursive: true, force: true }); }
});

function catalogFixture() {
  const clock = { now: Date.parse("2026-10-27T12:00:00Z") };
  class TestDate extends Date { static now() { return clock.now; } }
  const available = { slug: "example", name: "Example", website: "https://example.com", pricingUrl: "https://example.com/pricing", category: "Developer", categorySlug: "dev-tools", tagline: "An example tool" };
  const gone = { ...available, slug: "gone", providerStatus: "unavailable" };
  const tools = [available, gone];
  const getToolBySlug = slug => tools.find(tool => tool.slug === (slug === "example-alias" ? "example" : slug));
  const base = { toolSlug: "example", sourceUrl: available.pricingUrl, destinationUrl: available.pricingUrl, sourceKind: "vendor", title: "Example offer", terms: "See current provider terms.", discountPercentage: 0 };
  const catalog = loadTs("lib/data/deals-data.ts", {
    "./tools-data": { TOOLS_DATA: tools, getToolBySlug },
    "./offer-snapshot.json": { sources: {}, offers: [
      { ...base, slug: "example-free-plan", sourceKey: "vendor:example", evidence: "Our free plan includes one workspace.", dealType: "free_plan", checkedAt: new Date(clock.now).toISOString() },
      { ...base, slug: "example-old-code", sourceKey: "reviewed:old-code", dealType: "coupon", code: "OLD", checkedAt: new Date(clock.now - 13 * 86400000).toISOString() },
    ] },
    "./legacy-deal-aliases.json": { "legacy-code": "example-alias" },
    "./offer-url-history.json": { offers: { "deleted-code": "example", "deal-deleted-code": "example", "gone-code": "gone", "missing-brand-code": "absent" } },
    "@/lib/offer-links": { publicHttpsUrl: url => url?.startsWith("https://") ? url : undefined },
    "@/lib/offer-evidence.mjs": { discoverVendorOffer },
  }, TestDate);
  return { catalog, clock, getToolBySlug };
}

test("retired identifiers retain the same available brand without reviving expired offers", () => {
  const { catalog, clock } = catalogFixture();
  assert.equal(catalog.getRetiredOfferToolSlug("example-old-code"), undefined);
  assert.equal(catalog.getRetiredOfferToolSlug("deal-example-free-plan"), undefined);
  clock.now += 2 * 86400000;
  assert.equal(catalog.getDealBySlug("example-old-code"), undefined);
  assert.equal(catalog.getRetiredOfferToolSlug("example-old-code"), "example");
  for (const id of ["deleted-code", "deal-deleted-code", "legacy-code"]) assert.equal(catalog.getRetiredOfferToolSlug(id), "example");
  assert.equal(catalog.getHistoricOfferToolSlug("deal-deleted-code"), "example");
  assert.ok(catalog.getAllDeals().every(deal => deal.code !== "OLD"));
  for (const id of ["gone-code", "missing-brand-code", "example-made-up-code", "deal-made-up-code", "__proto__"]) assert.equal(catalog.getRetiredOfferToolSlug(id), undefined);
  assert.equal(catalog.getHistoricOfferToolSlug("gone-code"), "gone", "outbound route can still return an intentional 410");
});

function loadDealPage(catalog, getToolBySlug, guide) {
  const redirects = [];
  const redirect = destination => {
    redirects.push(destination);
    throw Object.assign(new Error("redirect"), { status: 308, destination });
  };
  const notFound = () => { throw Object.assign(new Error("not-found"), { status: 404 }); };
  const page = loadTs("app/deals/[slug]/page.tsx", {
    "next/navigation": { permanentRedirect: redirect, notFound },
    "@/lib/data/deals-data": catalog,
    "@/lib/data/tools-data": { getToolBySlug },
    "@/components/deals/DealDetailClient": {},
    "@/lib/seo": {
      pageMetadata: value => value, dealSearchTitle: deal => deal.title, dealMetaDescription: () => "Current offer terms",
      toolSearchTitle: name => `${name} Pricing`, toolMetaDescription: name => `${name} provider pricing`,
    },
    "@/components/seo/JsonLd": {},
    "@/lib/structured-data": {},
    "@/lib/catalog-links": {},
    "@/lib/brand-discounts": {
      hasBrandDiscountPage: () => guide.exists,
      getBrandDiscountData: () => ({ indexable: guide.indexable, offers: [] }),
      brandDiscountTitle: tool => `${tool.name} Discounts`, brandDiscountDescription: tool => `${tool.name} current discount guide`,
    },
  });
  return { ...page, redirects };
}

test("metadata supplies canonical destinations while only the page emits one retired-offer redirect", async () => {
  const { catalog, clock, getToolBySlug } = catalogFixture();
  clock.now += 2 * 86400000;
  for (const guide of [{ exists: true, indexable: true }, { exists: true, indexable: false }, { exists: false, indexable: false }]) {
    const page = loadDealPage(catalog, getToolBySlug, guide);
    const destination = `/${guide.exists && guide.indexable ? "discounts" : "tools"}/example`;
    for (const slug of ["example-old-code", "deleted-code", "legacy-code"]) {
      const before = page.redirects.length;
      const metadata = await page.generateMetadata({ params: Promise.resolve({ slug }) });
      assert.equal(metadata.path, destination);
      assert.equal(page.redirects.length, before, "metadata must not emit a redirect header");
      await assert.rejects(page.default({ params: Promise.resolve({ slug }) }), error => error.status === 308 && error.destination === destination);
      assert.deepEqual(page.redirects.slice(before), [destination], "one Location per metadata/page render pair");
    }
    for (const render of [page.generateMetadata, page.default]) {
      for (const slug of ["gone-code", "missing-brand-code", "example-fabricated-coupon", "__proto__"]) {
        await assert.rejects(render({ params: Promise.resolve({ slug }) }), error => error.status === 404);
      }
    }
    const before = page.redirects.length;
    assert.equal((await page.generateMetadata({ params: Promise.resolve({ slug: "deal-example-free-plan" }) })).path, "/deals/example-free-plan");
    assert.equal(page.redirects.length, before);
    await assert.rejects(page.default({ params: Promise.resolve({ slug: "deal-example-free-plan" }) }), error => error.status === 308 && error.destination === "/deals/example-free-plan");
    assert.deepEqual(page.redirects.slice(before), ["/deals/example-free-plan"]);
    assert.equal((await page.generateMetadata({ params: Promise.resolve({ slug: "example-free-plan" }) })).path, "/deals/example-free-plan");
  }
});

test("recovered published examples resolve exactly while unknown lookalikes remain unknown", () => {
  const catalog = loadCatalogModule("lib/data/deals-data.ts");
  const { getToolBySlug } = loadCatalogModule("lib/data/tools-data.ts");
  const history = JSON.parse(readFileSync(path.join(root, "lib/data/offer-url-history.json"), "utf8"));
  for (const [id, brand] of [["meetgeek-free-plan", "meetgeek"], ["browserbase-free-plan", "browserbase"], ["dubb-free-trial", "dubb"], ["recraft-free-plan", "recraft"]]) {
    assert.equal(history.offers[id], brand);
    assert.equal(catalog.getHistoricOfferToolSlug(id), brand);
    assert.equal(catalog.getHistoricOfferToolSlug(`deal-${id}`), brand);
    assert.equal(getToolBySlug(brand).providerStatus === "unavailable", false);
  }
  assert.equal(catalog.getHistoricOfferToolSlug("meetgeek-invented-private-deal"), undefined);
});

test("outbound redirects for deleted known codes use current provider pricing and never a stale campaign", async () => {
  const { catalog, getToolBySlug } = catalogFixture();
  const route = loadTs("app/go/[id]/route.ts", {
    "@/lib/data/deals-data": catalog,
    "@/lib/data/tools-data": { getToolBySlug },
    "@/lib/data/affiliate-links": { getCustomAffiliateUrl: () => "https://example.com/?ref=saasfolio" },
    "@/lib/offer-links": { publicHttpsUrl: url => url?.startsWith("https://") ? url : undefined },
  });
  const visit = id => route.GET(new Request(`https://saasfolio.tech/go/${id}`), { params: Promise.resolve({ id }) });
  for (const id of ["deleted-code", "deal-deleted-code"]) {
    const response = await visit(id);
    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "https://example.com/pricing");
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
  assert.equal((await visit("gone-code")).status, 410);
  for (const id of ["example-invented-code", "missing-brand-code", "__proto__"]) {
    const response = await visit(id);
    assert.equal(response.status, 404);
    assert.equal(response.headers.get("location"), null);
  }
});

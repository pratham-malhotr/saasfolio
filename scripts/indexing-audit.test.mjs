import test from "node:test";
import assert from "node:assert/strict";
import { auditIndexing, failureCsv, inspectHtml, parseArguments, parseSitemap, parseUrlInput } from "./audit-indexing.mjs";

const canonicalOrigin = "https://saasfolio.test";
const origin = "http://127.0.0.1:3214";
const options = { origin, canonicalOrigin, concurrency: 2, delay: 0, timeout: 1000, userAgent: "IndexingAuditTest/1.0" };
const xml = locations => `<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${locations.map(loc => `<url><loc>${loc.replaceAll("&", "&amp;")}</loc></url>`).join("")}</urlset>`;
const html = (path, extra = "") => `<!doctype html><html><head><title>Fixture</title><link rel="canonical" href="${canonicalOrigin}${path}">${extra}</head><body>Fixture</body></html>`;
const response = (body, status = 200, headers = {}) => new Response(body, { status, headers: { "Content-Type": "text/html", ...headers } });

test("CLI validates bounded request settings and supports both flag styles", () => {
  assert.deepEqual(parseArguments([origin, "--canonical-origin", canonicalOrigin, "--concurrency=2", "--delay", "0", "--json=/tmp/review.json"]).json, "/tmp/review.json");
  assert.equal(parseArguments([]).origin, origin);
  assert.throws(() => parseArguments(["--concurrency=0"]), /concurrency/);
  assert.throws(() => parseArguments(["https://example.test/path"]), /origin/i);
  assert.throws(() => parseArguments(["--unknown=1"]), /Unknown/);
  assert.throws(() => parseArguments(["--urls-only"]), /requires --urls/);
  assert.equal(parseArguments(["--urls", "owner.csv", "--urls-only"]).urlsOnly, true);
});

test("owner URL input preserves CSV quoting, escaped queries and plain URL commas", () => {
  assert.deepEqual(parseUrlInput('\uFEFF"URL","Last crawled"\r\n"https://saasfolio.test/a?x=a,b","2026-10-27"\r\n"/deals/old","2026-10-26"\r\n'), [`${canonicalOrigin}/a?x=a,b`, "/deals/old"]);
  assert.deepEqual(parseUrlInput(`${canonicalOrigin}/a?x=a,b\n${canonicalOrigin}/a?x=a,b\n/discounts/brand\n`), [`${canonicalOrigin}/a?x=a,b`, "/discounts/brand"]);
  assert.throws(() => parseUrlInput('"URL"\n"https://saasfolio.test/unclosed'), /unclosed/);
});

test("sitemap parsing distinguishes indexes and rejects malformed/empty XML", () => {
  assert.equal(parseSitemap(xml([`${canonicalOrigin}/a?one=1&two=2`])).entries[0].loc, `${canonicalOrigin}/a?one=1&two=2`);
  const index = parseSitemap(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${canonicalOrigin}/child.xml</loc></sitemap></sitemapindex>`);
  assert.equal(index.kind, "sitemapindex");
  assert.equal(index.entries.length, 1);
  assert.equal(parseSitemap("<html>Not a sitemap</html>").issues[0].code, "invalid_sitemap_xml");
  assert.ok(parseSitemap('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>https://a.test/').issues.length);
  assert.ok(parseSitemap('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>').issues.some(item => item.code === "empty_sitemap"));
  assert.ok(parseSitemap(xml([`${canonicalOrigin}/a`]).replace("</url>", "</url><bad/>" )).issues.some(item => item.code === "invalid_sitemap_structure"));
});

test("HTML evidence accepts normal attribute forms and catches body-injected noindex", () => {
  const inspected = inspectHtml("<html><head><link href='https://saasfolio.test/a?x=1&amp;y=2' REL='canonical'><title>A &amp; B</title></head><body><meta name='googlebot' content='none'></body></html>");
  assert.deepEqual(inspected.canonicals, [`${canonicalOrigin}/a?x=1&y=2`]);
  assert.equal(inspected.title, "A & B");
  assert.equal(inspected.noindex, true);
});

test("audit continues across HTTP/network failures, follows only trusted redirects, and saves actionable rows", async () => {
  const paths = ["/ok", "/forbidden", "/limited", "/gone", "/broken", "/offline", "/hidden", "/canonical-wrong", "/blocked", "/redirected", "/api/auth/callback"];
  const calls = [];
  let active = 0, maxActive = 0;
  const fetcher = async (url, init) => {
    calls.push(url);
    assert.equal(new URL(url).origin, origin, "No canonical/external network requests");
    assert.equal(init.method, "GET");
    assert.equal(init.redirect, "manual");
    active++; maxActive = Math.max(maxActive, active);
    try {
      await new Promise(resolve => setTimeout(resolve, 1));
      const path = new URL(url).pathname;
      if (path === "/robots.txt") return response(`User-agent: *\nDisallow: /blocked\nSitemap: ${canonicalOrigin}/sitemap.xml\n`, 200, { "Content-Type": "text/plain" });
      if (path === "/sitemap.xml") return response(xml(paths.map(path => `${canonicalOrigin}${path}`)), 200, { "Content-Type": "application/xml" });
      if (path === "/offline") throw new TypeError("Fixture network failure");
      const statuses = { "/forbidden": 403, "/limited": 429, "/gone": 404, "/broken": 503, "/profile": 403 };
      if (statuses[path]) return response("Failure fixture", statuses[path]);
      if (path === "/redirected" || path === "/legacy") return response("", 308, { Location: `${canonicalOrigin}/ok` });
      if (path === "/duplicate-location") return response("", 308, { Location: "/ok, /ok" });
      if (path === "/outbound" || path === "/go/brand") return response("", 302, { Location: "https://never-fetch.example/offer", "X-Robots-Tag": "noindex" });
      return response(html(path === "/canonical-wrong" ? "/elsewhere" : path, path === "/hidden" ? '<meta name="robots" content="noindex">' : ""));
    } finally { active--; }
  };
  const report = await auditIndexing({ ...options, importedUrls: [`${canonicalOrigin}/legacy`, `${canonicalOrigin}/outbound`, `${canonicalOrigin}/duplicate-location`, `${canonicalOrigin}/profile`, `${canonicalOrigin}/go/brand`, `${canonicalOrigin}/auth/callback?code=must-not-exchange`, `${canonicalOrigin}/newsletter/confirm?token=fixture-do-not-confirm`, "https://external.example/page"] }, { fetch: fetcher });
  assert.equal(report.summary.sitemapUrls, paths.length);
  assert.equal(report.summary.classificationCounts["403"], 2);
  assert.equal(report.summary.publicStatusCounts["403"], 1);
  assert.equal(report.summary.expectedPrivateStatusCounts["403"], 1);
  assert.equal(report.summary.classificationCounts["429"], 1);
  assert.equal(report.summary.classificationCounts["404"], 1);
  assert.equal(report.summary.classificationCounts["5xx"], 1);
  assert.equal(report.summary.classificationCounts.network, 1);
  assert.equal(report.skipped[0].reason, "external_or_unsafe_url");
  assert.ok(maxActive <= 2);
  assert.ok(!calls.some(url => /\/(?:api|auth|newsletter)(?:\/|$)/.test(new URL(url).pathname)));
  const page = path => report.pages.find(page => new URL(page.url).pathname === path);
  assert.equal(page("/legacy").finalUrl, `${canonicalOrigin}/ok`);
  assert.equal(page("/legacy").finalStatus, 200);
  assert.equal(page("/outbound").redirects[0].followed, false);
  assert.ok(page("/duplicate-location").issues.some(item => item.code === "ambiguous_redirect_location"));
  assert.ok(!calls.some(url => url.includes("%20") || url.includes(",")), "Never follow a combined duplicate Location value");
  assert.equal(page("/profile").expectedPrivate, true);
  assert.ok(!page("/profile").issues.some(item => item.severity === "error"));
  assert.ok(page("/hidden").issues.some(item => item.code === "page_noindex"));
  assert.ok(page("/canonical-wrong").issues.some(item => item.code === "canonical_mismatch"));
  assert.ok(page("/blocked").issues.some(item => item.code === "robots_disallow"));
  assert.ok(page("/redirected").issues.some(item => item.code === "sitemap_redirect"));
  assert.ok(page("/api/auth/callback").issues.some(item => item.code === "utility_in_sitemap"));
  assert.equal(page("/newsletter/confirm").classification, "skipped_private");
  assert.ok(!page("/newsletter/confirm").issues.some(item => item.severity === "error"));
  assert.match(failureCsv(report), /"403"/);
  assert.match(failureCsv(report), /canonical_mismatch/);
});

test("nested sitemap validation rejects external/duplicate locations and never requests private endpoints", async () => {
  const calls = [];
  const fetcher = async url => {
    calls.push(url);
    const path = new URL(url).pathname;
    if (path === "/robots.txt") return response(`Sitemap: ${canonicalOrigin}/sitemap.xml`, 200, { "Content-Type": "text/plain" });
    if (path === "/sitemap.xml") return response(`<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><sitemap><loc>${canonicalOrigin}/child.xml</loc></sitemap><sitemap><loc>${canonicalOrigin}/api/auth/callback</loc></sitemap><sitemap><loc>https://external.example/sitemap.xml</loc></sitemap></sitemapindex>`, 200, { "Content-Type": "text/xml" });
    if (path === "/child.xml") return response(xml([`${canonicalOrigin}/ok`, `${canonicalOrigin}/ok`]), 200, { "Content-Type": "text/xml" });
    return response(html(path));
  };
  const report = await auditIndexing(options, { fetch: fetcher });
  assert.equal(report.pages.length, 1);
  assert.ok(report.documents.flatMap(document => document.issues).some(item => item.code === "duplicate_sitemap_url"));
  assert.ok(report.documents.flatMap(document => document.issues).some(item => item.code === "sitemap_origin"));
  assert.ok(report.documents.flatMap(document => document.issues).some(item => item.code === "utility_sitemap_document"));
  assert.ok(!calls.some(url => url.includes("external.example") || url.includes("/api/")));
});

test("imported alternate/query and excluded pages are distinguished from bad sitemap entries", async () => {
  const fetcher = async url => {
    const target = new URL(url);
    if (target.pathname === "/robots.txt") return response(`Sitemap: ${canonicalOrigin}/sitemap.xml`, 200, { "Content-Type": "text/plain" });
    if (target.pathname === "/sitemap.xml") return response(xml([`${canonicalOrigin}/deals`]), 200, { "Content-Type": "text/xml" });
    if (target.pathname === "/deals/brand-pricing") return response(html(target.pathname, '<meta name="robots" content="noindex">'));
    return response(html(target.pathname));
  };
  const report = await auditIndexing({ ...options, importedUrls: [`${canonicalOrigin}/deals?utm_source=old`, `${canonicalOrigin}/deals/brand-pricing`] }, { fetch: fetcher });
  assert.equal(report.summary.errors, 0);
  const alternate = report.pages.find(page => page.url.includes("utm_source"));
  assert.ok(alternate.issues.some(item => item.code === "canonical_alternate" && item.severity === "info"));
  const excluded = report.pages.find(page => page.url.endsWith("brand-pricing"));
  assert.ok(excluded.issues.some(item => item.code === "page_noindex" && item.severity === "warning"));
});

test("canonical root slash equivalence preserves non-root trailing slash differences and raw evidence", async () => {
  const fetcher = async url => {
    const path = new URL(url).pathname;
    if (path === "/robots.txt") return response(`Sitemap: ${canonicalOrigin}/sitemap.xml`, 200, { "Content-Type": "text/plain" });
    if (path === "/sitemap.xml") return response(xml([canonicalOrigin, `${canonicalOrigin}/page`]), 200, { "Content-Type": "text/xml" });
    return response(html(path === "/" ? "" : "/page/"));
  };
  const report = await auditIndexing(options, { fetch: fetcher });
  const root = report.pages.find(page => page.url === `${canonicalOrigin}/`);
  assert.deepEqual(root.canonical, [canonicalOrigin], "Keep the actual HTML canonical in the report");
  assert.ok(!root.issues.some(item => item.code === "canonical_mismatch"));
  const nonRoot = report.pages.find(page => page.url === `${canonicalOrigin}/page`);
  assert.ok(nonRoot.issues.some(item => item.code === "canonical_mismatch"), "/page and /page/ remain distinct");
  assert.equal(report.summary.errors, 1);
});

test("import-only scope retains sitemap context without crawling unrelated sitemap pages", async () => {
  const calls = [];
  const fetcher = async url => {
    const path = new URL(url).pathname;
    calls.push(path);
    if (path === "/robots.txt") return response(`Sitemap: ${canonicalOrigin}/sitemap.xml`, 200, { "Content-Type": "text/plain" });
    if (path === "/sitemap.xml") return response(xml([`${canonicalOrigin}/ok`, `${canonicalOrigin}/unrelated`]), 200, { "Content-Type": "text/xml" });
    if (path === "/legacy") return response("", 308, { Location: "/ok" });
    return response(html(path));
  };
  const report = await auditIndexing({ ...options, urlsOnly: true, importedUrls: [`${canonicalOrigin}/legacy`] }, { fetch: fetcher });
  assert.equal(report.summary.sitemapUrls, 2);
  assert.equal(report.summary.auditedUrls, 1);
  assert.equal(report.summary.errors, 0);
  assert.match(report.settings.scope, /imported-pages-only/);
  assert.deepEqual(calls, ["/robots.txt", "/sitemap.xml", "/legacy", "/ok"]);
});

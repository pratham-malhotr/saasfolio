import test from "node:test";
import assert from "node:assert/strict";
import { inspectArticleHtml, queryVisibility, validateSearchConsoleInput, articleVisibility } from "./lib/article-seo.mjs";

function fixture() {
  const url = "https://saasfolio.tech/articles/test-hosting-decision";
  const paragraph = "A representative hosting decision needs application requirements, an explicit data owner, documented provider sources and a tested recovery plan. ".repeat(4).trim();
  const article = { slug: "test-hosting-decision", title: "A practical hosting decision", summary: "Compare a suitable hosting configuration using application needs, documented responsibilities and a tested recovery plan.", publishedAt: "2026-01-01", updatedAt: "2026-01-02", author: { name: "SaaSFolio editorial" }, tags: ["Hosting", "Application recovery"], coverImage: { src: "/images/hosting/test.webp", alt: "Conceptual independent data vault" }, sections: Array.from({ length: 5 }, (_, i) => ({ id: `section-${i}`, heading: `Decision ${i}`, content: paragraph })), sources: [{ url: "https://example.com/primary-documentation" }] };
  const title = `${article.title} | SaaSFolio`;
  const structured = { "@context": "https://schema.org", "@graph": [{ "@type": "Organization", "@id": "https://saasfolio.tech/#organization" }, { "@type": "Article", "@id": `${url}#article`, headline: article.title, wordCount: article.sections.reduce((n, s) => n + s.content.split(/\s+/).length, 0), datePublished: "2026-01-01T00:00:00.000Z", dateModified: "2026-01-02T00:00:00.000Z", author: { "@id": "https://saasfolio.tech/#organization" }, publisher: { "@id": "https://saasfolio.tech/#organization" }, citation: article.sources.map(s => s.url) }, { "@type": "BreadcrumbList" }] };
  const html = `<html><head><title>${title}</title><link rel="canonical" href="${url}"><meta name="description" content="${article.summary}"><meta name="robots" content="index, follow"><meta property="og:title" content="${title}"><meta property="og:description" content="${article.summary}"><meta property="og:url" content="${url}"><meta property="og:image" content="${url}/opengraph-image"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${title}"><meta name="twitter:description" content="${article.summary}"><meta name="twitter:image" content="${url}/opengraph-image"><script type="application/ld+json">${JSON.stringify(structured)}</script></head><body><main><h1>${article.title}</h1><p>${article.author.name}</p><img src="${article.coverImage.src}" alt="${article.coverImage.alt}" width="1440" height="810">${article.sections.map(s => `<section id="${s.id}"><h2>${s.heading}</h2><p>${s.content}</p></section>`).join("")}<section id="references"><a href="${article.sources[0].url}">Primary documentation</a></section><a href="/articles/related-one">Related decision one</a><a href="/articles/related-two">Related decision two</a></main></body></html>`;
  return { html, article, canonicalUrl: url, sitemapUrls: new Set([url]), coverAssetOkay: true, socialImageOkay: true, now: Date.parse("2026-02-01") };
}
test("SEO checklist reports the evidence behind its twenty equally weighted checks", () => {
  const result = inspectArticleHtml(fixture());
  assert.equal(result.checks.length, 20); assert.equal(result.score, 100);
  assert.deepEqual(result.findings, []);
  assert.ok(result.checks.every(check => check.points === 5 && check.evidence !== undefined));
});
test("a hidden noindex, wrong canonical and duplicate heading cannot receive a clean score", () => {
  const input = fixture();
  input.html = input.html.replace('href="https://saasfolio.tech/articles/test-hosting-decision"', 'href="https://saasfolio.tech/articles/wrong-page"').replace("</main>", '<meta name="googlebot" content="noindex"><h1>Duplicate primary heading</h1></main>');
  const result = inspectArticleHtml(input);
  assert.equal(result.score, 85);
  assert.deepEqual(result.checks.filter(check => !check.passed).map(check => check.id), ["canonical", "indexable", "h1"]);
});
test("missing actual content, invalid schema and failed assets are separate failures", () => {
  const input = fixture(); input.html = input.html.replaceAll(input.article.sections[0].content, "Loading article...").replace('"@type":"Article"', '"@type":"NotAnArticle"');
  input.coverAssetOkay = false; input.socialImageOkay = false;
  const result = inspectArticleHtml(input);
  for (const id of ["rendered-content", "cover", "sharing-image", "article-schema", "dates", "attribution", "references"]) assert.equal(result.checks.find(check => check.id === id).passed, false, id);
});
test("visibility index weights observed impressions and never invents a zero for absent data", () => {
  assert.equal(queryVisibility([{ query: "specific hosting need", impressions: 10, position: 2 }, { query: "other hosting need", impressions: 30, position: 20 }]).score, 25);
  assert.equal(queryVisibility([]).score, null);
  assert.equal(queryVisibility([{ query: "no observations", impressions: 0, position: 1 }]).score, null);
  assert.throws(() => queryVisibility([{ query: "invalid", impressions: 10, position: 0 }]));
});
test("private performance input must match the property, historical period and article scope", () => {
  const input = { source: "Google Search Console browser report", property: "sc-domain:saasfolio.tech", pageFilter: { operator: "contains", value: "/articles/" }, capturedAt: "2026-01-31T12:00:00Z", period: { start: "2026-01-01", end: "2026-01-30" }, totals: { clicks: 0, impressions: 2, position: 20 }, queries: [], pages: [{ url: "https://www.saasfolio.tech/articles/test-hosting-decision", clicks: 0, impressions: 2, position: 20 }], pageQueries: {} };
  assert.equal(validateSearchConsoleInput(input), input);
  assert.throws(() => validateSearchConsoleInput({ ...input, property: "sc-domain:other.example" }));
  assert.throws(() => validateSearchConsoleInput({ ...input, period: { start: "2026-01-01", end: "2026-02-30" } }));
  const old = articleVisibility({ slug: "test-hosting-decision", publishedAt: "2026-01-01" }, input);
  assert.equal(old.searchTermVisibilityScore, null); assert.equal(old.metrics.impressions, 2);
  assert.equal(articleVisibility({ slug: "new-guide", publishedAt: "2026-01-31" }, input).status, "published_after_measurement_window");
  assert.equal(articleVisibility({ slug: "new-guide" }, null).searchTermVisibilityScore, null);
});

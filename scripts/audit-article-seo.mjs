import { readFile, writeFile, mkdir, stat, chmod } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { loadCatalogModule } from "./lib/load-catalog.mjs";
import { inspectArticleHtml, articleVisibility, validateSearchConsoleInput, queryVisibility, SEO_SCORE_VERSION } from "./lib/article-seo.mjs";

const origin = new URL(process.argv[2] || "http://127.0.0.1:3210");
if (!["http:", "https:"].includes(origin.protocol) || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/") throw new Error("Use an HTTP(S) website origin.");
const flags = {};
for (let i = 3; i < process.argv.length; i += 2) {
  if (!["--gsc-json", "--output", "--delay"].includes(process.argv[i]) || !process.argv[i + 1]) throw new Error("Supported options: --gsc-json <private input>, --output <report.json>, --delay <milliseconds>.");
  flags[process.argv[i]] = process.argv[i + 1];
}
const delayMs = Number(flags["--delay"] || 0);
if (!Number.isInteger(delayMs) || delayMs < 0 || delayMs > 5000) throw new Error("Delay must be between 0 and 5000 milliseconds.");
const day = new Date().toISOString().slice(0, 10);
const output = resolve(flags["--output"] || `${flags["--gsc-json"] ? ".local-data/seo" : "docs/reports"}/article-seo-${day}.json`);
if (!output.endsWith(".json")) throw new Error("The report filename must end with .json.");
const gsc = flags["--gsc-json"] ? validateSearchConsoleInput(JSON.parse(await readFile(flags["--gsc-json"], "utf8"))) : null;
const { DETAILED_ARTICLES: articles } = loadCatalogModule("lib/data/articles-data.ts");
const { SITE_URL } = loadCatalogModule("lib/seo.ts");
const canonicalOrigin = new URL(SITE_URL).origin;
const request = path => fetch(new URL(path, origin), { headers: { "User-Agent": "SaaSFolioArticleAudit/1.0" }, redirect: "manual", signal: AbortSignal.timeout(30000) });
const sitemapResponse = await request("/sitemap.xml");
if (sitemapResponse.status !== 200) throw new Error(`Sitemap unavailable: HTTP ${sitemapResponse.status}`);
const sitemap = await sitemapResponse.text();
const sitemapUrls = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1].replaceAll("&amp;", "&")));
const observations = [];
for (const article of articles) {
  const canonicalUrl = `${canonicalOrigin}/articles/${article.slug}`;
  try {
    const response = await request(`/articles/${article.slug}`);
    if (response.status !== 200 || !response.headers.get("content-type")?.includes("text/html")) throw new Error(`Article HTML unavailable: HTTP ${response.status}`);
    const html = await response.text();
    const headers = Object.fromEntries(response.headers);
    let coverAssetOkay = false;
    if (article.coverImage?.src.startsWith("/images/") && !article.coverImage.src.includes("..")) {
      try { const file = await stat(resolve("public", `.${article.coverImage.src}`)); coverAssetOkay = file.isFile() && file.size > 1000; } catch { /* report absent cover */ }
    }
    const initial = inspectArticleHtml({ html, article, canonicalUrl, headers, sitemapUrls, coverAssetOkay });
    let socialImageOkay = false;
    try {
      const image = new URL(initial.signals.sharingImage);
      if (image.origin === canonicalOrigin && image.pathname === `/articles/${article.slug}/opengraph-image`) {
        const response = await request(image.pathname);
        socialImageOkay = response.status === 200 && Boolean(response.headers.get("content-type")?.startsWith("image/")) && (await response.arrayBuffer()).byteLength > 1000;
      }
    } catch { /* report unavailable sharing image */ }
    observations.push({ article, html, canonicalUrl, headers, coverAssetOkay, socialImageOkay, title: initial.signals.title, description: initial.signals.description });
  } catch (error) {
    observations.push({ article, canonicalUrl, error: error.message });
  }
  if (observations.length % 10 === 0) console.log(`Article SEO: ${observations.length}/${articles.length}`);
  if (delayMs) await new Promise(resolve => setTimeout(resolve, delayMs));
}
const frequencies = key => observations.reduce((map, row) => row[key] ? map.set(row[key], (map.get(row[key]) || 0) + 1) : map, new Map());
const titles = frequencies("title"), descriptions = frequencies("description");
const rows = observations.map(row => ({
  ...(row.error ? { slug: row.article.slug, title: row.article.title, url: row.canonicalUrl, score: null, findings: [row.error], checks: [] } : inspectArticleHtml({ ...row, sitemapUrls, duplicateTitle: titles.get(row.title) > 1, duplicateDescription: descriptions.get(row.description) > 1 })),
  publishedAt: row.article.publishedAt,
  visibility: articleVisibility(row.article, gsc),
}));
const measured = rows.filter(row => row.score !== null);
const report = {
  generatedAt: new Date().toISOString(), scoreVersion: SEO_SCORE_VERSION,
  scope: `${["localhost", "127.0.0.1", "[::1]"].includes(origin.hostname) ? "Local production preview" : "Live website"}: rendered HTTP responses and sharing images at ${origin.origin}; local cover files checked against this checkout.`,
  methodology: "Twenty equally weighted, reproducible on-page checks; five points per passing check. This custom checklist is not a Google score and does not measure keyword difficulty, performance, backlinks, editorial originality or ranking probability. A transport failure remains unscored rather than receiving a fabricated zero.",
  summary: { articles: rows.length, scored: measured.length, unavailable: rows.length - measured.length, averageScore: measured.length ? Math.round(10 * measured.reduce((sum, row) => sum + row.score, 0) / measured.length) / 10 : null, minimumScore: measured.length ? Math.min(...measured.map(row => row.score)) : null, failedChecks: measured.reduce((sum, row) => sum + row.findings.length, 0) },
  searchConsole: gsc ? { property: gsc.property, capturedAt: gsc.capturedAt, period: gsc.period, filter: gsc.pageFilter, totals: gsc.totals, observedQueryVisibility: queryVisibility(gsc.queries), queryImpressionCoveragePercent: gsc.totals.impressions ? Math.round(1000 * gsc.queries.reduce((sum, row) => sum + row.impressions, 0) / gsc.totals.impressions) / 10 : null, limitations: gsc.limitations } : { status: "not_supplied", note: "Actual visibility needs measured Search Console observations. Missing visibility is null, not zero." },
  articles: rows,
};
await mkdir(dirname(output), { recursive: true });
const writeOptions = gsc ? { mode: 0o600 } : {};
await writeFile(output, JSON.stringify(report, null, 2) + "\n", writeOptions);
const csv = value => `"${String(value ?? "").replaceAll('"', '""')}"`;
await writeFile(output.replace(/\.json$/, ".csv"), [["slug", "on_page_seo_score", "search_term_visibility_score", "visibility_status", "observed_impressions", "observed_clicks", "observed_average_position", "findings"], ...rows.map(row => [row.slug, row.score, row.visibility.searchTermVisibilityScore, row.visibility.status, row.visibility.metrics?.impressions, row.visibility.metrics?.clicks, row.visibility.metrics?.averagePosition, row.findings.join("; ")])].map(row => row.map(csv).join(",")).join("\n") + "\n", writeOptions);
const visibilitySummary = gsc ? `Measured ${gsc.period.start} through ${gsc.period.end}, article URLs only: ${gsc.totals.clicks} clicks, ${gsc.totals.impressions} impressions, reported average position ${gsc.totals.position}. The custom observed-query visibility index is ${report.searchConsole.observedQueryVisibility.score ?? "unmeasured"}/100 across ${report.searchConsole.observedQueryVisibility.observedQueries} reported queries. Query rows cover ${report.searchConsole.queryImpressionCoveragePercent ?? "unmeasured"}% of the chart impressions. Privacy-filtered queries are absent. Historical alias URLs are not attributed to rewritten canonical articles. New articles published after this window remain unmeasured.` : "Search visibility was not supplied; no search-ranking score has been invented.";
const markdown = `# Article SEO audit\n\n${report.scope}\n\n${report.methodology}\n\n${rows.length} articles; average ${report.summary.averageScore ?? "unmeasured"}/100, minimum ${report.summary.minimumScore ?? "unmeasured"}/100.\n\n${visibilitySummary}\n\n| Article | On-page SEO | Search visibility | Impressions | Average position | Findings |\n|---|---:|---|---:|---:|---|\n${rows.map(row => `| ${row.slug} | ${row.score ?? "Unscored"} | ${row.visibility.searchTermVisibilityScore ?? row.visibility.status} | ${row.visibility.metrics?.impressions ?? "Unmeasured"} | ${row.visibility.metrics?.averagePosition ?? "Unmeasured"} | ${row.findings.join("; ").replaceAll("|", "\\|") || "None"} |`).join("\n")}\n`;
await writeFile(output.replace(/\.json$/, ".md"), markdown, writeOptions);
if (gsc) await Promise.all([output, output.replace(/\.json$/, ".csv"), output.replace(/\.json$/, ".md")].map(file => chmod(file, 0o600)));
console.log(JSON.stringify(report.summary));
console.log(`Article SEO report: ${output}`);
const blocking = new Set(["http", "canonical", "indexable", "unique-title", "unique-description", "h1", "sections", "rendered-content", "cover", "sharing-image", "article-schema", "dates", "attribution", "references", "related-links", "discovery"]);
if (report.summary.unavailable || rows.some(row => row.checks.some(check => !check.passed && blocking.has(check.id)))) process.exitCode = 1;

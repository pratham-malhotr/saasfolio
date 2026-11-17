import { parse } from "parse5";

export const SEO_SCORE_VERSION = "saasfolio-article-checklist-v1";
export const attr = (node, name) => node?.attrs?.find(item => item.name === name)?.value;
export const nodes = (node, predicate) => !node ? [] : [...(predicate(node) ? [node] : []), ...(node.childNodes || []).flatMap(child => nodes(child, predicate))];
export const textContent = node => !node || ["script", "style", "template"].includes(node.tagName) ? "" : node.value || (node.childNodes || []).map(textContent).join(" ");
const compact = value => String(value || "").replace(/\s+/g, " ").trim();
const elements = (node, tag) => nodes(node, item => item.tagName === tag);
const https = value => { try { const u = new URL(value); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } };

export function inspectArticleHtml({ html, article, canonicalUrl, status = 200, headers = {}, sitemapUrls = new Set(), duplicateTitle = false, duplicateDescription = false, coverAssetOkay = false, socialImageOkay = false, now = Date.now() }) {
  const document = parse(html), head = elements(document, "head")[0], main = elements(document, "main")[0];
  const meta = key => attr(elements(head, "meta").find(node => [attr(node, "name"), attr(node, "property")].includes(key)), "content");
  const title = compact(textContent(elements(head, "title")[0])), description = meta("description") || "";
  const canonicals = elements(head, "link").filter(node => attr(node, "rel") === "canonical");
  const heading = elements(main, "h1"), visible = compact(textContent(main));
  const robots = [...elements(document, "meta").filter(node => ["robots", "googlebot"].includes(attr(node, "name"))).map(node => attr(node, "content")), headers["x-robots-tag"]].filter(Boolean).join(",");
  const schemas = []; let malformedSchema = false;
  function flatten(value) { if (Array.isArray(value)) return value.flatMap(flatten); if (!value || typeof value !== "object") return []; return value["@graph"] ? [value, ...value["@graph"].flatMap(flatten)] : [value]; }
  for (const script of elements(document, "script").filter(node => attr(node, "type") === "application/ld+json")) {
    try { schemas.push(...flatten(JSON.parse((script.childNodes || []).map(node => node.value || "").join("")))); }
    catch { malformedSchema = true; }
  }
  const structuredArticles = schemas.filter(value => ["Article", "BlogPosting"].includes(value["@type"]));
  const structured = structuredArticles[0];
  const wordCount = article.sections.reduce((count, section) => count + section.content.split(/\s+/).length, 0);
  const citations = elements(nodes(main, node => attr(node, "id") === "references")[0], "a").map(node => attr(node, "href"));
  const sourceUrls = (article.sources || []).map(source => source.url);
  const related = new Set(elements(main, "a").map(node => attr(node, "href")).filter(href => /^\/articles\/[^/#?]+$/.test(href || "") && href !== new URL(canonicalUrl).pathname));
  const expectedCover = article.coverImage?.src;
  const cover = elements(main, "img").find(node => compact(attr(node, "alt")) === compact(article.coverImage?.alt) && article.coverImage?.alt);
  let matchingCoverPath = false;
  try { matchingCoverPath = Boolean(expectedCover && decodeURIComponent(attr(cover, "src") || "").includes(expectedCover)); } catch { /* invalid encoded source */ }
  const dates = structured ? [structured.datePublished, structured.dateModified] : [];
  const checks = [
    ["http", "Successful public response", status === 200, `HTTP ${status}`],
    ["canonical", "One matching canonical URL", canonicals.length === 1 && attr(canonicals[0], "href") === canonicalUrl, canonicals.map(node => attr(node, "href"))],
    ["indexable", "No blocking indexing directive", Boolean(meta("robots")) && !/(?:^|[\s,:])(noindex|none)(?:$|[\s,])/i.test(robots), robots],
    ["title", "Descriptive title with a practical display length", elements(head, "title").length === 1 && title.includes(article.title) && title.includes("SaaSFolio") && title.length >= 20 && title.length <= 90, { title, characters: title.length }],
    ["unique-title", "Unique article title", !duplicateTitle, title],
    ["description", "Useful concise meta description", elements(head, "meta").filter(node => attr(node, "name") === "description").length === 1 && description.length >= 70 && description.length <= 160, { description, characters: description.length }],
    ["unique-description", "Unique article description", !duplicateDescription, description],
    ["h1", "One matching visible primary heading", heading.length === 1 && compact(textContent(heading[0])) === compact(article.title), heading.map(node => compact(textContent(node)))],
    ["sections", "Crawlable sections and unique anchors", article.sections.length >= 5 && article.sections.every(section => nodes(main, node => attr(node, "id") === section.id).length === 1 && compact(textContent(nodes(main, node => attr(node, "id") === section.id)[0])).includes(compact(section.heading))), { expectedSections: article.sections.length }],
    ["rendered-content", "Substantive article text exists before JavaScript", wordCount >= 300 && article.sections.every(section => visible.includes(compact(section.content.split(/\s+/).slice(0, 12).join(" ")))), { bodyWords: wordCount }],
    ["cover", "Valid cover, descriptive alt and explicit dimensions", Boolean(expectedCover && matchingCoverPath && coverAssetOkay && cover && attr(cover, "width") === "1440" && attr(cover, "height") === "810"), { path: expectedCover || null, alt: article.coverImage?.alt || null }],
    ["sharing-image", "Working sharing image", socialImageOkay && https(meta("og:image")), meta("og:image")],
    ["open-graph", "Matching social title, description and URL", meta("og:title") === title && meta("og:description") === description && meta("og:url") === canonicalUrl, meta("og:url")],
    ["twitter", "Complete large-image sharing card", meta("twitter:card") === "summary_large_image" && meta("twitter:title") === title && meta("twitter:description") === description && meta("twitter:image") === meta("og:image"), meta("twitter:card")],
    ["article-schema", "Valid matching Article structured data", !malformedSchema && structuredArticles.length === 1 && structured.headline === article.title && structured["@id"] === `${canonicalUrl}#article` && structured.wordCount === wordCount, { articles: structuredArticles.length, malformedSchema }],
    ["dates", "Valid honest publication and update dates", dates.length === 2 && dates.every(date => /^\d{4}-\d{2}-\d{2}T/.test(date || "") && Number.isFinite(Date.parse(date)) && Date.parse(date) <= now) && Date.parse(dates[1]) >= Date.parse(dates[0]) && dates[0].startsWith(article.publishedAt) && dates[1].startsWith(article.updatedAt), dates],
    ["attribution", "Visible author and structured publisher", visible.includes(article.author.name) && Boolean(structured?.author?.["@id"] && structured?.publisher?.["@id"]) && schemas.some(value => value["@type"] === "Organization" && value["@id"] === structured?.publisher?.["@id"]), article.author.name],
    ["references", "Visible HTTPS source references match citations", sourceUrls.length > 0 && sourceUrls.every(url => https(url) && citations.includes(url) && structured?.citation?.includes(url)), { references: sourceUrls.length }],
    ["related-links", "Contextual crawlable related reading", related.size >= 2, [...related]],
    ["discovery", "Sitemap and breadcrumb discovery", sitemapUrls.has(canonicalUrl) && schemas.some(value => value["@type"] === "BreadcrumbList"), { inSitemap: sitemapUrls.has(canonicalUrl) }],
  ].map(([id, label, passed, evidence]) => ({ id, label, passed: Boolean(passed), points: passed ? 5 : 0, possiblePoints: 5, evidence }));
  return { slug: article.slug, title: article.title, url: canonicalUrl, score: checks.reduce((sum, check) => sum + check.points, 0), scoreVersion: SEO_SCORE_VERSION, bodyWords: wordCount, topicTerms: article.tags.filter(tag => tag !== "Hosting"), signals: { title, description, sharingImage: meta("og:image") || null }, checks, findings: checks.filter(check => !check.passed).map(check => check.label) };
}

/** Custom observed-query index, not a Google metric or an estimate of all searches. */
export function queryVisibility(rows) {
  if (!Array.isArray(rows)) throw new Error("Search query observations must be an array.");
  let impressions = 0, topTenImpressions = 0;
  for (const row of rows) {
    if (typeof row.query !== "string" || !row.query.trim() || !Number.isSafeInteger(row.impressions) || row.impressions < 0 || (row.impressions > 0 && (!Number.isFinite(row.position) || row.position < 1))) throw new Error("Invalid reported search query observation.");
    impressions += row.impressions;
    if (row.position <= 10) topTenImpressions += row.impressions;
  }
  return { score: impressions ? Math.round(1000 * topTenImpressions / impressions) / 10 : null, method: "Percentage of observed query impressions whose reported average position is between 1 and 10 inclusive.", observedQueries: rows.length, observedQueryImpressions: impressions, topTenImpressions, status: impressions ? "measured_exported_queries_only" : "no_reported_query_observations" };
}

export function validateSearchConsoleInput(value) {
  if (value?.source !== "Google Search Console browser report" || value.property !== "sc-domain:saasfolio.tech" || value.pageFilter?.operator !== "contains" || value.pageFilter?.value !== "/articles/") throw new Error("Visibility input must identify the verified SaaSFolio article-only Search Console report.");
  const start = Date.parse(value.period?.start), end = Date.parse(value.period?.end);
  const validDay = day => /^\d{4}-\d{2}-\d{2}$/.test(day || "") && Number.isFinite(Date.parse(day)) && new Date(day).toISOString().slice(0, 10) === day;
  if (!validDay(value.period?.start) || !validDay(value.period?.end) || ![start, end, Date.parse(value.capturedAt)].every(Number.isFinite) || end < start || end > Date.now() || Date.parse(value.capturedAt) > Date.now() + 300000 || !Array.isArray(value.pages)) throw new Error("Visibility report needs a valid historical measurement window and page rows.");
  if (!Number.isSafeInteger(value.totals?.impressions) || !Number.isSafeInteger(value.totals?.clicks) || value.totals.clicks < 0 || value.totals.impressions < value.totals.clicks || (value.totals.impressions > 0 && (!Number.isFinite(value.totals.position) || value.totals.position < 1))) throw new Error("Visibility report needs valid measured totals.");
  queryVisibility(value.queries);
  for (const row of value.pages) {
    const url = new URL(row.url);
    if (url.protocol !== "https:" || !["saasfolio.tech", "www.saasfolio.tech"].includes(url.hostname) || !url.pathname.startsWith("/articles/") || url.username || url.password || !Number.isSafeInteger(row.clicks) || row.clicks < 0 || !Number.isSafeInteger(row.impressions) || row.impressions < row.clicks || !Number.isFinite(row.position) || row.position < 1) throw new Error("Invalid article page performance observation.");
  }
  for (const [key, rows] of Object.entries(value.pageQueries || {})) {
    const url = new URL(key);
    if (url.origin !== "https://saasfolio.tech" || !/^\/articles\/[a-z0-9-]+$/.test(url.pathname) || url.search || url.hash) throw new Error("Page-to-query mappings need exact canonical article URLs.");
    queryVisibility(rows);
  }
  return value;
}

export function articleVisibility(article, data) {
  if (!data) return { searchTermVisibilityScore: null, status: "search_console_not_supplied", metrics: null };
  if (article.publishedAt > data.period.end) return { searchTermVisibilityScore: null, status: "published_after_measurement_window", period: data.period, metrics: null };
  const path = `/articles/${article.slug}`;
  const rows = data.pages.filter(row => new URL(row.url).pathname === path);
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0), clicks = rows.reduce((sum, row) => sum + row.clicks, 0);
  const queries = data.pageQueries?.[`https://saasfolio.tech${path}`];
  const observed = queries ? queryVisibility(queries) : null;
  return { searchTermVisibilityScore: observed?.score ?? null, status: observed && observed.score !== null ? "measured_page_queries" : rows.length ? "page_metrics_available_query_mapping_not_available" : "canonical_url_not_observed_in_captured_page_rows", period: data.period, queryObservations: observed, queryImpressionCoveragePercent: observed && impressions ? Math.round(1000 * observed.observedQueryImpressions / impressions) / 10 : null, metrics: rows.length ? { clicks, impressions, ctrPercent: impressions ? Math.round(10000 * clicks / impressions) / 100 : null, averagePosition: impressions ? Math.round(100 * rows.reduce((sum, row) => sum + row.position * row.impressions, 0) / impressions) / 100 : null, observedUrls: rows.map(row => row.url) } : null };
}

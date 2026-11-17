# Article SEO and measured search visibility

Run the article audit against a finished production build:

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
npm run seo:audit:articles -- http://127.0.0.1:3210
```

The audit requests actual server-rendered article HTML and sharing images. It
also checks cover files in the current checkout. JSON, CSV and Markdown reports
are written to `docs/reports/article-seo-YYYY-MM-DD.*`. The full production-check
runner includes this audit; it manages its own preview server.

## On-page score: 0–100

This is SaaSFolio's transparent diagnostic checklist, version
`saasfolio-article-checklist-v1`, not a Google, Lighthouse or third-party SEO
score. Each of the following checks contributes five points:

1. Successful public HTTP response.
2. Exactly one canonical matching the article's public URL.
3. No blocking robots, Googlebot or HTTP indexing directive.
4. One descriptive branded title, 20–90 characters.
5. Unique title across the article catalog.
6. One useful meta description, 70–160 characters.
7. Unique description across the article catalog.
8. One visible primary heading matching the article.
9. Rendered sections with unique, usable anchors and headings.
10. Substantive source text present before JavaScript executes.
11. Existing cover, accurate descriptive alt and explicit image dimensions.
12. Accessible nonempty sharing image.
13. Matching Open Graph title, description and canonical URL.
14. Complete matching large-image Twitter card.
15. Valid matching Article structured data and source word count.
16. Valid, nonfuture publication and update dates matching the article record.
17. Visible author and a defined structured publisher.
18. Visible HTTPS references matching the Article citations.
19. Crawlable contextual links to at least two related articles.
20. Sitemap inclusion and breadcrumb structured data.

The length bounds and 300-word minimum are practical diagnostic thresholds,
not Google's limits or a claim that longer content ranks better. A 100/100
result means these twenty checks passed. It does not establish originality,
accuracy of every editorial claim, keyword difficulty, loading performance,
backlink quality, index inclusion, search position or future traffic. Fetch
failures remain unscored with their actual error; they do not become invented
zero-quality article scores.

Reports retain the evidence and failed checks for every URL. Broken discovery,
indexing, source, attribution and asset checks fail the production audit.

## Search visibility uses observed Search Console data

Google reports clicks, impressions, CTR and average position. It does not issue
this website's custom SEO or visibility score. See the
[Search Console performance definitions](https://support.google.com/webmasters/answer/7576553).

The optional search-term visibility index is:

```text
100 × impressions from reported query rows with average position 1–10
    ÷ impressions from all reported query rows in the same scoped report
```

It measures the top-ten average-position share of the supplied observations.
It is not total market visibility, a search-volume estimate or proof that each
individual impression appeared in that position. The calculation uses the
reported average positions and retains the number of observed query rows and
impressions. Filtered results may be partial; privacy-filtered or unreported
queries are absent. Reported query impressions may therefore differ from the
chart total. The report shows that coverage separately.

An article collection's query rows cannot be attributed to individual articles
without a page-to-query mapping. Page-level clicks, impressions and average
positions are reported separately; a missing query map leaves the individual
search-term visibility score `null`. Likewise, an article published after the
measurement window is explicitly unmeasured. Missing observations never become
a fabricated zero, ranking claim or keyword-competition score.

## Private input and output

Use the verified domain property `sc-domain:saasfolio.tech`, Web search, an
explicit date range, and the page filter containing `/articles/`. The input
contains `source`, `property`, `capturedAt`, `period`, `pageFilter`, `totals`,
`queries`, `pages` and optionally `pageQueries`. Each measured query needs its
query text, impressions and reported average position. Page rows include their
actual URL, clicks, impressions and average position. Optional `pageQueries`
must map an exact article canonical URL to that page's measured query rows.

```sh
npm run seo:audit:articles -- http://127.0.0.1:3210 \
  --gsc-json .local-data/seo/gsc-articles-YYYY-MM-DD.json
```

With Search Console input, output defaults to gitignored `.local-data/seo/`
with private file permissions. Keep raw query exports and measured business
analytics out of public Git commits. The public technical report uses no private
analytics. The verified November 17 browser captures are retained locally for
the owner; their reporting period predates that day's hosting-guide release.

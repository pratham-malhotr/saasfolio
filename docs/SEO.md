# SaaSFolio SEO implementation and launch checklist

The SEO changes preserve the existing page design, visible copy, styling, animations, and interactive controls. Contact, advertising, and comparison hub components were moved intact behind server pages so those routes can publish server-rendered metadata. Existing links to unavailable catalog alternatives now lead to the comparison hub or tools directory rather than missing pages.

## What is implemented

- A shared production origin for canonical URLs, social metadata, the sitemap, and structured-data entity IDs. The default is `https://saasfolio.tech`.
- Unique search titles and descriptions for the home page, hubs, software profiles, offers, articles, comparisons, discussions, and information pages. Descriptions are cleaned and limited to 160 characters. Title length is allowed to vary with the actual product and offer instead of losing distinguishing offer terms.
- Offer titles based on the actual offer and its type. Free trials, free plans, lifetime licenses, credits, and coupon codes are no longer uniformly advertised as percentage-off coupons.
- Self-referencing canonicals for public pages; filter/tracking query strings resolve to the main hub canonical. Reversed comparisons resolve to one canonical pair, preferring an existing curated comparison.
- Consistent Open Graph and Twitter cards, a working 1200 × 630 site sharing image, and separate generated sharing images for all eight articles. These assets do not appear in the page layout.
- Server-rendered `Organization`, `WebSite`, `WebPage`, `CollectionPage`, `ItemList`, `Article`, and `BreadcrumbList` JSON-LD. Article dates use UTC ISO timestamps. JSON-LD escapes `<` to prevent script injection.
- Software subjects are generic `Thing` entities. `SoftwareApplication`, `Product`, `Offer`, `Review`, and `AggregateRating` rich-result claims are withheld until currency, prices, and review provenance can support their required fields. Relative community timestamps are not represented as publication dates.
- `noindex, follow` in HTML and HTTP headers for admin, authentication, profile, member, submission, and affiliate interstitial pages. Public missing deals, tools, articles, and invalid comparisons use Next.js `notFound()`. Browser-local community discussions remain usable but are excluded from indexing.
- A canonical-only sitemap including valid curated comparisons. Two pre-existing comparison entries referenced absent tools and are excluded. Utility pages are excluded. Only articles have `lastmod`, using their recorded modification dates; build time is not presented as a content update.
- Crawl access to rendered pages and assets. Utility routes remain crawlable so bots can read their `noindex` directives; API routes are excluded in robots.txt.
- Affiliate links carry `rel="sponsored nofollow noopener noreferrer"` without changing their appearance.
- Optional Google and Bing verification metadata, configured through environment variables.

Implementation entry points: `lib/seo.ts`, `lib/structured-data.ts`, `lib/catalog-links.ts`, `components/seo/`, `app/sitemap.ts`, and `app/robots.ts`.

## Deployment and search ownership

These are repository changes. They do not deploy themselves or create a Search Console property.

1. Set the production environment values documented in [SEO.env.example](SEO.env.example), then build and deploy this revision to the hosting account serving saasfolio.tech. The production URL must be the public HTTPS origin, not a staging hostname or an origin with a path.
2. In [Google Search Console](https://search.google.com/search-console), add the **Domain property** `saasfolio.tech`. Add Google's supplied DNS TXT record at the DNS provider and complete verification. Domain verification covers both protocols and subdomains. As an alternative, a URL-prefix property can use the optional HTML verification token; deploy the token before asking Google to verify it.
3. Submit `https://saasfolio.tech/sitemap.xml` in Search Console's Sitemaps report. No manual ping URL is needed.
4. Use URL Inspection on the home page, `/deals`, one real offer, one software review, and one article. Run the live test, check that rendered content and canonical metadata are correct, then request indexing for these representative pages.
5. In the host/DNS settings, keep HTTPS on the canonical hostname and redirect other public host/protocol variants to it. Validate redirects before changing host settings to avoid loops. This repository audit does not certify the hosting account's redirect rules or Googlebot-specific access policies.
6. Test an article and a software page in Google's [Rich Results Test](https://search.google.com/test/rich-results). Check the Article and Breadcrumb items. The site does not claim software review stars, FAQ rich results, or merchant listings.
7. Optionally verify [Bing Webmaster Tools](https://www.bing.com/webmasters/) and submit the same sitemap.

## Search intent and content priorities

| Existing destination | Search intent to serve | Editorial work to support it |
| --- | --- | --- |
| `/` and `/deals` | SaaS discounts, software deals, SaaS coupon codes, software lifetime deals | Keep offers current; clearly distinguish temporary promotions, permanent free plans, and credits. |
| `/deals/[slug]` | A specific tool's coupon code, discount, free trial, or lifetime offer | Verify against the vendor; record source URL, exact eligibility, currency, billing period, checked-at timestamp, and real expiration. |
| `/tools/[slug]` | A tool's review, pricing, features, pros and cons, and alternatives | Publish firsthand findings, real screenshots, measured limitations, pricing sources, and an accountable reviewer. |
| `/compare/[slug]` | Tool A vs tool B | Explain the purchasing decision with tested workflows, pricing assumptions, and evidence. Avoid producing every possible pair just to create pages. |
| `/articles/[slug]` | Software buying guides, stack comparisons, and software cost reduction | Add original research and vendor citations; address a concrete reader problem instead of repeating directory descriptions. |

These are intent mappings, not measured keyword-volume or ranking forecasts. Search Console query data should guide which topics to expand after the site receives impressions. Filter buttons and category UI are preserved; no thin category doorway pages or hidden keyword text were added.

## Material content limitations

The repository still contains demonstration-style content and hardcoded social proof. Examples include repeated sample reviewers, default review comments in `DealDetailClient`, community dates such as “3 hours ago,” a number of product names without catalog entries, and offer expiry values calculated with `Date.now()`. The SEO work does not validate those products, offers, testimonials, audience counts, benchmarks, or author credentials. Do not interpret the existing “verified” labels as evidence that checkout verification occurred.

Before pursuing broad indexing, an editorial owner should verify or replace unsupported claims and vendor offers. Replace rolling deadlines with real vendor deadlines; replace relative publication dates with stored timestamps; retain a dated verification log. Store explicit price currency and genuine review provenance before enabling rich-result pricing or star ratings. Account, moderation, submissions, and community actions that only persist in browser storage do not create publicly crawlable server content.

Those changes affect public content and product behavior, so they are documented for a separate editorial/product pass under the current instruction to preserve the frontend. Technical metadata alone cannot compensate for unreliable content or guarantee placement in Google.

## Verification

Validation completed on October 20, 2026:

- Production build and its TypeScript check passed (1,149 generated pages/assets).
- Production-response SEO audit passed for all **583 canonical sitemap pages**, **429 additional internal link destinations**, **1,159 JSON-LD blocks**, and **9 sharing images**.
- Utility-page HTML/HTTP `noindex`, missing pages, tracking/filter query canonicals, and reversed comparison canonicals passed.
- New SEO modules and the audit script passed ESLint. Modified/moved interactive files introduced no new lint error rules compared with the committed originals. Full-repository lint still reports 30 pre-existing errors and 126 warnings.
- `git diff --check` passed. Page CSS and animation modules were unchanged; the contact and advertising component sources and the comparison hub's visual component were compared with their originals.

```sh
npm run build
npm run start -- --port 3210
```

In another terminal:

```sh
npm run seo:audit -- http://localhost:3210
```

The crawler requests every sitemap page using a Googlebot user agent and checks HTTP status, a unique branded title, descriptions, canonical consistency, Open Graph/Twitter metadata, one server-rendered H1, parseable JSON-LD, publication dates, affiliate link qualification, internal link destinations, and sharing-image responses. It also checks utility-page `noindex` metadata and headers, missing pages, filtered/tracking URLs, and reversed comparison canonicals. It does not simulate a browser, certify Google's rich-result eligibility, or prove a page has been indexed.

Run it against the deployed origin after deployment, using the same canonical-origin environment variable used for the build. This performs read-only requests and can request hundreds of pages; run it deliberately after releases rather than continuously.

The production build includes TypeScript checking. The repository-wide lint command currently reports pre-existing errors in interactive components; the new SEO modules and audit script are checked separately. The original lint findings were compared against the committed source rather than suppressed.

## After launch

Check Search Console's Page Indexing and Sitemaps reports after deployment, then review weekly. Investigate unexpected “blocked by robots,” “duplicate without user-selected canonical,” “soft 404,” and server-error exclusions. Intentional utility `noindex` exclusions are expected.

Track impressions, clicks, CTR, query relevance, and conversions from search. Prioritize vendor-verified pages that already receive relevant impressions. Improve the content and titles of useful pages with low CTR, and earn relevant links through original comparisons or research. Update dates only when the underlying article or offer has actually changed.

## References used

- [Google: canonical URL best practices](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google: building and submitting sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: Article structured data](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: structured data quality policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: review snippet guidelines](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Google: software app structured data requirements](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Google: verifying Search Console ownership](https://support.google.com/webmasters/answer/9008080)

The installed Next.js 16.4.2 metadata, JSON-LD, sitemap, robots, image-generation, static-parameter, and `notFound` guides under `node_modules/next/dist/docs/` were consulted for this implementation.

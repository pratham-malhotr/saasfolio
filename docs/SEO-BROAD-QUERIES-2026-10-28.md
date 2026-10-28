# Broader software savings searches — 28 October 2026

This release strengthens 22 search landing pages around distinct buying decisions. It adds four savings collections, three original referenced articles and buying guidance for all twelve existing software categories. The [query map](reports/search-query-map-2026-10-28.csv) assigns one primary intent to each URL. It is an editorial targeting map, not search-volume data or evidence of rankings.

## Search intent and page ownership

| Main search intent | Owning page | What the visitor can do |
| --- | --- | --- |
| SaaS discounts and software deals | `/` | Choose a brand, category or savings route |
| Software discounts by brand | `/discounts` | Find a provider and compare its billing and eligibility guidance |
| SaaS deals and software offers | `/deals` | Browse current source-backed offers, free plans and trials |
| Software coupon codes and SaaS promo codes | `/coupon-codes` | Inspect recorded codes, sources, expiry and product restrictions |
| Startup software deals and credits | `/startup-deals` | Compare approved-credit, temporary-access and subscription program routes |
| Student software discounts | `/student-discounts` | Distinguish individual, institution and student-organization eligibility |
| Nonprofit software discounts | `/nonprofit-discounts` | Check organization approval, supported workspaces and additional-seat costs |

The existing category URLs are retained. They now answer broader searches for AI tool discounts, marketing software deals, CRM discounts, developer tool credits, design software discounts, analytics deals, web hosting offers, invoicing software deals, productivity discounts, security software deals, ecommerce tools and project management discounts. Their original workload comparisons cover different billing units, account roles, overages and renewal decisions; category names are not simply substituted into one article.

The three new articles address the next question after a collection visit:

- `/articles/find-and-use-saas-coupon-codes`: source, eligibility, direct-price comparison and checkout checks.
- `/articles/startup-software-credits-and-renewal-costs`: useful credit value, covered workload, expiry and later paid costs.
- `/articles/student-software-discounts-after-graduation`: verification, workspace ownership, collaboration and continued access.

These guides use provider references and clearly marked numerical examples. They do not claim hands-on product testing, completed applications or successful coupon redemption. Authorship remains SaaSFolio editorial, with a link to the sourcing standards; no expert identities or customer activity are invented.

## Offer integrity and relevance

Ordinary pricing links no longer fill the general and category deal listings. They remain available through software profiles and the directory. Trial and free-plan records keep their own labels instead of being presented as paid discounts. Sidebar counts use the inventory actually supplied to the explorer, and the structured lists follow the same default price/category filters as the visible results.

Collection selection is explicit. A provider's generic annual plan or free trial cannot become a startup, student or nonprofit benefit merely because the provider has an eligibility program. Current records require a named source type, public HTTPS source and destination, a real check within fourteen days, and an unpassed valid expiry where one is recorded. Future dates, malformed expiry values and plain pricing records are rejected. The coupon collection additionally requires a recorded nonblank code.

The program directory is separate from current offer cards. It links twenty selected official application or information routes and matching brand guidance. A directory entry does not assert a current promotion or approval. This preserves useful eligibility guidance when an automated source cannot be refreshed, without manufacturing evidence or code availability. Existing source observations and collector limitations are retained.

## Discovery, metadata and indexing

- Homepage, footer, discount directory, articles and relevant brand guides link to the new collections through ordinary server-rendered anchors. All four collections are directly reachable from the homepage.
- Each collection has an original title, description, heading, canonical, share image, comparison, checklist and questions. Four new share-image routes are generated with the existing brand artwork. The Next.js route group was removed after the audit exposed hashed metadata paths that did not match the explicit image URLs.
- The sitemap includes the seven new editorial pages and stable content-modification dates for the rewritten categories. It does not stamp every page with the current request time.
- Interactive comparison selectors still work for arbitrary pairs. Only curated comparisons with available providers are indexable. Three older pairs containing unavailable providers are removed from the sitemap; unreviewed combinations are explicitly `noindex, follow` and retain their normal canonical handling.
- The homepage title describes discounts and deals without claiming product reviews. Its accessible heading no longer needs a duplicate hidden text copy.
- The deal explorer has one main landmark supplied by the root layout rather than nesting another main element inside it.

This follows Google's emphasis on [original, useful content and transparent authorship](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [clear category-to-detail navigation](https://developers.google.com/search/docs/specialty/ecommerce/help-google-understand-your-ecommerce-site-structure), and [distinct, descriptive titles](https://developers.google.com/search/docs/appearance/title-link). The comparison-indexing rule is our publishing decision for unreviewed utility pages, not a measured Google penalty.

## Loading performance

New collection and category guidance render on the server. Article lists and related-story cards receive compact previews instead of importing every full article in the browser. The homepage's featured stories render on the server, and category constants no longer pull editorial content into category-filter bundles. Navigation links added for discovery do not eagerly preload every collection.

The local mobile Lighthouse regression check scores **96**, with **1.4 s Largest Contentful Paint**, **200 ms Total Blocking Time** and **0.003 CLS**. The [raw report](reports/mobile-home-seo-2026-10-28.json) describes its test conditions. This is a local lab result and does not establish a live Hostinger score or a search ranking change.

## Validation and evidence

- Production build and TypeScript pass, generating 1,845 static routes/assets.
- [Landing-page audit](reports/seo-landings-2026-10-28.json): 22 pages and 66 related query cases passed content, canonical, discovery, source-record and indexing checks.
- Full SEO audit: 1,103 sitemap pages, 2,200 JSON-LD blocks and 118 sharing images passed, including private/missing-page rules and canonical variants.
- [Site crawl](reports/site-pages-2026-10-28.json): 4,165 page URLs, 31 footer destinations, 10,405 internal link targets, 1,538 provider redirects and 55 local assets passed with zero failures. Provider redirects were inspected without visiting checkout.
- All 52 targeted unit tests pass across offer evidence/history, search, indexing, publishing integrity and collection selection. The original article-integrity test now permits additional referenced guides and explicitly requires the new three, rather than treating eight as a permanent maximum.
- [Browser landing checks](reports/browser-seo-landings-2026-10-28.json) pass all 22 pages at 390px and 1440px, plus seven cold visits with JavaScript disabled. They cover layout, working fragments, native questions and denied-clipboard fallback without making provider requests.
- [Footer interaction checks](reports/browser-site-pages-2026-10-28.json) pass all 31 destinations at 360px and 1440px, including same-route filter changes, calculator, comparison controls, global search and intercepted form error/retry scenarios.
- Root ESLint has no errors. Its twelve warnings are confined to pre-existing, untracked marketing source files outside this website change.

Browser reports record the mobile/desktop and no-JavaScript checks separately. No provider checkout, application, email or account write is needed to perform these audits.

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3238
# In a second terminal:
npm run test:seo:collections
npm run seo:audit:landings -- http://127.0.0.1:3238
npm run seo:audit -- http://127.0.0.1:3238
npm run test:browser:seo -- http://127.0.0.1:3238
```

## Measuring search results after publication

No Search Console or keyword-volume account is connected to this work. After deployment, confirm sitemap discovery and indexability, then use the query map to compare page/query impressions, clicks, CTR and average position over comparable periods. Separate mobile and desktop and keep country filters consistent. Monitor the collection and its supporting article together so that a query moving between them is not mistaken for a loss of the entire topic.

Search engines decide crawling, indexing, displayed titles and rankings. The checks above establish what SaaSFolio publishes and what visitors can use; they are not evidence that the site has reached a particular position for a competitive search.

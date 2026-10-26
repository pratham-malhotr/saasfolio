# SaaS brand discount expansion — 26 October 2026

This batch adds **24 original discount guides**, increasing coverage from **46 to 70 brands**. Twelve providers are new to the catalog; twelve established profiles now have dedicated savings guides. The catalog contains **747 canonical profiles**, of which **739 are available**. Counts describe local repository data, not deployed or indexed pages.

## Brands added

| Group | New catalog profiles and guides | New guides for existing profiles |
| --- | --- | --- |
| Meetings and production | Fathom meeting assistant (`fathom`), tl;dv (`tldv`), Notta, Sembly AI | Fireflies.ai, Otter.ai, Riverside, Descript |
| Productivity | AFFiNE, Huly, mymind, Fabric | Akiflow, Sunsama, Morgen Calendar, Motion Calendar |
| Research and marketing | Ahrefs, Serpstat, SciSpace, Paperguide | Semrush, Ranktracker, Elicit, Consensus |

Every guide has distinct search metadata, a direct best-value answer, at least three buying comparisons, four original guidance sections, four claim steps, account-specific eligibility checks, code troubleshooting, FAQs and official sources. The original guidance sections contain 298–328 words per new guide, in addition to the tables, answers, source notes and instructions.

Fathom's guide covers the meeting assistant, separately from the existing Fathom Analytics profile. Fabric covers the personal knowledge workspace at fabric.so. Provider name variants redirect to the canonical guides; they do not create duplicate keyword pages. Related guides, product profiles, categories, the alphabetical directory and sitemap discover the new pages automatically.

## Search intent coverage

The repeatable audit checks nine useful query families per brand against actual production HTML:

1. `[brand] discount code`: recorded code availability, including a clear negative answer when no code is listed.
2. `[brand] promo code`: distinguish codes from provider billing offers.
3. `best discount for [brand]`: a substantive decision based on the plan, account or workload.
4. `[brand] annual discount`, where the reviewed source establishes an annual offer; otherwise pricing or usage savings.
5. `how to get a [brand] discount`: four actionable redemption steps.
6. `[brand] discount eligibility`: account and program requirements.
7. `[brand] discount code not working`: multiple practical troubleshooting cases.
8. `[brand] discount renewal price`: continuing cost and cancellation; usage-priced products cover ongoing usage costs instead of assuming a subscription.
9. `[brand] free trial vs discount`: separately labeled free-access availability.

For example, Ahrefs coupon searches receive the provider's actual policy rather than an invented public code. The best-discount answer for a meeting tool considers paid seats and its real workflow. Education or nonprofit questions use the approval rules published by that provider, rather than assigning every brand a generic student percentage.

The final audit passes all **70 guides and 630 query cases**, with zero failures and zero source-review cases. Its [machine-readable report](research/brand-search-intents-report.json) records each query, answer section and result, and explicitly sets `rankingMeasurement: false`. These checks verify relevant answers, source links and indexable canonical pages; they are not Google searches, keyword volumes or observed rankings. Search Console is needed to measure which queries and URLs gain impressions after deployment.

The audit also improved existing coverage: Canva now has explicit ongoing-cost and cancellation guidance. Annual-discount queries are selected only when a reviewed annual offer exists, and usage-priced services receive ongoing-usage questions that fit their actual buying model.

## Official sources and retrieval limits

See the dated reviews for [meeting tools](meeting-discount-sources-2026-10-26.md), [productivity tools](productivity-discount-sources-2026-10-26.md), and [research/marketing tools](research-marketing-discount-sources-2026-10-26.md).

The targeted collector successfully read **21 of 24 provider pages**. It retains three real failures: tl;dv's page had insufficient readable content, Riverside's raw pricing identified itself as outdated staging content, and SciSpace returned HTTP 403. Their editorial guides cite separately inspected official material; the collector results are not relabeled as successful checks.

SciSpace's readable official help describes currency-specific yearly coupon rules, but the automated coupon source capture also received HTTP 403. Its two reviewed definitions remain unpublished until source capture succeeds. The guide links to the official policy and distinguishes the absence of a catalog record from the absence of public coupons. Paperguide's promotion ending on the review date was excluded from ongoing offer claims.

Source verification also identified stale or ambiguous pricing text. The collector now rejects the explicit staging warning and requires clearer evidence before publishing a free-forever offer. Sunsama's explanation of why it does not have a free plan no longer becomes a false free-plan listing. Regression checks cover both failures.

Provider observations keep their actual individual review dates and the existing 30-day editorial freshness rule. Automated offer evidence retains its 14-day limit. Adding another brand does not refresh old reviews, and no signup, application, purchase or checkout was performed.

## Verification and reproduction

The production build, TypeScript, catalog validation and 22 offer/savings tests pass. ESLint has zero errors and the six existing authentication/navigation warnings.

The rendered SEO audits pass all **70 guides, 1,008 sitemap URLs, 2,010 JSON-LD blocks, 79 sharing images and 900 additional internal destinations**. Canonicals, index directives, source links, alias redirects, section links and distinct product/discount intent are included. The browser smoke passes all **24 added guides at 390px and 1440px**, plus native category/comparison navigation and cold JavaScript-disabled discovery. No uncaught browser exceptions were found.

```sh
npm run validate:catalog
npm run test:offers
npm run test:savings
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
# Run the audits in another terminal while the preview server is running:
npm run seo:audit:brands -- http://127.0.0.1:3210
npm run seo:audit:queries -- http://127.0.0.1:3210 --report=docs/research/brand-search-intents-report.json
npm run seo:audit -- http://127.0.0.1:3210
npm run test:browser:discounts -- http://127.0.0.1:3210 --only=fathom,tldv,notta,sembly-ai,fireflies-ai,otter-ai,riverside-fm,descript,affine,huly,mymind,fabric,akiflow,sunsama,morgen-calendar,motion-calendar,ahrefs,serpstat,semrush,ranktracker,scispace,paperguide,elicit,consensus
```

Changes are prepared locally. No deployment, live indexing request or Search Console submission is implied. After deployment, compare the actual brand-query landing pages using the [measurement procedure](discount-search-audit-2026-10-26.md).

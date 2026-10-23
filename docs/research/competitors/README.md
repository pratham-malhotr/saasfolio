# Competitor investigation and implemented improvements

Reviewed 23 October 2026. This follows the [offer-integrity audit](../../offer-integrity-audit.md); it preserves the existing source-age and eligibility protections.

## What was inspected

Used the [REA repository](https://github.com/morluto/rea) and its [reverse-engineer-anything workflow](https://github.com/morluto/rea/blob/df8b4d8a5a8c218ac9f49dd75e014bd910209d36/.agents/skills/reverse-engineer-anything/SKILL.md). The existing source checkout is commit `df8b4d8a5a8c218ac9f49dd75e014bd910209d36`; the executable used is the separately published **rea-agents 6.7.0**, already cached locally. No agent configuration was changed.

Five declared scenarios ran ordinary public navigation in isolated Chrome profiles. REA reported cleanup of every owned browser. [rea-observations.json](rea-observations.json) preserves the evidence IDs, input and DOM digests, document response statuses, page inventories, observation times and limitations. Raw evidence remains at `/tmp/saasfolio-rea-competitor-<name>.json`; network bodies and header values were not requested.

| Target | Runtime result | Further public-page research |
| --- | --- | --- |
| [SimplyCodes beehiiv](https://simplycodes.com/store/beehiiv.com) | HTTP 403 and challenge HTML. Application behavior was not recovered. | Readable public store text and [verification methodology](https://simplycodes.com/how-it-works): per-code restrictions, shopper activity, report dates, feedback and methodology navigation. These are publisher reports, not reproduced checkout tests. |
| [Secret beehiiv](https://www.joinsecret.com/beehiiv) | Challenge page; application behavior remains unknown. | Public listing and [Predis.ai page](https://www.joinsecret.com/predis-ai) show membership gating and account eligibility. Membership costs must be considered alongside subscription savings. |
| [AppSumo](https://appsumo.com/) | Public page loaded; captured inventory includes search, browsing links and branded icon declarations. | The homepage makes discovery and product links prominent. No purchase, review verification or proprietary ranking algorithm was reproduced. |
| [DealFuel](https://www.dealfuel.com/) | Public page loaded with search and extensive category links. | Clear deal categories and buyer-facing conditions are useful navigation patterns. Their commercial policies do not become SaaSFolio policies. |
| [Live SaaSFolio](https://saasfolio.tech/) | Public page loaded with the older homepage heading and a single favicon declaration. | The current live metadata and the Google snippet described by the user differ. Google may select older indexed body text; changing only the description cannot force the exact snippet. |

The public [Dealspotr beehiiv URL](https://dealspotr.com/promo-codes/beehiiv.com) redirects to SimplyCodes. It is not treated as another independent code source. No CAPTCHA was solved, paywall crossed, account created or checkout attempted. Public page observations are separated from runtime evidence; a blocked page does not establish its private implementation.

## Gaps addressed in the product

| Observed pattern or gap | SaaSFolio implementation |
| --- | --- |
| Prominent search and broad store discovery | New `/brands` directory with all **703 listed brands**, A–Z controls, search and filters for actual recorded codes, free options and original guides. Initial HTML contains links for every listed brand. The directory does not create 703 thin coupon pages. |
| Conditions and verification context alongside redemption | Every available tool profile and every original brand guide now has a source panel. It separates official terms, coupon publishers and partner marketplaces, with recorded review dates where available. |
| More places to research brand-specific offers | Expanded the shared registry from **6 to 12 research links**, covering **10 brands** across SimplyCodes, TechRadar and Secret. These are research links; they do not automatically become active coupons. |
| Partner discounts can require paid membership | Reviewed Secret listings for beehiiv and Predis.ai carry a prominent paid-access label and eligibility context. No private partner code or unsupported saving is invented. |
| Headline savings omit access costs | New `/savings-calculator`, also embedded in all 16 brand guides, compares the same plan over 12 months. It includes the annual offer's access fee and displays when annual billing costs more. Users enter current quotes; no provider prices are prefilled or currency conversion implied. |
| Feedback must retain the affected offer | A report link on deal pages and coupon dialogs opens the existing contact form with the listing and recorded code included. Brand source panels provide a brand-specific correction link. The form uses the existing server-backed inquiry flow and does not submit automatically. |
| Recognizable brand assets across surfaces | An original folded-folio S mark replaces the framework favicon and the bracket motif. SVG, multi-resolution ICO, PNG, Apple touch icon, manifest, site logo and sharing images use the same mark. See [brand identity notes](../../brand-identity.md). |
| Search copy should describe inspectable behavior | The existing live title wording is preserved. Homepage description, visible introduction, organization metadata and social descriptions now emphasize source links, terms and check dates. Footer boilerplate is excluded from snippets with `data-nosnippet`; links remain crawlable. |
| A clear explanation of source checks | Expanded `/about#standards` distinguishes provider statements, publisher reports and checkout acceptance. Source panels and navigation link to these standards. |

SaaSFolio already had category browsing, command search, comparison pages, account bookmarks, a newsletter and original savings guides. Those capabilities were retained. SimplyCodes' checkout automation, extension telemetry, proprietary scoring and community evidence network were not reproduced; SaaSFolio still labels its current codes as not checkout tested.

## Search identity

Homepage title:

> SaaS Discounts, Software Deals & Reviews | SaaSFolio

Homepage description:

> Find SaaS discounts and software deals with clear terms, source links and check dates. Compare coupon codes, annual savings and trials before you subscribe.

The same description is used for the organization, Open Graph, Twitter and manifest. Page-specific descriptions and canonicals remain intact. The new brand directory and calculator are in the sitemap and internal navigation.

Google chooses the displayed snippet and can use visible page text. The visible introduction has therefore been revised too. [Google's snippet documentation](https://developers.google.com/search/docs/appearance/snippet) describes that behavior and `data-nosnippet`. [Site-name guidance](https://developers.google.com/search/docs/appearance/site-names) supports consistent `WebSite` identity. The logo and its stable, crawlable icon declarations follow the [favicon guidance](https://developers.google.com/search/docs/appearance/favicon-in-search); display and timing are not guaranteed.

## Repeat the checks

```sh
npm run brand:assets
npm run test:savings
npm run test:offers
npm run test:platform
npm run validate:catalog
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
npm run brand:audit -- http://127.0.0.1:3210
npm run test:browser:offers -- http://127.0.0.1:3210
npm run seo:audit:brands -- http://127.0.0.1:3210
npm run seo:audit -- http://127.0.0.1:3210
```

To repeat a REA scenario with a separately installed `rea` CLI:

```sh
rea capture-browser-scenario docs/research/competitors/scenarios/appsumo.json --json > /tmp/saasfolio-rea-competitor-appsumo.json
```

Repeat for the other named scenarios. If using npm, pin the reviewed release. The Chrome path in each scenario must identify an installed browser. After all five captures, `node scripts/summarize-competitors.mjs /tmp` regenerates the digest-validated summary. Observation times are local capture-file times, not upstream offer verification dates.

The browser test checks actual mobile search and coupon filtering, denied clipboard behavior, native provider links, the membership-fee calculation, source access labels and correction prefill. It does not submit a report or purchase. JavaScript-disabled link checks occur after page rendering, as explained in the earlier integrity audit.

Validation results for this change:

- Production build and TypeScript compilation pass.
- All **30 automated cases** pass: 18 offer/source-parser tests, four billing calculations and eight platform tests.
- Identity audit passes for browser and crawler metadata, icon dimensions, ICO contents, Apple icon, manifest, organization logo, **703** brand entries and correction prefill.
- All **16 brand SEO audits** pass.
- Full HTML audit passes for **925 sitemap pages, 1,844 JSON-LD blocks and 25 sharing images**, plus additional internal links and existing indexing protections.
- Chrome passes mobile search and coupon filtering, source fee disclosures, calculator outputs, correction prefill, clipboard denial and native redirects. No report was submitted.
- ESLint passes for the changed feature, metadata and tooling files; `git diff --check` passes. This is not a claim that unrelated repository-wide lint findings were fixed.

## Deployment and measurement

These changes are local until deployed. After publishing, verify the live favicon, Apple icon, description and organization logo. Inspect `/`, `/brands`, `/savings-calculator` and the priority brand guides in the correct `saasfolio.tech` Search Console property, then request indexing and recheck the sitemap.

Google may take days or weeks to process icon changes, and neither the exact snippet nor a ranking is guaranteed. Compare brand-query and discount-query clicks and impressions over equal 28-day periods after deployment. Do not advance source review dates or publish recovered publisher reports as verified codes merely to increase counts.

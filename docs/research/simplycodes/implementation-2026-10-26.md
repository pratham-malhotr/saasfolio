# SimplyCodes-inspired improvements — 26 October 2026

Implemented merchant-first discount search, offer-level evidence at redemption, and honest submission preflight. These are SaaSFolio implementations informed by public product patterns, not copies of private SimplyCodes systems.

## Evidence and limits

- [Public feature observations](public-feature-review-2026-10-26.md) distinguish extracted content from untested controls and company methodology claims.
- [Fresh REA capture summary](feature-capture-2026-10-26.json): homepage and Hostinger navigations returned Cloudflare 403 block documents. No challenge bypass, account, submission, extension or checkout activity occurred. Application click handlers and private verification machinery were not observed.
- [Local REA replay](local-feature-validation-2026-10-26.json): all seven steps completed, from opening search and entering “best discount for Predis” to the rendered `/discounts/predis-ai` answer. The declared [scenario](scenarios/saasfolio-search-2026-10-26.json) is reproducible against port 3210. Raw browser captures remain outside the repository; the summaries retain evidence IDs, digests, completeness and cleanup details.

## Result

- Brand guides are searchable by canonical name, real aliases and discount-intent queries. Enter opens the first matching guide; a Brands filter and meaningful empty state are available. Expired summaries fall back to neutral terms guidance.
- Coupon guides and reveal dialogs expose an attributed source, recorded check and published expiry where available. They explicitly distinguish a recorded source check from checkout testing. Codes have a manual-copy fallback and an offer-specific correction link.
- Code submissions receive local input checks and remain pending review. Neither valid syntax nor successful submission creates a verification badge, checkout result, confidence score or promised reward.
- The compact client search index and reviewed profile projection avoid shipping complete editorial guide prose through the existing tool catalog import chain. The generated projection preserves all 24 reviewed profiles and is deterministic.

## Validation

- Production build, TypeScript and lint completed; lint retained six existing warnings.
- Search: 5 tests; rendered offer evidence: 4 tests; platform/preflight: 18 tests; offer sources/parsers: 18 tests, all passed.
- Production content checks: 70/70 brand guides and 630/630 intent cases passed. These establish content coverage, not search engine rankings.
- Focused Chrome checks passed at actual 390px and 1440px viewports: navbar search, Predis Enter navigation, Kit alias, Brands empty state, coupon copy denial/manual fallback, actual source dates, redemption dialog links, and submission wording. Six screenshots were inspected. No uncaught browser exceptions or non-GET application writes occurred.
- All 24 guide prose markers were absent from 80 built client JavaScript chunks. Catalog generation was repeated with identical output; 747 profiles, 177 offers and 781 sources validated.

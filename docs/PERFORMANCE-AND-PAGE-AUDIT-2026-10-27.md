# Mobile performance and full-site review — 27 October 2026

The final production build has been measured locally with Lighthouse 13.5.0 and Chrome, using fresh browser profiles, the default mobile throttling and the desktop preset. The before measurement includes the expanded catalog before optimization. These are local laboratory results; Hostinger’s live score must be checked after deployment, and individual runs can vary.

| Metric | Mobile before | Mobile after | Desktop before | Desktop after |
| --- | --- | --- | --- | --- |
| Performance score | 38 | 93 | 97 | 100 |
| First Contentful Paint | 2.8 s | 1.4 s | 0.3 s | 0.4 s |
| Largest Contentful Paint | 8.6 s | 2.9 s | 1.3 s | 0.7 s |
| Total Blocking Time | 2,710 ms | 150 ms | 50 ms | 0 ms |
| Speed Index | 5.1 s | 1.4 s | 0.6 s | 0.7 s |
| Cumulative Layout Shift | 0 | 0.003 | 0 | 0.001 |

Mobile script transfer fell from 916 KiB to 442 KiB. Total measured transfer fell from 1448 KiB to 660 KiB. The catalog remains available through search and the server-rendered directories.

## Changes

- A single global search dialog loads on demand. Hero, mobile navigation and Ctrl/Cmd+K use the same dialog. A loading state supports cancellation, focus management and Escape.
- The hero announcement keeps a fixed line height and a single line, and its container has a stable width. Cold loads and hard refreshes pass the existing one-pixel headline stability check under 4× CPU throttling. The smoke test now distinguishes the existing authenticated submission gate from public service forms.
- Touch devices use native scrolling and a static hero background. Desktop particles stop when offscreen or hidden and run at a capped frame rate. The desktop scroll library loads only for a fine pointer with motion enabled.
- Reveals use browser animations on desktop and keep content immediately visible on touch devices and without JavaScript. Long homepage sections defer offscreen rendering while their HTML remains present. Coupon dialogs stay outside containment.
- Marquees use two matching tracks instead of eight copies, with corrected loop distances. Static ticker and footer components render on the server.
- Expensive category and navigation preloads are disabled where they compete with reading the current page. The secondary monospace font is not preloaded. Analytics initialization still queues immediately; its library loads during browser idle time.
- Comparison selectors receive compact public options instead of the full catalog and offer snapshot. Both selector locations have connected labels and inline validation. Comparison changes remount the controls with the requested pair.
- Footer deal filters remount when their URL parameters change, fixing stale Lifetime/Free Trial selections on client navigation. Filter buttons expose their pressed state. Contact FAQs support keyboard activation, and privacy/legal emails are working links.

## Verification

The production build and TypeScript check pass. All 100 existing unit tests passed across offers, source history, search, evidence, indexing, authentication, platform forms, savings and publisher security. Root ESLint reports no errors; its 12 warnings are in existing untracked marketing sources.

The final SEO audit passed all 1,099 sitemap pages, 2,192 JSON-LD blocks and 111 sharing images. The release also retains the 102-guide SEO audit, 288 buying-intent cases and all 32 new-guide browser checks from the [brand report](BRAND-EXPANSION-2026-10-27.md).

The full-site report passed 4,160 page URLs, 27 footer destinations, 10,950 internal link targets, 1,538 provider redirect responses and 52 local assets. This covers built HTML routes, sitemap entries, footer queries, linked dynamic pages and fragments. Provider redirects are inspected without visiting checkout. The browser report exercises every footer destination at 360px and 1440px plus query-filter transitions, FAQ keyboard controls, calculation results, both comparison selectors, lazy search and form validation/error/retry states. Form writes use intercepted fixtures and do not establish live delivery.

## GitHub refresh reconciliation

The branch was fast-forwarded to automated refresh `d7873b6` before preparing the requested commits. The combined snapshot retains its 773 unchanged-by-this-task source records and this task’s 64 new or updated records. It preserves the bot’s Napkin AI free-plan offer: the final catalog has 188 source-backed offers, 837 source records, 763 available brands and 102 indexable guides. No source timestamp was invented. Retired URL history was rebuilt after reconciliation.

## Reports and repeatable commands

- [Mobile before](reports/mobile-home-before.json) and [after](reports/mobile-home-after.json)
- [Desktop before](reports/desktop-home-before.json) and [after](reports/desktop-home-after.json)
- [Every-page HTTP/link/asset report](reports/site-pages-2026-10-27.json)
- [Footer and interaction browser report](reports/browser-site-pages-2026-10-27.json)

```sh
npm run build
npm run start -- --hostname 127.0.0.1 --port 3227
# In a second terminal:
npm run audit:pages -- http://127.0.0.1:3227
npm run test:browser:pages -- http://127.0.0.1:3227
npm run seo:audit -- http://127.0.0.1:3227
```

The publisher/security audit passed legal-page, ownership, private-cache, redirect and referenced-content checks. Authentication browser scenarios passed at 390px and 1440px with intercepted provider and API responses.

The audits use GET/HEAD requests and fresh Chrome profiles. Form/browser fixtures do not send emails or create production accounts. The local production preview reports accounts, forms and newsletter as unconfigured and correctly presents disabled controls and email fallbacks. This does not inspect the host’s environment. Real authentication, inquiry storage and newsletter delivery require the host’s configured services and account-side connectivity checks.

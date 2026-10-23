# Offer integrity and destination audit

Audit date: 23 October 2026. Changes are local; deployment and checkout acceptance were not tested.

## Findings and corrections

The initial network audit checked **1,060 unique URLs**, including provider websites, pricing pages, custom referrals and published offer destinations. Results: 913 reachable, 140 unverified, four HTTP 404s, one HTTPS downgrade and two other non-success responses. Most unverified responses were bot restrictions or timeouts; eight recorded domains did not resolve. A HEAD response alone does not establish that a company, promotion or checkout works.

| Problem | Correction |
| --- | --- |
| Some `/go/` Route Handlers used Next client navigation | Provider actions now use native anchors and HTTP redirects. Coupon, trial, free-plan and pricing actions have distinct labels. |
| Copying or revealing a code also attempted a popup; offers without codes opened a coupon modal | Copying and navigation are separate actions. Only real codes open the dialog; other options link directly to the provider. |
| Failed or unavailable clipboard access could interrupt the experience | Codes stay selectable. A denied clipboard operation displays manual-copy instructions. |
| No-code cards displayed zero-percent discounts or success statistics | Shared offer labels describe the actual option; unsupported success indicators were removed. |
| Namecheap email savings appeared as a flat 40% reduction | The label says **up to 40%**. The terms retain plan and term restrictions. |
| Reviewed pricing URLs were overwritten by an older catalog mapping | Reviewed and corrected provider destinations now take precedence. Generic referral URLs remain separate from offer-specific campaigns. |
| Old coupon identifiers could silently resolve to a different current offer | Historical links use the provider's current pricing page. Exact current offer identifiers retain their campaign URLs and query parameters. |
| A global cache header overrode redirect `no-store` | `/go/` now has an explicit final no-store header rule. |
| Auto discovery accepted bare “free plan” comparison labels and HTML comments | A shared evidence rule rejects ambiguous labels and comment evidence. The HTML parser excludes comments, templates, scripts and explicitly hidden elements. |
| Weak legacy evidence could remain public until the next refresh | Runtime filtering suppresses 62 insufficiently supported automatic records. The snapshot remains as an audit record; 147 source-backed records pass the current publication filter. Suppression does not mean 62 coupon codes were proven fake. |
| Source pages returning 404/410 could retain offers | Refresh removes these offers immediately. Failed fetches still never advance source-check dates; other old observations age out after 14 days. |

## Provider corrections

| Brand | Reviewed destination |
| --- | --- |
| Vanta | [Official pricing](https://www.vanta.com/pricing), replacing `/products/pricing` (404) |
| Clockify | [Official pricing](https://clockify.me/pricing), replacing `/upgrade` (404) |
| Ortto | [Official plan and billing help](https://help.ortto.com/checking-and-managing-your-plan), replacing `/pricing/` (404) |
| Photomator | [Official Pixelmator product page](https://www.pixelmator.com/photomator/), replacing the nonresolving standalone domain |
| Mailspring | [HTTPS www destination](https://www.getmailspring.com), avoiding the recorded host's HTTP downgrade |

Clean official website and pricing URLs are also recorded separately for beehiiv, Predis.ai, Taplio, Baremetrics, Smartlead, Snov.io, Systeme.io, AnyTrack and StreamYard. The follow-up audit checked **36 URLs across these 14 providers; all returned successful HTTP responses**.

Outbound offers are disabled for **Tome, Edgebase Cloud, PulseMail Pro, VectorCraft, VaultGuard Security, SprintForge, ArmorID and Play.ht** because the recorded destination returned 404 or did not resolve and a working replacement could not be confirmed. This is a statement about the recorded links, rather than proof of a business's legal or operating status. Existing profiles explain the issue and are noindex; they are excluded from the directory and sitemap. Historical outbound links return an explanatory HTTP 410 page with alternatives.

`lib/data/provider-links.json` is the shared correction list used by the catalog and future source refreshes. Remove an unavailable status only after confirming the official replacement. A successful fetch or affiliate redirect alone is insufficient evidence of a lower price.

## Repeatable checks

```sh
npm run test:offers
npm run validate:catalog
npm run build
npm run start -- --hostname 127.0.0.1 --port 3210
npm run audit:offer-flows -- http://127.0.0.1:3210
npm run test:browser:offers -- http://127.0.0.1:3210
npm run seo:audit:brands -- http://127.0.0.1:3210
npm run seo:audit -- http://127.0.0.1:3210
npm run audit:links -- --report=/tmp/saasfolio-outbound-audit.json
```

The Chrome test uses the installed macOS browser, or `CHROME_PATH` on another host. It blocks external HTTPS traffic and verifies the local interface and native navigation, without purchasing or attempting to bypass provider restrictions.

The browser test disables JavaScript **after rendering** to verify that displayed coupon and free-plan links still navigate. Initial App Router page rendering uses React streaming and still requires JavaScript to reveal streamed segments; this test does not claim full cold-load compatibility with JavaScript disabled. Metadata streaming is disabled so complete metadata remains in the document head.

The offer tests cover hidden evidence, ambiguous comparison text, source failures, expiry, campaign preservation, legacy fallbacks and unavailable/unknown providers. The production route audit checks **3,335 routes: 3,306 redirects, 24 unavailable destinations and five unknown IDs**. It checks exact Location headers, noindex and no-store, without following campaigns to checkout.

Production SEO validation passes for **923 sitemap pages, 1,840 JSON-LD blocks and 25 sharing images**, including additional internal destinations and unavailable-profile handling. All **16 individual brand SEO audits** pass. The production build, catalog validation and **18 offer tests** pass; ESLint reports no errors or warnings for the changed offer-flow files.

The Chrome smoke passes for the mobile dialog, visible reported code, denied clipboard fallback, copy without navigation, native new tabs and displayed provider links with JavaScript disabled after rendering.

Initial network reports are available in this session at `/tmp/saasfolio-all-links.json` and `/tmp/saasfolio-corrected-links.json`. Bot-protected, timed-out and other unverified destinations still need provider-side or manual review. The displayed coupon testing status remains **not checkout tested**; no code is claimed to have been accepted in a paid transaction.

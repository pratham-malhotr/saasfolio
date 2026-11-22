# SaaSFolio live AdSense audit — 6 November 2026

The previous content remediation is now visible on **https://saasfolio.tech**. This corrects the deployment gap recorded in the 5 November report. The published content and link checks passed, and the tested browser interactions worked on follow-up. **The site does not receive an unconditional “everything works” verdict:** contact forms, accounts and newsletter services are unconfigured, and actual Google review-crawler access and mailbox delivery remain unverified.

My recommendation is to resolve or remove promoted unavailable features, confirm a working contact method, and check real Google crawler access before requesting another AdSense review. These are readiness recommendations; accounts and newsletters are not required features for an AdSense publication. Google's assessment of original value cannot be certified by structural tests.

This was a public, read-only production audit. No website source, hosting configuration, account or AdSense setting was changed. No inquiries, newsletter subscriptions, accounts, emails, analytics events or vendor checkouts were submitted. Chrome automatically completed Hostinger's browser-verification POST; it was allowed separately from blocked application writes.

| Previous change | Evidence on the live site |
| --- | --- |
| Publish an editorial method | `/editorial-policy` returns 200 with the authorship, sources, comparison, affiliate and correction policy. It is linked from the publication. |
| Curate the catalog | The sitemap has 399 URLs and matches the workspace publication boundary: 136 published profiles; 650 other source records excluded. There are 89 published offers. |
| Remove misleading legacy claims | CogniFlow, Claude AI and MetricPulse reference probes return 200 with noindex and the catalog-reference marker. The checked unsupported claims are absent from their rendered main content. This is three live reference probes, not an HTTP inspection of all 650 retained legacy URLs. |
| Add practical article content | All 11 live articles contain the worked-example, reusable decision-record, common-mistake and reference sections. The publisher audit also verifies their cited source links and canonical article redirects. |
| Expand comparisons | All six published comparisons contain the original decision-analysis marker. The Obsidian/Notion and PocketBase/Supabase pages were also inspected in Chrome. |
| Paginate software listings | `/tools?page=2` returns different server-rendered cards and the correct page-2 canonical. Unknown products and out-of-range pagination return noindex 404s. |
| Reduce oversized responses | `/tools` is 408,319 uncompressed bytes, compared with 4,276,965 in the previous live snapshot. `/deals` is 699,357 bytes, compared with 4,294,889. The largest current sitemap HTML response is 699,357 bytes. |
| Preserve publisher verification | `/ads.txt` serves the expected seller record, and ownership metadata matches `ca-pub-4529948026803680`. No ad-serving scripts were found in the publisher audit or browser samples. Verification does not establish approval. |

The complete sitemap audit covered **399 of 399 pages**, with zero indexing/content errors. It checked responses, robots access, canonicals, primary headings, editorial sections, reviewed profile metadata and structured facts. All 42 referenced JavaScript assets passed; the largest was 243,176 bytes. [Full live content evidence](live-publisher-content-2026-11-06.json).

The broader page/link audit covered **658 page URLs**, **31 footer destinations**, **2,985 internal link targets**, **284 provider redirect routes**, and **58 local assets**, with **zero failures**. It includes linked query pages and fragments beyond the sitemap. Redirect destinations were inspected without following them to provider checkout; this does not certify provider availability or coupon acceptance. [Full page/link evidence](live-site-pages-2026-11-06.json).

The existing publisher/security audit passed its live checks for public/utility responses, private cache headers, security headers, privacy disclosures, 11 referenced articles and redirects, and nine noindex discussion previews. It reported `accounts=false`, `forms=false`, and `newsletter=false`. Source validation separately passed for 126 brand guides, six original comparisons, 10 documentation-based profiles and 11 articles, with no duplicated substantive editorial paragraphs detected. This detector does not establish semantic originality or factual accuracy.

Chrome inspected the actual production site at 390px and 1440px, with normal motion settings, plus five pages with JavaScript disabled. There were **33 successful initial page/viewport/script combinations**; four additional desktop combinations failed the initial navigation readiness deadline. No uncaught JavaScript exceptions, broken local assets, tested layout overflows or missing article fragments were observed on successful visits. The mobile homepage, article and comparison screenshots were visually inspected. The browser's first homepage request encountered Hostinger HTTP 403 verification, then loaded the real page after automatic validation.

The initial mobile-calculator navigation also exceeded its deadline. Every failed navigation was rechecked: desktop comparison, editorial policy, privacy and contact pages passed on follow-up, and the mobile calculator produced the expected $30 / 12.5% saving. The initial report retains the failures; it is not presented as an entirely clean browser run. The cause of those intermittent readiness timeouts was not established.

Directory search passed on mobile and desktop. Mobile menu navigation, footer navigation and active state, contact FAQ, deal-type filtering, same-tool comparison validation and custom comparison navigation passed. One automated hero-search click before the navbar's event listener was known to be ready did not open the dialog. Waiting for that listener and repeating the search passed, including navigation to the beehiiv guide. This leaves a possible early-click timing weakness; a persistent search failure was not established. [Initial browser evidence](live-browser-audit-2026-11-06.json), [interaction evidence](live-browser-interactions-2026-11-06.json), [targeted retry evidence](live-browser-retries-2026-11-06.json).

The operational findings to address are:

1. **Online contact and accounts are unavailable.** On the live contact and login pages, Chrome observed the unavailability notice and disabled form fieldsets. Google/Apple sign-in is unavailable too. The public health response reports contact forms, accounts and newsletter configuration as false. `/api/ready` returned HTTP 503 with `status: not_ready`; this describes dependency readiness, while the public content pages remain accessible. Enable the intended services or simplify their promoted entry points. An intentional browsing-only publication can still be useful.
2. **The email fallback has routing, but delivery is not proven.** Public MX lookup returned Hostinger's `mx1.hostinger.com` and `mx2.hostinger.com`. This establishes domain-level routing, not the existence or delivery of `support@`, `partners@`, `editorial@` or `security@`. Confirm at least the public support mailbox receives and can reply to a real message. No mail was sent by this audit.
3. **Real Google access needs an account-side test.** Ordinary requests and synthetic `Mediapartners-Google` and `Google-Display-Ads-Bot` user agents returned 200. A synthetic Googlebot request returned Hostinger 403. These requests originated outside verified Google crawler IP ranges; neither success nor failure proves actual Google access. Hostinger documents verification by IP/DNS and rejection of fake crawler identities. Use Search Console URL Inspection → Test live URL on `/`, `/editorial-policy`, and an article, then check Crawl stats. Separately inspect AdSense's own site/review status and crawler-access errors because its crawlers differ from Search Console's. If genuine crawler tests fail, investigate the exact Hostinger rule and request logs rather than allowing every client that claims to be Google.

`robots.txt` returned 200, allows public pages and advertises the canonical sitemap. HTTP redirects to HTTPS with 301; WWW redirects to the apex domain with 308. These checks did not reveal a canonical-origin problem.

After the contact route and intended feature experience are settled and account-side crawler checks succeed, a new AdSense review is reasonable. There is no demonstrated need to repeat the already deployed content patch. Google still decides whether the site's original content provides enough value; this audit cannot inspect the private rejection details, prove indexing/recrawl completion, establish mailbox or vendor checkout delivery, or guarantee acceptance.

Google's [site-readiness guidance](https://support.google.com/adsense/answer/7299563?hl=en) prioritizes original useful content and usable navigation. Its [publisher-content policy](https://support.google.com/publisherpolicies/answer/11112688?hl=en) excludes low-value and under-construction ad screens. [AdSense crawler documentation](https://support.google.com/adsense/answer/99376?hl=en) distinguishes its ad/review crawlers from search crawling. [Hostinger's crawler guidance](https://www.hostinger.com/support/hostinger-cdn-search-engine-crawlers-and-seo/) explains crawler verification and account-side live tests. These sources do not supply a guaranteed article count, word count or approval outcome.

Reproducible repository checks used:

```sh
node scripts/audit-publisher-content.mjs https://saasfolio.tech --report=docs/reports/live-publisher-content-2026-11-06.json
node scripts/audit-publisher-readiness.mjs https://saasfolio.tech
node scripts/audit-site-pages.mjs https://saasfolio.tech --report=docs/reports/live-site-pages-2026-11-06.json
npm run validate:publisher
```

Chrome evidence came from temporary live-audit scripts that allow the production origin, block external requests and application submissions, and permit only Hostinger's automatic validation POST. These browser checks did not mock the live health/configuration responses or assert real email/account delivery.

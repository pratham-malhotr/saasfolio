# SimplyCodes investigation with REA

## Scope and evidence

Investigated on October 21, 2026, focusing on public store pages, coupon discovery,
verification signals, reveal behavior, and efficient refreshes. The frontend
design is unchanged.

- REA source checkout: `df8b4d8a5a8c218ac9f49dd75e014bd910209d36` from
  [morluto/rea](https://github.com/morluto/rea).
- Executed the published **REA CLI 6.7.0**, installed in a temporary npm cache.
  This is separate from the checked-out source revision; no claim is made that
  the npm build exactly matches that commit.
- Used the repository's
  [reverse-engineer-anything skill](https://github.com/morluto/rea/blob/df8b4d8a5a8c218ac9f49dd75e014bd910209d36/.agents/skills/reverse-engineer-anything/SKILL.md),
  [browser scenario contract](https://github.com/morluto/rea/blob/df8b4d8a5a8c218ac9f49dd75e014bd910209d36/docs/browser-scenario-contract.md),
  and script-export/runtime inspection guides.
- Ran `capture-browser-scenario` against the public QuillBot store using an
  empty temporary Chrome profile. REA reported Chromium 144.0.7559.97 and cleanup
  of the owned browser process.
- The main document returned **HTTP 403**, with a Cloudflare block document.
  The retained DOM is 5,746 bytes; its SHA-256 is
  `f7bfe813afc592e3c19099fd274c25e47cc1df149f73c09ace4a57d6f12e5a70`.
- REA Evidence ID:
  `ev_06510f12d14b277e6ff9ac46d28895762605fb49fed2110b86d8502224d00ee4`.
  The capture reports incomplete event coverage. This is not a complete network
  trace. [rea-report.json](rea-report.json) retains the safe derived result and
  input digest. Raw challenge bodies, address information, and network content
  stay in the temporary investigation directory.
- The report's observation time is the locally recorded capture file timestamp;
  import time is stored separately. No upstream verification date is inferred.
- Public page text was also inspected through web browsing for
  [QuillBot](https://simplycodes.com/store/quillbot.com),
  [Hostinger](https://simplycodes.com/store/hostinger.com), and
  [the stated methodology](https://simplycodes.com/how-it-works). Public-text
  observations are separate from REA runtime Evidence.

## Findings and implementation

| Finding | Evidence or limitation | Change in SaaSFolio |
| --- | --- | --- |
| Store pages group offers with restrictions, activity labels, reported health, and verification counts. | Observed in public page text. Health and community verification are upstream reports. | Added a dedicated per-card parser retaining these as `reported*` fields. |
| An offer summary can expose a discount without exposing its actual code. | Public text contains reveal controls. The live click handler was not reached. | Hidden codes remain `null` and `hidden-code`; the importer never fabricates a value from a percentage or label. |
| A community submission and a source-verified badge are different states. | Observed public badges. | Separate `community-submission`, `source-reported-verified`, and `unknown` states. None sets `checkoutTested`. |
| Relative activity and source observation time describe different events. | Public pages use relative labels. | Retain those labels; require the original observation time for offline imports. Importing cannot refresh evidence. |
| Competitor suggestions and navigation contain unrelated discounts. | Public pages include similar-store sections around the offer list. | HTML is parsed structurally, navigation and hidden payloads are excluded, and offers are scoped to the verification-list section. |
| Repeated requests cannot resolve a host-level block. | REA browser capture and direct HTTP both returned 403. | Added shared-host circuit breaking, persisted backoff, and `Retry-After` handling. Other coupon sources continue. |
| The previous collector used the merchant-domain prefix as the catalog slug. | Source inspection: `quillbot` did not match the catalog's `quillbot-premium`. | Introduced a shared provider registry with explicit catalog identities for collection and profile links. |

The source's methodology describes automated checkout testing, human evidence,
and extension signals. Those are **upstream claims**, not independently reproduced
capabilities. Its private ranking formula, checkout network, human trust scores,
extension telemetry, and reveal API implementation remain unknown. No application
bundle was recovered from the blocked browser capture. Cloudflare scripts are
not evidence of SimplyCodes' application architecture.

The candidate review order is our own transparent policy: explicit code markup,
then the source-reported verification badge, then reported health as a tie-breaker.
It is not a reconstructed proprietary algorithm or a checkout success estimate.
Amounts and restrictions remain tied to each offer card. Candidates are never
automatically promoted into public discounts.

## Reproduce the browser investigation

Use the included [scenario](browser-scenario.json), changing the executable path
to an existing Chrome-family browser if needed:

```sh
npm exec --cache /tmp/saasfolio-rea-npm-cache --yes --package=rea-agents@6.7.0 -- \
  rea capture-browser-scenario docs/research/simplycodes/browser-scenario.json \
  --json > /tmp/simplycodes-capture.json
```

This launches an isolated browser and runs ordinary public navigation. It does
not install a browser, change agent/MCP configuration, or solve a challenge.
When blocked, the observed boundary is retained and no reveal handler is claimed
to have been inspected. The public
[robots rules](https://simplycodes.com/robots.txt) exclude API, AJAX, redirect, and
verification routes; the collector uses public store URLs.

## Inspect a permitted capture

```sh
npm run coupons:inspect -- \
  --input=/tmp/simplycodes-capture.json --format=rea \
  --source=https://simplycodes.com/store/quillbot.com --tool=quillbot-premium \
  --observed-at=2026-10-21T03:54:12.899Z
```

Use the actual capture time for a new investigation. `html` and `text` formats
also accept locally retained public page material. The REA importer validates
the retained DOM digest and byte count and rejects a different store. Exit code
2 means blocked/unrecognized input, not successful coupon recovery. An old input
cannot overwrite a newer candidate observation.

`--output=/path/report.json` saves a derived report. `--write-candidates` imports
parsed candidates into the snapshot without changing live offers or advancing
source checks. Known catalog slugs are required. Code markup alone does not
establish computed CSS visibility or checkout acceptance.

```sh
npm run catalog:refresh -- --discovery-only
npm run catalog:refresh -- --discovery-only --only=quillbot-premium,hostinger
npm run test:offers
```

The refresh reports scheduled jobs, actual source-page HTTP requests, and skipped
jobs. Robots requests are additional. Sources paused by backoff keep their prior
checked date. 401/403 blocks pause for at least 24 hours; transient errors use
bounded exponential backoff, and 429 honors a longer `Retry-After` value.

Two live discovery runs were executed. The first scheduled six sources, sent two
source-page requests, and skipped four after the host block. The second sent one
source-page request and skipped all five SimplyCodes entries under persisted
backoff, while continuing the accessible provider. Both recovered zero candidate
codes. See [the recorded counters](refresh-observations.json). These counts do
not measure total runtime, CPU, memory, or token savings.

Parser fixtures are constructed examples matching observed field shapes. They
prove extraction and failure semantics, not that a current live SimplyCodes DOM
has been successfully parsed. The live capture proves the blocking condition.

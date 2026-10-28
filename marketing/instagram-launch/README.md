# SaaSFolio Instagram launch reel

**Updated narrated studio edition:** [advanced/exports/saasfolio-studio-reel-v2.mp4](advanced/exports/saasfolio-studio-reel-v2.mp4). This adds neural narration, 60 fps 3D animation, word-synced captions and a newly composed, voice-ducked score. See [advanced/README.md](advanced/README.md).

The finished film is [exports/saasfolio-instagram-reel.mp4](exports/saasfolio-instagram-reel.mp4). Use [exports/saasfolio-reel-cover.jpg](exports/saasfolio-reel-cover.jpg) as its cover and copy the post text from [caption.txt](caption.txt).

The film uses SaaSFolio’s original folded-S mark, lime `#C6FF3D`, Space Grotesk, Inter and JetBrains Mono. It includes English on-screen explanations and an original instrumental score. There is no spoken voiceover.

## Deliverables

| File | Purpose |
| --- | --- |
| `exports/saasfolio-instagram-reel.mp4` | Finished vertical reel, with music |
| `exports/saasfolio-reel-cover.jpg` | Matching 1080 × 1920 cover |
| `exports/storyboard.jpg` | Seven-scene visual overview |
| `exports/scene-01.jpg` through `scene-07.jpg` | Full-resolution scene previews |
| `caption.txt` | Ready-to-copy launch caption |
| `reel.html` and `film.js` | Editable animation source; open the HTML to preview the visual loop |
| `assets/original-score.wav` and `soundtrack.mjs` | Original instrumental and its editable synthesizer source |
| `render.mjs` | Repeatable browser-to-video renderer |

## Export specifications

- Duration: 34.133 seconds, 1,024 frames.
- Image: 1080 × 1920, 9:16, 30 frames per second.
- Video: H.264 High Profile, CRF 16, YUV 4:2:0, BT.709, square pixels, fast-start MP4.
- Audio: stereo AAC, 48 kHz, 256 kbps. Normalized toward −14 LUFS and −1.5 dBTP.
- Primary headlines and actions fit within x=80–922 and y=290–1450. Branding and secondary footer details sit outside that area.

## Scene timing

| Time | Story |
| --- | --- |
| 0.00–3.20 | Hook: “Your next tool should cost less.” |
| 3.20–6.40 | Brand reveal and “Software savings. Clear terms.” |
| 6.40–12.80 | Search software brands and categories; demonstrate a Notion search |
| 12.80–18.13 | Coupons, trials, annual savings, source links, eligibility and check dates |
| 18.13–23.47 | Compare tools: features, pricing and alternatives |
| 23.47–28.80 | Calculator: $30/month vs $300/year, $0 access fee, $60 yearly saving |
| 28.80–34.13 | “Good software. Better prices.”, saasfolio.tech, and follow call to action |

The visuals are bespoke animated illustrations of existing product functions, rather than browser recordings. Product scope was checked against the repository’s brand directory, discount pages, comparison interface and savings calculator. Notion and ClickUp are listed software brands. No partnership is implied, and the comparison does not assign a winner or invent prices. Calculator amounts are an explicitly labeled example, not a live offer. The reel does not advertise checkout-tested coupons, universal discounts, customer totals or production-ready community features.

The score is synthesized from oscillators and deterministic noise, with no external song or sampled recording. It follows the scene transitions at 112.5 BPM. The font assets were copied from the project’s existing local Next.js font build; the renderer uses the bundled copies on subsequent renders.

## Re-render

From the repository root, with Node.js, FFmpeg, Chrome and the project’s existing `sharp` dependency installed:

```sh
node marketing/instagram-launch/soundtrack.mjs
node marketing/instagram-launch/render.mjs --preview
node marketing/instagram-launch/render.mjs
```

Set `CHROME_PATH` if Chrome is installed somewhere other than the standard macOS application path. Preview mode writes the cover and scene images without encoding the MP4. The animation is rendered at exact timestamps, so the export does not depend on screen-recording speed or dropped display frames. It does not run or modify the Next.js application, call its APIs, create accounts, or publish to Instagram.

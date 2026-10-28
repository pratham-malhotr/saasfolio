# SaaSFolio studio reel — narrated edition

Use [exports/saasfolio-studio-reel-v2.mp4](exports/saasfolio-studio-reel-v2.mp4) for the updated reel. It is a new edit; the original music-only reel remains in the parent directory. Open [exports/preview.html](exports/preview.html) for a video player with download links.

## What changed

- A natural English neural voice explains the product and its main functions.
- Eight individually designed scenes replace the previous seven-scene edit.
- True projected 3D meshes, a dimensional logo, floating software cards and perspective UI panels add depth.
- An interactive search, category chips, offer cards, guided comparison rows and growing cost bars demonstrate product functions.
- Word-synced captions highlight the spoken word. The pronunciation script and displayed SaaSFolio name are handled separately.
- Optical zoom and lateral transitions connect the shots. Captions stay above the bottom interface area.
- The new original score uses warm chords, glass plucks, bass, drums and a closing audio signature. A separate effects track adds typing, clicks, sweeps, impacts and a savings chime.
- Music automatically lowers under narration. The mix uses separate voice, music and effects stems and two-pass loudness mastering.

## Finished files

| File | Purpose |
| --- | --- |
| `exports/saasfolio-studio-reel-v2.mp4` | Finished 34.667-second narrated reel |
| `exports/saasfolio-studio-cover.jpg` | Matching 1080 × 1920 cover |
| `exports/saasfolio-studio-subtitles.srt` | Separate subtitle file; visible word captions are already in the video |
| `exports/studio-storyboard.jpg` | Eight-scene visual overview |
| `exports/preview.html` | Local video player |
| `caption.txt` | Ready-to-copy post caption |
| `voiceover-script.txt` | Final spoken script |

Picture: 1080 × 1920, 9:16, 60 fps, 2,080 frames. H.264 High Profile, CRF 15, BT.709, square pixels, fast-start MP4. Audio: stereo AAC, 48 kHz, 320 kbps. Primary copy and calls to action stay within x=80–945 and y=270–1450; word captions occupy y=1490–1562. Footer details are secondary.

## Story

| Time | Shot | Explanation |
| --- | --- | --- |
| 0.00–3.20 | Software orbit | “Still paying too much for software?” |
| 3.20–6.40 | Dimensional brand reveal | Meet SaaSFolio; spend smarter |
| 6.40–11.20 | Search interaction | Search tools by brand or category |
| 11.20–16.00 | Offer cards | Coupons, trials, annual savings, clear terms, source links and eligibility |
| 16.00–21.33 | Comparison | Features, pricing and alternatives, side by side |
| 21.33–27.20 | Cost calculator | Monthly vs annual costs, including access fees |
| 27.20–29.33 | Brand payoff | Good software, better prices |
| 29.33–34.67 | Call to action | Visit saasfolio.tech; follow for smarter software |

The product visuals are bespoke animated illustrations of existing repository functions. They are not recordings of the live application. The search, comparison, brand savings guides and calculator were checked against their source components. The Notion/ClickUp comparison identifies areas to inspect without inventing product scores, a winner, or provider prices. The $30/month, $300/year, $0 fee and $60 saving are a labeled illustrative calculation. No checkout success, universal discount, unconfigured account capability or community activity is claimed.

## Source and regeneration

- `film-core.js`: perspective geometry, shading, material rendering, typography and UI primitives.
- `film-scenes.js`: eight animated product shots.
- `film.js`: edit timing, optical transitions, captions and cover.
- `voiceover.py`: generates eight neural speech clips, aligns each to its shot and saves word boundaries.
- `sound-design.mjs`: synthesizes the original score and effects without external recordings or samples.
- `mix-audio.mjs`: voice processing, music ducking and two-pass mastering.
- `render.mjs`: deterministic browser-to-FFmpeg rendering.

The included narration uses Microsoft's `en-US-AndrewNeural` voice through [edge-tts](https://github.com/rany2/edge-tts). Regenerating speech needs network access. The existing audio is bundled, so image/video rendering works offline. This does not use a cloned person's voice. Font assets are the same local Space Grotesk, Inter and JetBrains Mono files as the first edit.

From the repository root:

```sh
# Only needed when changing the spoken script; requires uv and internet access.
uvx --cache-dir /private/tmp/saasfolio-uv --from edge-tts python marketing/instagram-launch/advanced/voiceover.py

node marketing/instagram-launch/advanced/sound-design.mjs
node marketing/instagram-launch/advanced/mix-audio.mjs
node marketing/instagram-launch/render.mjs --advanced --preview
node marketing/instagram-launch/render.mjs --advanced
```

Chrome, FFmpeg, Node.js and the project's existing `sharp` dependency are required. Set `CHROME_PATH` for a nonstandard Chrome installation. Open `reel.html` and click its canvas to preview the editable animation with sound. The exported MP4 is the playback master.

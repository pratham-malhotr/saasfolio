# SaaSFolio — The Premium SaaS Deals, Reviews & Community Platform

> **Domain:** [saasfolio.tech](https://saasfolio.tech)  
> **Taglines:** *Discover. Save. Scale.* / *Where SaaS Deals Win.* / *Smarter SaaS. Smaller Bills.*  
> **Aesthetic Archetype:** Maddworld Cinematic Dark (`#000000`, Electric Lime `#C6FF3D`, High-Contrast Marquees, Oversized Editorial Typography, 60fps Micro-interactions).

---

## ⚡ Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack, React 19)
- **Styling:** Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Motion & Scrolling:** Framer Motion + GSAP + Lenis Smooth Scroll
- **Interactive FX:** HTML5 Canvas particle constellation + Canvas Confetti
- **Typography:** Space Grotesk (Editorial Display) + Inter (Body) + JetBrains Mono (Meta / Badges)
- **Icons:** Lucide Icons + Custom Monogram SVG System
- **Validation:** Zod + React Hook Form

---

## 🚀 Quickstart

```bash
# 1. Clone repository
git clone https://github.com/saasfolio/saasfolio.git
cd saasfolio

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local

# 4. Run local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🎨 Design System & Token Swapping

The design system is centered on pure obsidian black (`#050505` / `#000000`) paired with a high-voltage signature accent.

### To swap the accent color (e.g. from Electric Lime `#C6FF3D` to Electric Violet `#7C5CFF`):
Edit `app/globals.css`:
```css
:root {
  /* Change this: */
  --accent: #C6FF3D;
  --accent-hover: #D8FF66;
  --accent-glow: rgba(198, 255, 61, 0.35);

  /* To Electric Violet: */
  --accent: #7C5CFF;
  --accent-hover: #967CFF;
  --accent-glow: rgba(124, 92, 255, 0.35);
}
```

---

## 🗺️ Project Execution Roadmap

- [x] **Phase 1: Architecture, Design System, Motion Core & Homepage**
  - [x] Next.js 15 App Router + TypeScript + Tailwind CSS v4
  - [x] Lenis smooth scrolling with fallback for reduced motion
  - [x] Branded SVG logo monogram & wordmark
  - [x] Custom follower cursor with context-sensitive labels (`VIEW`, `DEAL`, `READ`)
  - [x] Session preloader with percentage counter & curtain split reveal
  - [x] Interactive hero with clamp editorial typography & WebGL particle network
  - [x] Global command palette (`Cmd+K` / `Ctrl+K`) with real-time search
  - [x] Opposing infinite velocity marquee tickers
  - [x] Animated stats counters (`$2.4M+ Saved`, `500+ Tools`, `1,200+ Coupons`)
  - [x] Hot Deals shelf with countdown timer & interactive coupon reveal modal
  - [x] Confetti burst, code copy toast & crowdsourced success-rate voting
  - [x] 12 Minimalist category cards with shortcode tags (`AI`, `DEV`, `MKTG`...)
  - [x] Editorial review lead story & secondary magazine layout
  - [x] Trending community discussions with optimistic upvotes
  - [x] Looping SaaS brand logo marquee
  - [x] 3-step interactive workflow (Discover → Compare → Save)
  - [x] VIP Tuesday SaaS brief newsletter with validation
  - [x] Giant editorial footer with live system status & affiliate disclosure
  - [x] Multi-device verification across desktop (1440px) and mobile (375px)

- [x] **Phase 2: Data Architecture, Seed Engine, Deals Hub & Directory**
  - [x] Universal TypeScript schema with 249 tools & 290 verified deals across popular, mid-tier, and indie/budget tiers (`lib/data/tools-data.ts`, `lib/data/deals-data.ts`)
  - [x] Multi-facet Deals Hub (`/deals`) with category filters, discount % slider, pricing types, and sort engine
  - [x] Deal detail page (`/deals/[slug]`) with blur-to-reveal coupon modal, confetti animation, and crowdsourced feedback
  - [x] Tools Directory (`/tools`) & Tool Profiles (`/tools/[slug]`) with feature matrices, pricing plans, and alternatives
  - [x] Dynamic Head-to-Head Comparison Engine (`/compare/[slug]`) with interactive dual tool selector
  - [x] Affiliate Interstitial Redirect Gateway (`/go/[id]`) with security verification countdown

- [x] **Phase 3: Editorial Engine, MDX Magazine & Community Forum**
  - [x] Longform Architectural Reviews (`/articles`) across 8 deep guides (600–1,200 words each)
  - [x] AI Audio Voice Narration player (Web Speech API) with playback speed controls
  - [x] Reading progress bar, sticky scrollspy Table of Contents, and in-article Deal Callouts
  - [x] Editorial Pros/Cons breakdown cards, feature comparison tables, and interactive comment threads
  - [x] Community Forum Hub (`/community`) with Hot/Top/New tabs, category tagging, and optimistic upvoting
  - [x] Thread detail pages (`/community/[slug]`) with nested replies, user badges, and tool deal shelf

- [x] **Phase 4: User Authentication, Submissions, Bookmarks & Admin Portal**
  - [x] 1-Click OAuth simulation & passwordless magic-link authentication (`/login`, `/signup`)
  - [x] Member Passport Dashboard (`/profile`, `/u/[username]`) with reputation points (640 PTS) and 4 interactive tabs
  - [x] 4-Step Vendor & Deal Submission Portal (`/submit`) with real-time card preview and ticket generation
  - [x] Admin Mission Control Dashboard (`/admin`) with live KPI metrics, vendor moderation queue, and deal toggles
  - [x] Global Navbar integration with profile avatar pill, quick dropdown menu, and mobile drawer sync
  - [x] Dynamic production SEO sitemap (`/sitemap.xml`) indexing 101 routes and strict `robots.txt`
  - [x] Turbopack production build with 101 static routes prerendered in <800ms with zero errors

---

## 📄 License & Attribution
Operated by SaaSFolio (saasfolio.tech). Released under the MIT License.

## Expanded catalog and sourced offers

The catalog includes 220 additional brands and consolidates duplicate legacy
profiles under canonical URLs. Public offers use recorded source evidence;
pricing-only links do not claim a discount. See [catalog and refresh documentation](docs/CATALOG-AND-OFFERS.md)
for data files, public-source research, coupon restrictions, the twice-daily
GitHub Actions workflow, and deployment requirements.

```sh
npm run catalog:expand
npm run catalog:refresh -- --discovery
npm run validate:catalog
npm run test:offers
npm run build
```

The refresh needs public internet access and no API keys. Publishing the workflow
to GitHub, enabling Actions, and connecting the hosting deployment are required
before scheduled updates appear on the live site. Source checks are not checkout
tests. Existing editorial and community demo content still needs factual review.

## SEO configuration and validation

See [the SEO implementation and launch checklist](docs/SEO.md) for canonical URLs, indexing rules, structured data, Search Console setup, content verification requirements, and the production-response audit (`npm run seo:audit`).

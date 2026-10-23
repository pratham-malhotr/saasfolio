# SaaSFolio brand and search identity

The mark is an original geometric S with a folded-paper corner, built as a small SVG. The shape connects the SaaS initial with a folio/page motif. Lime `#C6FF3D`, dark ink `#10120B` and a white fold match the site's existing palette. It contains no font-dependent glyph and remains legible at favicon sizes.

The master is `lib/brand-mark.mjs`; the site renders it through `components/brand/BrandMark.tsx`. Header and footer wordmarks retain SaaSFolio's mixed-case name and use the same mark. Social images also render it. `npm run brand:assets` exports:

- `app/favicon.ico`: PNG-backed 16, 32, 48 and 64 pixel images.
- `public/brand/saasfolio-icon.svg`: stable vector icon URL.
- `public/brand/icon-{48,96,192,512}.png`: search, display and organization-logo sizes.
- `app/apple-icon.png`: 180 pixel Apple touch icon.

Root metadata explicitly declares PNG, SVG, shortcut and Apple icons. `app/manifest.ts` describes the site and its 192/512 pixel icons; it does not claim offline support. Organization JSON-LD identifies the 512 pixel logo. Canonicals continue to use the configured production origin rather than request headers.

The homepage title retains **SaaS Discounts, Software Deals & Reviews | SaaSFolio**. Its description now explains source links, terms and check dates instead of using a premium-discovery claim. The visible introduction, schema and social descriptions support the same message. Existing brand-specific metadata remains separate.

`npm run brand:audit -- http://127.0.0.1:3210` checks actual production HTML for browser and crawler user agents, fetched asset dimensions, ICO contents, Apple metadata, the manifest and organization identity. It also checks all listed brand links, coupon counts, partner membership disclosure and correction forms.

The existing advertising script in `app/layout.tsx` is preserved. Google controls the eventual favicon, site name and snippet; local assets alone cannot change already indexed results. See the [competitor investigation](research/competitors/README.md) for observations, limitations and the post-deployment checks.

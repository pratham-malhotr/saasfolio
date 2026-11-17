# Bundled website fonts

These unmodified Latin variable WOFF2 files were copied from the successful
November 17, 2026 production build's Google Fonts assets. The site uses Space
Grotesk, Inter and JetBrains Mono. Their licenses and original copyright
notices are included alongside each file. `manifest.json` records SHA-256
checksums. Characters outside these Latin subsets use system fallback fonts.

`next/font/local` retains automatic asset hashing, local delivery, display swap
and display/body preloading. The mono font remains unpreloaded. Unlike
`next/font/google`, it does not fetch external CSS or font files during builds.
This resolves repeated Google font-loader failures that blocked the catalog
release, without adding a runtime font provider request.

Upstream family and license sources:

- https://github.com/google/fonts/tree/main/ofl/spacegrotesk
- https://github.com/google/fonts/tree/main/ofl/inter
- https://github.com/google/fonts/tree/main/ofl/jetbrainsmono

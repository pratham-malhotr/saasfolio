import { DISCOUNT_BRAND_ALIASES } from "./lib/data/brand-discount-aliases.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // Keep complete metadata in the head for HTML-only crawlers and link previews.
  htmlLimitedBots: /.*/,
  async redirects() {
    const discountRedirects = Object.entries(DISCOUNT_BRAND_ALIASES).map(([alias, canonical]) => ({
      source: `/discounts/${alias}/:path*`,
      destination: `/discounts/${canonical}/:path*`,
      permanent: true,
    }));
    return [
      ...discountRedirects,
      { source: "/tools/kit-convertkit/:path*", destination: "/tools/convertkit/:path*", permanent: true },
      { source: "/deals/kit-convertkit-pricing", destination: "/deals/convertkit-pricing", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    return [
      {
        source: "/:path(admin|profile|login|signup|submit|u|go|auth|newsletter|reset-password)/:rest*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, follow" }],
      },
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/go/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/api/health",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

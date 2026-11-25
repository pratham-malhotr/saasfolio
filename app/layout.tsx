import { Suspense } from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteSchema } from "@/lib/structured-data";
import { pageMetadata, SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import localFont from "next/font/local";
import "./globals.css";
import "./market.css";
import "./shell.css";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { getDiscountSearchEntries } from "@/lib/brand-discounts";
import { getPublicSearchCatalog } from "@/lib/published-catalog";
import { ConsentAnalytics } from "@/components/privacy/ConsentAnalytics";
import { authConfigured } from "@/lib/server/supabase";

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  variable: "--font-display",
  weight: "400 700",
  display: "swap",
});

const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-body",
  weight: "300 700",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  variable: "--font-mono",
  weight: "400 700",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  ...pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }),
  metadataBase: new URL(SITE_URL),
  // Each public page supplies its own canonical; do not inherit the home URL.
  alternates: undefined,
  title: { default: SITE_TITLE, template: "%s | SaaSFolio" },
  applicationName: "SaaSFolio",
  icons: {
    icon: [
      { url: "/brand/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/brand/saasfolio-icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
  creator: "SaaSFolio",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || "gbheBtdeCps6aaCGBaVDKgoU7zAlh8Z7z8I364jKWM0",
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#050505] text-[#EDEDED] antialiased selection:bg-[#C6FF3D] selection:text-black font-body overflow-x-hidden">
        <Suspense fallback={null}><ConsentAnalytics /></Suspense>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <JsonLd data={siteSchema()} />
        <SmoothScroll>
          <div className="flex flex-col min-h-screen">
            <Suspense fallback={null}>
              <Navbar discountBrands={getDiscountSearchEntries()} searchCatalog={getPublicSearchCatalog()} accountsAvailable={authConfigured()} />
            </Suspense>
            <main id="main-content" tabIndex={-1} className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}

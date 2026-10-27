import { Suspense } from "react";
import type { Metadata } from "next";
import Script from "next/script";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteSchema } from "@/lib/structured-data";
import { pageMetadata, SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { CustomCursor } from "@/components/animations/CustomCursor";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";
import { ADSENSE_ACCOUNT } from "@/lib/advertising.mjs";
import { getDiscountSearchEntries } from "@/lib/brand-discounts";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
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
  other: { "google-adsense-account": ADSENSE_ACCOUNT },
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
        {/* Google tag (gtag.js) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-7G7TJJENC0"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-7G7TJJENC0');
          `}
        </Script>
        <a href="#main-content" className="skip-link">Skip to content</a>
        <JsonLd data={siteSchema()} />
        {/* Global Custom Follower Cursor */}
        <CustomCursor />

        {/* Lenis Smooth Scroll Engine */}
        <SmoothScroll>
          <div className="flex flex-col min-h-screen">
            {/* Sticky Translucent Navbar */}
            {/* The header is fixed; a flow-height fallback shifts the page on hydration. */}
            <Suspense fallback={null}>
              <Navbar discountBrands={getDiscountSearchEntries()} />
            </Suspense>

            {/* Main Content Area */}
            <main id="main-content" tabIndex={-1} className="flex-1">
              {children}
            </main>

            {/* Editorial Closing Footer */}
            <Footer />
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}

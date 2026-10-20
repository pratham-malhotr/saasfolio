import { Suspense } from "react";
import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteSchema } from "@/lib/structured-data";
import { pageMetadata, SITE_URL, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/animations/SmoothScroll";
import { CustomCursor } from "@/components/animations/CustomCursor";
import { Preloader } from "@/components/animations/Preloader";
import { Navbar } from "@/components/navigation/Navbar";
import { Footer } from "@/components/navigation/Footer";

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
});

export const metadata: Metadata = {
  ...pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" }),
  metadataBase: new URL(SITE_URL),
  // Each public page supplies its own canonical; do not inherit the home URL.
  alternates: undefined,
  title: { default: SITE_TITLE, template: "%s | SaaSFolio" },
  applicationName: "SaaSFolio",
  creator: "SaaSFolio",
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
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
        <JsonLd data={siteSchema()} />
        {/* Global Custom Follower Cursor */}
        <CustomCursor />

        {/* Brand Session Preloader */}
        <Preloader />

        {/* Lenis Smooth Scroll Engine */}
        <SmoothScroll>
          <div className="flex flex-col min-h-screen">
            {/* Sticky Translucent Navbar */}
            <Suspense fallback={<div className="h-20" />}>
              <Navbar />
            </Suspense>

            {/* Main Content Area */}
            <main id="main-content" className="flex-1">
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

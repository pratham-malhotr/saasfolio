import { Suspense } from "react";
import type { Metadata } from "next";
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
  metadataBase: new URL("https://saasfolio.tech"),
  title: {
    default: "SaaSFolio — Discover, Save & Scale | Premium SaaS Deals & Reviews",
    template: "%s | SaaSFolio",
  },
  description:
    "The award-level discovery hub for SaaS software. Hand-verified coupons, lifetime software deals, unbiased architectural reviews, and an active founder community.",
  keywords: [
    "SaaS deals",
    "SaaS discounts",
    "lifetime software deals",
    "verified coupons",
    "software reviews",
    "SaaS comparisons",
    "tech stack architecture",
    "saasfolio",
  ],
  authors: [{ name: "SaaSFolio Editorial Team" }],
  creator: "SaaSFolio",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://saasfolio.tech",
    siteName: "SaaSFolio",
    title: "SaaSFolio — Discover, Save & Scale | Premium SaaS Deals & Reviews",
    description:
      "Hand-verified coupons, lifetime software deals, and transparent architectural reviews for founders, developers, and marketers.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SaaSFolio — Where SaaS Deals Win",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaSFolio — Discover, Save & Scale",
    description:
      "The premier discovery platform for verified SaaS coupons, lifetime software deals, and tech reviews.",
    creator: "@saasfolio",
  },
  robots: {
    index: true,
    follow: true,
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

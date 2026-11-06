import React from "react";
import Link from "next/link";
import { getCatalogCategories } from "@/lib/categories";
import { getPublishedTools, getPublishedOffers } from "@/lib/published-catalog";
import { HeroSection } from "@/components/sections/HeroSection";
import { BrandDiscountsSection } from "@/components/sections/BrandDiscountsSection";
import { JsonLd } from "@/components/seo/JsonLd";
import { getFeaturedDiscountBrands } from "@/lib/brand-discounts";
import { webPageSchema } from "@/lib/structured-data";
import { MarqueeTickerBand } from "@/components/sections/MarqueeTickerBand";
import { StatsCounters } from "@/components/sections/StatsCounters";
import { HotDealsSection } from "@/components/sections/HotDealsSection";
import { CategoryMatrix } from "@/components/sections/CategoryMatrix";
import { FeaturedArticlesSection } from "@/components/sections/FeaturedArticlesSection";
import { BuyingDecisionSection } from "@/components/sections/BuyingDecisionSection";
import { LogoMarqueeSection } from "@/components/sections/LogoMarqueeSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { SavingsCollectionLinks } from "@/components/seo/SavingsCollectionLinks";

import { absoluteUrl, pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });

export const revalidate = 3600;

export default function HomePage() {
  const deals = getPublishedOffers();
  const newsletterAvailable = Boolean(process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes("your_api") && process.env.NEWSLETTER_FROM_EMAIL);
  return (
    <div className="relative bg-[#050505] text-[#EDEDED] min-h-screen">
      <JsonLd data={{
        "@context": "https://schema.org",
        ...webPageSchema("SaaS Discounts & Software Deals", SITE_DESCRIPTION, "/"),
        mainEntity: {
          "@type": "ItemList",
          name: "Featured SaaS brand discounts",
          itemListElement: getFeaturedDiscountBrands().map((tool, index) => ({
            "@type": "ListItem", position: index + 1, name: `${tool.name} discounts`, url: absoluteUrl(`/discounts/${tool.slug}`),
          })),
        },
      }} />
      {/* 1. Hero Section */}
      <HeroSection />
      <BuyingDecisionSection />

      <BrandDiscountsSection deals={deals} />

      <section className="home-deferred mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <SavingsCollectionLinks heading="Find software savings for your situation" />
      </section>

      {/* 2. Infinite Marquee Ticker Band */}
      <MarqueeTickerBand />

      {/* 3. Animated Viewport Stats Counters */}
      <StatsCounters toolCount={getPublishedTools().length} offerCount={deals.length} couponCount={deals.filter(deal => deal.code).length} categoryCount={getCatalogCategories().length} />

      {/* 4. Hot Deals This Week (Horizontal Shelf + Countdown + Instant Coupon Reveal) */}
      <HotDealsSection deals={deals.filter(d => d.dealType !== "pricing").slice(0, 10)} totalDeals={deals.filter(deal => deal.dealType !== "pricing").length} />

      {/* 5. Minimalist 12-Category Grid */}
      <CategoryMatrix categories={getCatalogCategories()} />

      {/* 6. Featured In-Depth Editorial Articles & Reviews */}
      <FeaturedArticlesSection />

      {/* 7. Trending in Community (Discussions & Upvotes) */}

      {/* 8. Logo Marquee of Featured Tools */}
      <LogoMarqueeSection />

      {/* 9. How SaaSFolio Works (3-Step Process) */}
      <HowItWorksSection />

      {newsletterAvailable ? <NewsletterSection /> : <section id="newsletter" data-newsletter-fallback="" className="home-deferred mx-auto max-w-5xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/15 bg-[#09090C] p-8 sm:p-12 space-y-6">
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">Make your next software decision with clear terms.</h2>
          <p className="max-w-3xl text-zinc-400 leading-relaxed">Read practical buying guides, compare subscription costs and check the conditions behind an offer. Have a question or found an outdated detail? Contact SaaSFolio with the page and its current source.</p>
          <div className="flex flex-wrap gap-5 text-sm text-[#C6FF3D]">
            <Link href="/articles" className="underline">Read the buying guides</Link>
            <Link href="/editorial-policy" className="underline">How we review sources</Link>
            <Link href="/contact" className="underline">Contact SaaSFolio</Link>
          </div>
        </div>
      </section>}
    </div>
  );
}

import React from "react";
import { getCatalogCategories } from "@/lib/categories";
import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
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
import { CommunityTrendingSection } from "@/components/sections/CommunityTrendingSection";
import { LogoMarqueeSection } from "@/components/sections/LogoMarqueeSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";

import { absoluteUrl, pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });

export const revalidate = 3600;

export default function HomePage() {
  const deals = getAllDeals();
  return (
    <div className="relative bg-[#050505] text-[#EDEDED] min-h-screen">
      <JsonLd data={{
        "@context": "https://schema.org",
        ...webPageSchema("SaaS Discounts & Software Coupon Codes", SITE_DESCRIPTION, "/"),
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

      <BrandDiscountsSection deals={deals} />

      {/* 2. Infinite Marquee Ticker Band */}
      <MarqueeTickerBand />

      {/* 3. Animated Viewport Stats Counters */}
      <StatsCounters toolCount={getAllTools().length} offerCount={deals.filter(deal => deal.dealType !== "pricing").length} couponCount={deals.filter(deal => deal.code).length} categoryCount={getCatalogCategories().length} />

      {/* 4. Hot Deals This Week (Horizontal Shelf + Countdown + Instant Coupon Reveal) */}
      <HotDealsSection deals={deals.filter(d => d.dealType !== "pricing").slice(0, 10)} totalDeals={deals.filter(deal => deal.dealType !== "pricing").length} />

      {/* 5. Minimalist 12-Category Grid */}
      <CategoryMatrix categories={getCatalogCategories()} />

      {/* 6. Featured In-Depth Editorial Articles & Reviews */}
      <FeaturedArticlesSection />

      {/* 7. Trending in Community (Discussions & Upvotes) */}
      <CommunityTrendingSection />

      {/* 8. Logo Marquee of Featured Tools */}
      <LogoMarqueeSection />

      {/* 9. How SaaSFolio Works (3-Step Process) */}
      <HowItWorksSection />

      {/* 10. VIP Newsletter Subscription */}
      <NewsletterSection />
    </div>
  );
}

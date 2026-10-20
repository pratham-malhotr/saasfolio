import React from "react";
import { HeroSection } from "@/components/sections/HeroSection";
import { MarqueeTickerBand } from "@/components/sections/MarqueeTickerBand";
import { StatsCounters } from "@/components/sections/StatsCounters";
import { HotDealsSection } from "@/components/sections/HotDealsSection";
import { CategoryMatrix } from "@/components/sections/CategoryMatrix";
import { FeaturedArticlesSection } from "@/components/sections/FeaturedArticlesSection";
import { CommunityTrendingSection } from "@/components/sections/CommunityTrendingSection";
import { LogoMarqueeSection } from "@/components/sections/LogoMarqueeSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { NewsletterSection } from "@/components/sections/NewsletterSection";

import { pageMetadata, SITE_TITLE, SITE_DESCRIPTION } from "@/lib/seo";

export const metadata = pageMetadata({ title: SITE_TITLE, description: SITE_DESCRIPTION, path: "/" });

export default function HomePage() {
  return (
    <div className="relative bg-[#050505] text-[#EDEDED] min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Infinite Marquee Ticker Band */}
      <MarqueeTickerBand />

      {/* 3. Animated Viewport Stats Counters */}
      <StatsCounters />

      {/* 4. Hot Deals This Week (Horizontal Shelf + Countdown + Instant Coupon Reveal) */}
      <HotDealsSection />

      {/* 5. Minimalist 12-Category Grid */}
      <CategoryMatrix />

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

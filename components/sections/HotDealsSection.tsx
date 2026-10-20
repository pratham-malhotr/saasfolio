"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, Clock, ShieldCheck, Tag, Zap, ExternalLink } from "lucide-react";
import { HOT_DEALS, SaaSDeal } from "@/lib/mock-data";
import { getCustomAffiliateUrl } from "@/lib/data/affiliate-links";
import { TiltCard } from "@/components/animations/TiltCard";
import { CouponRevealModal } from "@/components/modals/CouponRevealModal";
import { Reveal } from "@/components/animations/Reveal";

export function HotDealsSection() {
  const [selectedDeal, setSelectedDeal] = useState<SaaSDeal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleOpenReveal = (deal: SaaSDeal) => {
    setSelectedDeal(deal);
    setModalOpen(true);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = direction === "left" ? -400 : 400;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
  };

  return (
    <section className="py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      {/* Background glow spot */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#C6FF3D]/5 blur-[160px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
                LIMITED-TIME OFFERS // Q4 2026
              </span>
            </div>
            <h2 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-5xl lg:text-6xl text-white">
              HOT DEALS THIS WEEK
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Scroll navigation arrows */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => scroll("left")}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/10 hover:border-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => scroll("right")}
                className="w-10 h-10 rounded-full border border-white/15 bg-white/[0.03] hover:bg-white/10 hover:border-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <Link
              href="/deals"
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#C6FF3D] hover:underline uppercase font-mono tracking-wider"
            >
              All Deals ({HOT_DEALS.length * 7}+) <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Horizontally Scrollable Deal Cards Shelf */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-none snap-x snap-mandatory"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {HOT_DEALS.map((deal) => (
            <div
              key={deal.id}
              className="min-w-[320px] sm:min-w-[380px] max-w-[380px] shrink-0 snap-start"
            >
              <TiltCard
                cursorLabel="DEAL"
                className="h-full flex flex-col justify-between p-6 bg-[#0B0B0E] border-white/10 hover:border-[#C6FF3D]/50 transition-all duration-300"
              >
                <div>
                  {/* Top Badges & Countdown */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#C6FF3D] text-black font-black uppercase tracking-wider">
                      {deal.discountPercentage}% OFF
                    </span>

                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-zinc-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                      <Clock className="w-3.5 h-3.5 text-[#C6FF3D]" />
                      <span>2d 14h left</span>
                    </div>
                  </div>

                  {/* Tool info & Category */}
                  <div className="mb-3">
                    <div className="font-mono text-[11px] uppercase text-zinc-500 mb-1 flex items-center gap-2">
                      <span>{deal.category}</span>
                      <span>✦</span>
                      <span className="text-zinc-400">{deal.dealType.toUpperCase()}</span>
                    </div>
                    <h3 className="font-display font-bold text-xl text-white group-hover:text-[#C6FF3D] transition-colors leading-snug">
                      {deal.toolName}
                    </h3>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-sm font-semibold text-zinc-200 mb-2 line-clamp-1">
                    {deal.title}
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-6">
                    {deal.description}
                  </p>

                  {/* Pricing Comparison */}
                  {deal.originalPrice !== undefined && deal.dealPrice !== undefined && (
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="font-mono text-2xl font-black text-[#C6FF3D]">
                        ${deal.dealPrice}
                      </span>
                      {deal.originalPrice > 0 && (
                        <span className="font-mono text-sm line-through text-zinc-500">
                          ${deal.originalPrice}
                        </span>
                      )}
                      <span className="text-[11px] text-zinc-400 font-mono">
                        /{deal.billingPeriod || "month"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Bottom Stats & Trigger */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span className="flex items-center gap-1 text-[#C6FF3D]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {deal.successRate}% Success
                    </span>
                    <span>{deal.revealsCount} used</span>
                  </div>

                  {/* Action Buttons: Reveal + Direct Claim */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenReveal(deal)}
                      className="flex-1 py-3 px-3 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C6FF3D] hover:text-black hover:border-[#C6FF3D] transition-all flex items-center justify-center gap-1.5 group/btn shadow-[0_0_15px_rgba(198,255,61,0.05)] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#C6FF3D] group-hover/btn:text-black" />
                      <span>Reveal Code</span>
                    </button>

                    <a
                      href={getCustomAffiliateUrl(deal.toolSlug) || deal.affiliateUrl}
                      target="_blank"
                      rel="sponsored nofollow noopener noreferrer"
                      className="py-3 px-3.5 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] hover:bg-[#C6FF3D] hover:text-black transition-all font-mono text-xs font-bold flex items-center justify-center gap-1"
                      title={`Go directly to ${deal.toolName} discount checkout`}
                    >
                      <span>Claim</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </TiltCard>
            </div>
          ))}
        </div>
      </div>

      {/* Coupon Reveal Modal */}
      <CouponRevealModal
        deal={selectedDeal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </section>
  );
}

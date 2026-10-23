"use client";

import { OfferAction } from "@/components/deals/OfferAction";
import React, { useState } from "react";
import Link from "next/link";
import { 
  Star, 
  ExternalLink, 
  ShieldCheck, 
  Check, 
  X, 
  Sparkles, 
  GitCompare, 
  ArrowRight
} from "lucide-react";
import { offerLabel } from "@/lib/offer-links";
import { DetailedTool, SaaSDeal } from "@/lib/types";
import { CouponRevealModal } from "@/components/modals/CouponRevealModal";

interface ToolProfileClientProps {
  tool: DetailedTool;
  deals: SaaSDeal[];
  comparisonLinks: Record<string, string>;
  discountSummary: React.ReactNode;
}

export function ToolProfileClient({ tool, deals, comparisonLinks, discountSummary }: ToolProfileClientProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [selectedDeal, setSelectedDeal] = useState<SaaSDeal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 mb-8">
        <Link href="/" className="hover:text-white transition-colors">HOME</Link>
        <span>/</span>
        <Link href="/tools" className="hover:text-white transition-colors">DIRECTORY</Link>
        <span>/</span>
        <span className="text-zinc-300">{tool.category.toUpperCase()}</span>
        <span>/</span>
        <span className="text-[#C6FF3D]">{tool.name}</span>
      </div>

      {/* Profile Header Card */}
      <div className="p-8 sm:p-12 rounded-3xl bg-[#09090C] border border-white/15 mb-12 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-black border border-white/20 flex items-center justify-center font-display font-black text-2xl text-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.2)] shrink-0">
              {tool.logoLetter}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-2">
                <span className="font-mono text-xs text-[#C6FF3D] uppercase font-bold">
                  {tool.category}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                  {tool.pricingModel}
                </span>
                {tool.tier === "indie-budget" && (
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                    🌱 INDIE GEM
                  </span>
                )}
                {tool.tier === "mid-tier" && (
                  <span className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                    ⚡ MID-TIER
                  </span>
                )}
                {tool.verified && (
                  <span className="flex items-center gap-1 font-mono text-[11px] text-[#C6FF3D] bg-[#C6FF3D]/10 px-2 py-0.5 rounded border border-[#C6FF3D]/30">
                    <ShieldCheck className="w-3.5 h-3.5" /> VERIFIED
                  </span>
                )}
              </div>
              <h1 className="font-display font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
                {tool.name}
              </h1>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {tool.providerStatus === "unavailable" ? <span data-provider-unavailable="true" role="status" className="rounded-xl border border-amber-400/30 px-5 py-3 text-sm text-amber-200">Provider link unavailable</span> : <a
              href={`/go/${tool.slug}`}
              rel="sponsored nofollow noopener noreferrer"
              className="px-6 py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(198,255,61,0.3)]"
            >
              <span>Visit Official Website</span>
              <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            </a>}

            {tool.alternatives[0] && (
              <Link
                href={comparisonLinks[tool.alternatives[0].slug] || "/compare"}
                className="px-5 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 text-white font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <GitCompare className="w-3.5 h-3.5 text-[#C6FF3D]" />
                <span>Compare</span>
              </Link>
            )}
          </div>
        </div>

        {/* Tagline & Meta Stats */}
        <div className="pt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <p className="text-zinc-300 text-base sm:text-lg max-w-3xl leading-relaxed">
            {tool.tagline}
          </p>

          <div className="flex items-center gap-6 font-mono text-xs text-zinc-400 shrink-0">
            <div className="flex items-center gap-1.5 text-white">
              <Star className="w-4 h-4 fill-[#C6FF3D] text-[#C6FF3D]" />
              <span className="font-bold text-sm">{tool.reviewCount ? tool.rating : "Unrated"}</span>
              <span className="text-zinc-500">({tool.reviewCount} reviews)</span>
            </div>
            <span>✦</span>
            <div>
              {tool.pricingVerified ? <>Starts at <strong className="text-[#C6FF3D]">${tool.pricingStart}</strong>/mo</> : "See official pricing"}
            </div>
          </div>
        </div>
      </div>

      {tool.providerStatus === "unavailable" ? <section data-provider-unavailable="true" className="mb-10 rounded-2xl border border-amber-400/20 p-6 space-y-3"><h2 className="text-xl text-white">No current provider offer</h2><p className="text-sm text-zinc-400">{tool.providerNote}</p><Link href="/tools" className="text-[#C6FF3D] underline">Browse available alternatives</Link></section> : discountSummary}

      {/* Active Deals Banner (if tool has live coupons) */}
      {deals.length > 0 && (
        <div className="mb-12 p-6 rounded-2xl bg-gradient-to-r from-[#C6FF3D]/10 to-transparent border border-[#C6FF3D]/40">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C6FF3D]" />
              <h3 className="font-display font-bold text-xl text-white">
                {tool.name} offers & pricing options ({deals.length})
              </h3>
            </div>
            <span className="font-mono text-xs text-[#C6FF3D] font-bold">PROVIDER TERMS APPLY</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {deals.map((deal) => (
              <div
                key={deal.id}
                className="p-4 rounded-xl bg-black/60 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#C6FF3D] text-black font-black">
                      {offerLabel(deal)}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">{deal.dealType.toUpperCase()}</span>
                  </div>
                  <h4 className="text-sm font-bold text-white line-clamp-1">{deal.title}</h4>
                </div>
                <OfferAction deal={deal} onReveal={(deal) => { setSelectedDeal(deal); setModalOpen(true); }} className="px-4 py-2 rounded-lg bg-[#C6FF3D] text-black font-mono text-xs font-bold uppercase hover:bg-[#D6FF66] transition-all ml-4 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2-Column Content Layout: Left Details (8 cols) + Right Sidebar (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-10">
          {/* Detailed Overview */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-4">
            <h2 className="font-display font-bold text-2xl text-white uppercase">
              Product Overview & Architecture
            </h2>
            <p className="text-zinc-300 text-sm leading-relaxed">
              {tool.longDescription}
            </p>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 font-mono text-xs text-zinc-400">
              <span className="text-[#C6FF3D] font-bold mr-1">BEST SUITED FOR:</span>
              {tool.bestFor}
            </div>
          </div>

          {/* Key Features Checklist */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-4">
            <h2 className="font-display font-bold text-2xl text-white uppercase">
              Key Features & Capabilities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tool.keyFeatures.map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <Check className="w-4 h-4 text-[#C6FF3D] shrink-0 mt-0.5" />
                  <span className="text-xs text-zinc-300 leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Pros */}
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 font-mono text-xs font-bold uppercase tracking-wider">
                <Check className="w-4 h-4 stroke-[3]" /> THE GOOD (PROS)
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {tool.pros.map((pro, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{pro}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cons */}
            <div className="p-6 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-mono text-xs font-bold uppercase tracking-wider">
                <X className="w-4 h-4 stroke-[3]" /> SHORTCOMINGS (CONS)
              </div>
              <ul className="space-y-2 text-xs text-zinc-300">
                {tool.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 font-bold">•</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Pricing Plans Breakdown Table */}
          <div className="p-8 rounded-3xl bg-[#09090C] border border-white/10 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-2xl text-white uppercase">
                  Pricing Plans & Tiers
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Transparent breakdown without hidden usage penalties.
                </p>
              </div>

              {/* Monthly vs Annual Toggle */}
              <div className="flex items-center gap-2 p-1 rounded-xl bg-black border border-white/10 font-mono text-xs">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    billingCycle === "monthly" ? "bg-white/15 text-white font-bold" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("yearly")}
                  className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                    billingCycle === "yearly" ? "bg-[#C6FF3D] text-black font-bold" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[10px] bg-black/20 px-1 py-0.2 rounded font-mono">CHECK PROVIDER</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!tool.pricingPlans.length && tool.providerStatus !== "unavailable" && <a href={tool.pricingUrl || tool.website} target="_blank" rel="noopener noreferrer" className="text-sm text-[#C6FF3D] hover:underline">View current {tool.name} plans and billing terms on the official website ↗</a>}
              {tool.pricingPlans.map((plan) => {
                const price = billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
                return (
                  <div
                    key={plan.name}
                    className={`p-6 rounded-2xl border flex flex-col justify-between ${
                      plan.popular
                        ? "bg-[#101014] border-[#C6FF3D] shadow-[0_0_30px_rgba(198,255,61,0.1)]"
                        : "bg-black/50 border-white/10"
                    }`}
                  >
                    <div>
                      {plan.popular && (
                        <span className="font-mono text-[9px] px-2 py-0.5 rounded bg-[#C6FF3D] text-black font-black uppercase mb-3 inline-block">
                          MOST POPULAR
                        </span>
                      )}
                      <h4 className="font-display font-bold text-lg text-white mb-1">
                        {plan.name}
                      </h4>
                      <div className="flex items-baseline gap-1 my-3">
                        <span className="font-mono text-3xl font-black text-[#C6FF3D]">
                          ${price}
                        </span>
                        <span className="font-mono text-xs text-zinc-500">/mo</span>
                      </div>
                      <ul className="space-y-2 my-4 text-xs text-zinc-400">
                        {plan.features.map((feat, i) => (
                          <li key={i} className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-[#C6FF3D]" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <a
                      href={`/go/${tool.slug}`}
                      rel="sponsored nofollow noopener noreferrer"
                      className={`w-full py-2.5 rounded-xl text-center text-xs font-mono font-bold uppercase transition-all mt-4 ${
                        plan.popular
                          ? "bg-[#C6FF3D] text-black hover:bg-[#D6FF66]"
                          : "bg-white/10 text-white hover:bg-white/20"
                      }`}
                    >
                      Choose Plan
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Competitor Comparisons & Reviews (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Head-to-Head Compare Shortcut */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs uppercase text-[#C6FF3D] font-bold">
              <GitCompare className="w-4 h-4" />
              <span>HEAD-TO-HEAD COMPARISONS</span>
            </div>
            <p className="text-xs text-zinc-400">
              Evaluate real architectural trade-offs between {tool.name} and top alternatives:
            </p>

            <div className="space-y-2">
              {tool.alternatives.map((alt) => (
                <Link
                  key={alt.slug}
                  href={comparisonLinks[alt.slug] || "/compare"}
                  className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C6FF3D]/40 hover:bg-white/[0.06] transition-all"
                >
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-[#C6FF3D] transition-colors">
                      {tool.name} vs. {alt.name}
                    </div>
                    <div className="font-mono text-[10px] text-zinc-500">{alt.tagline}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* User Reviews */}
          <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase text-white font-bold">
                USER REVIEWS ({tool.reviews.length})
              </span>
              <span className="font-mono text-xs text-[#C6FF3D]">★ {tool.rating}/5.0</span>
            </div>

            <div className="space-y-3">
              {tool.reviews.map((rev) => (
                <div key={rev.id} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-white font-bold">{rev.author}</span>
                    <span className="text-zinc-500 text-[10px]">{rev.date}</span>
                  </div>
                  <div className="font-mono text-[10px] text-zinc-400">{rev.authorTitle}</div>
                  <p className="text-xs text-zinc-300 font-sans leading-relaxed">
                    &quot;{rev.content}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Coupon Reveal Modal */}
      <CouponRevealModal
        deal={selectedDeal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

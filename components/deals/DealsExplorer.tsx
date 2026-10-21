"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  Clock, 
  ShieldCheck, 
  Tag, 
  Sparkles, 
  X, 
  ChevronDown, 
  SlidersHorizontal,
  Flame,
  ArrowRight,
  RotateCcw,
  ExternalLink
} from "lucide-react";
import { offerLabel } from "@/lib/offer-links";
import { SaaSDeal } from "@/lib/types";
import { CATEGORIES } from "@/lib/mock-data";
import { TiltCard } from "@/components/animations/TiltCard";
import { CouponRevealModal } from "@/components/modals/CouponRevealModal";

interface DealsExplorerProps {
  initialDeals: SaaSDeal[];
  initialCategory?: string;
  initialType?: string;
  heading?: string;
  description?: string;
}

export function DealsExplorer({
  initialDeals,
  initialCategory,
  initialType,
  heading = "EXPLORE SAAS DEALS",
  description = "Browse sourced offers, reported coupon codes, free plans, trials, and official pricing across 12 software categories.",
}: DealsExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "all");
  const [selectedType, setSelectedType] = useState<string>(initialType || "all");
  const [minDiscount, setMinDiscount] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(500);
  const [sortBy, setSortBy] = useState<"trending" | "newest" | "discount" | "expiring">("trending");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Modal reveal state
  const [modalDeal, setModalDeal] = useState<SaaSDeal | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Filter & Sort logic
  const filteredDeals = useMemo(() => {
    return initialDeals
      .filter((deal) => {
        // Search filter
        if (searchQuery) {
          const q = searchQuery.toLowerCase().trim();
          const tokens = q.split(/\s+/).filter(Boolean);
          const intentWords = ["reveal", "coupon", "code", "voucher", "promo", "discount", "deal"];
          const hasIntent = tokens.some((t) => intentWords.includes(t));
          const coreTokens = tokens.filter((t) => !intentWords.includes(t));

          const searchTarget = `${deal.toolName} ${deal.toolSlug} ${deal.title} ${deal.description} ${deal.code || ""} ${deal.category}`.toLowerCase();

          if (coreTokens.length > 0) {
            const matchesCore = coreTokens.every((t) => searchTarget.includes(t));
            if (!matchesCore) return false;
          } else if (hasIntent) {
            if (deal.dealType !== "coupon" && !deal.code) return false;
          }
        }

        // Category filter
        if (selectedCategory !== "all") {
          if (deal.categorySlug !== selectedCategory && deal.category.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Deal type filter
        if (selectedType !== "all") {
          if (deal.dealType !== selectedType) return false;
        }

        // Discount % filter
        if (deal.discountPercentage < minDiscount) return false;

        // Max price filter
        if (deal.dealPrice !== undefined && deal.dealPrice > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          if (q.includes("coupon") || q.includes("reveal") || q.includes("code")) {
            const aIsCoupon = a.dealType === "coupon" || Boolean(a.code);
            const bIsCoupon = b.dealType === "coupon" || Boolean(b.code);
            if (aIsCoupon && !bIsCoupon) return -1;
            if (!aIsCoupon && bIsCoupon) return 1;
          }
        }
        if (sortBy === "trending") return (b.revealsCount || 0) - (a.revealsCount || 0);
        if (sortBy === "discount") return b.discountPercentage - a.discountPercentage;
        if (sortBy === "expiring") {
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        }
        return b.id.localeCompare(a.id);
      });
  }, [initialDeals, searchQuery, selectedCategory, selectedType, minDiscount, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedType("all");
    setMinDiscount(0);
    setMaxPrice(500);
    setSortBy("trending");
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedCategory !== "all" ||
    selectedType !== "all" ||
    minDiscount > 0 ||
    maxPrice < 500;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Page Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
            SOFTWARE OFFERS & PRICING // {filteredDeals.length} MATCHES
          </span>
        </div>
        <h1 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-6xl text-white mb-4">
          {heading}
        </h1>
        <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
          {description}
        </p>
      </div>

      {/* Top Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 p-3 rounded-2xl bg-[#09090C] border border-white/10">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-[#C6FF3D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by software, feature, or promo..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-zinc-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Controls: Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5">
          {/* Mobile Filter Sheet Button */}
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="md:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-[#C6FF3D]" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-zinc-300">
            <span className="text-zinc-500 hidden sm:inline">SORT:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="bg-transparent text-white outline-none cursor-pointer"
            >
              <option value="trending" className="bg-[#0A0A0C]">Trending / Popular</option>
              <option value="discount" className="bg-[#0A0A0C]">Biggest Discount %</option>
              <option value="expiring" className="bg-[#0A0A0C]">Expiring Soon</option>
              <option value="newest" className="bg-[#0A0A0C]">Newest Dropped</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Desktop Sidebar Filters (3 Cols) */}
        <aside className={`md:col-span-3 space-y-6 ${mobileFilterOpen ? "block" : "hidden md:block"}`}>
          {/* Deal Type Filter */}
          <div className="p-5 rounded-2xl bg-[#08080A] border border-white/10 space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
              DEAL TYPE
            </div>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                { label: "All Deal Formats", value: "all" },
                { label: "Coupon Codes", value: "coupon" },
                { label: "Lifetime Deals (LTD)", value: "lifetime" },
                { label: "Extended Free Trials", value: "free_trial" },
                { label: "Forever Free Tiers", value: "free_plan" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setSelectedType(t.value)}
                  className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                    selectedType === t.value
                      ? "bg-[#C6FF3D] text-black font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="p-5 rounded-2xl bg-[#08080A] border border-white/10 space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-300 font-bold">
              CATEGORIES
            </div>
            <div className="max-h-64 overflow-y-auto space-y-1 text-xs font-mono scrollbar-none pr-1">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`w-full text-left px-3 py-1.5 rounded-xl transition-all flex items-center justify-between ${
                  selectedCategory === "all"
                    ? "bg-[#C6FF3D] text-black font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>All Verticals</span>
                <span>{initialDeals.length}</span>
              </button>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`w-full text-left px-3 py-1.5 rounded-xl transition-all flex items-center justify-between ${
                    selectedCategory === cat.slug
                      ? "bg-[#C6FF3D] text-black font-bold"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span>{cat.shortCode} - {cat.name.split(" ")[0]}</span>
                  <span className="text-zinc-500 text-[10px]">{cat.dealCount}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Discount Filter */}
          <div className="p-5 rounded-2xl bg-[#08080A] border border-white/10 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs uppercase text-zinc-300 font-bold">
              <span>MIN DISCOUNT</span>
              <span className="text-[#C6FF3D]">{minDiscount > 0 ? `${minDiscount}%+` : "ANY"}</span>
            </div>
            <div className="grid grid-cols-4 gap-1 text-[11px] font-mono">
              {[0, 30, 50, 75].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setMinDiscount(pct)}
                  className={`py-1.5 rounded-lg border text-center transition-all ${
                    minDiscount === pct
                      ? "bg-[#C6FF3D] text-black font-bold border-[#C6FF3D]"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {pct === 0 ? "All" : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Slider */}
          <div className="p-5 rounded-2xl bg-[#08080A] border border-white/10 space-y-3">
            <div className="flex items-center justify-between font-mono text-xs uppercase text-zinc-300 font-bold">
              <span>MAX PRICE</span>
              <span className="text-[#C6FF3D]">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="0"
              max="500"
              step="25"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#C6FF3D] cursor-pointer"
            />
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>$0 (Free)</span>
              <span>$500</span>
            </div>
          </div>
        </aside>

        {/* Deals Grid (9 Cols) */}
        <main className="md:col-span-9 space-y-6">
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs font-mono">
              <span className="text-zinc-500 uppercase text-[11px]">ACTIVE FILTERS:</span>
              {selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30">
                  Vertical: {selectedCategory}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("all")} />
                </span>
              )}
              {selectedType !== "all" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30">
                  Type: {selectedType}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedType("all")} />
                </span>
              )}
              {minDiscount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30">
                  ≥{minDiscount}% off
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMinDiscount(0)} />
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/30">
                  Query: &quot;{searchQuery}&quot;
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery("")} />
                </span>
              )}
            </div>
          )}

          {/* Cards Grid */}
          {filteredDeals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDeals.map((deal) => (
                <TiltCard
                  key={deal.id}
                  cursorLabel="DEAL"
                  className="flex flex-col justify-between p-6 bg-[#0B0B0E] border-white/10 hover:border-[#C6FF3D]/50 transition-all duration-300"
                >
                  <div>
                    {/* Top Badges & Countdown */}
                    <div className="flex items-center justify-between gap-2 mb-4">
                      <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#C6FF3D] text-black font-black uppercase tracking-wider">
                        {offerLabel(deal)}
                      </span>

                      <span className="font-mono text-[10px] uppercase text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/10">
                        {deal.dealType.toUpperCase()}
                      </span>
                    </div>

                    {/* Tool info & Category */}
                    <div className="mb-3">
                      <div className="font-mono text-[11px] uppercase text-zinc-500 mb-1 flex items-center gap-2">
                        <span>{deal.category}</span>
                      </div>
                      <Link href={`/deals/${deal.slug}`} className="hover:underline">
                        <h3 className="font-display font-bold text-xl text-white group-hover:text-[#C6FF3D] transition-colors leading-snug">
                          {deal.toolName}
                        </h3>
                      </Link>
                    </div>

                    {/* Title & Description */}
                    <Link href={`/deals/${deal.slug}`}>
                      <h4 className="text-sm font-semibold text-zinc-200 mb-2 line-clamp-1 hover:text-[#C6FF3D] transition-colors">
                        {deal.title}
                      </h4>
                    </Link>
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
                        {deal.checkedAt ? "Source checked" : "View provider"}
                      </span>
                      <span>{deal.revealsCount} used</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setModalDeal(deal);
                          setModalOpen(true);
                        }}
                        className="flex-1 py-3 px-3 rounded-xl bg-white/5 border border-white/15 text-white font-bold text-xs uppercase tracking-wider hover:bg-[#C6FF3D] hover:text-black hover:border-[#C6FF3D] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{deal.code ? "Reveal Code" : "View Offer"}</span>
                      </button>

                      <a
                        href={`/go/${deal.slug}`}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="py-3 px-3.5 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 text-[#C6FF3D] hover:bg-[#C6FF3D] hover:text-black transition-all font-mono text-xs font-bold flex items-center justify-center gap-1"
                        title={`Go directly to ${deal.toolName} discount checkout`}
                      >
                        <span>Claim</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      <Link
                        href={`/deals/${deal.slug}`}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                        title="View Full Offer Details & Terms"
                      >
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </TiltCard>
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="py-24 text-center p-8 rounded-3xl bg-[#09090C] border border-white/10">
              <Sparkles className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="font-display font-bold text-2xl text-white mb-2">
                NO MATCHING DEALS FOUND
              </h3>
              <p className="text-zinc-400 text-sm max-w-md mx-auto mb-6">
                No active software discounts match your exact filter combination. Try clearing your filters or broadening your search criteria.
              </p>
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Coupon Reveal Modal */}
      <CouponRevealModal
        deal={modalDeal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Tag, FileText, MessageSquare, ExternalLink, X, Sparkles, ArrowRight, Layers, Check, Copy } from "lucide-react";
import confetti from "canvas-confetti";
import { FEATURED_ARTICLES, TRENDING_DISCUSSIONS, CATEGORIES } from "@/lib/mock-data";
import { TOOLS_DATA } from "@/lib/data/tools-data";
import { DEALS_DATA } from "@/lib/data/deals-data";
import { CUSTOM_AFFILIATE_LINKS, getCustomAffiliateUrl } from "@/lib/data/affiliate-links";
import type { SaaSDeal } from "@/lib/types";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "tools" | "deals" | "articles" | "community">("all");
  const [revealedNotice, setRevealedNotice] = useState<{
    code: string;
    toolName: string;
    url: string;
  } | null>(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Tokenized tools matching
  const filteredTools = useMemo(() => {
    if (!query) return TOOLS_DATA.slice(0, 4);
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    const intentWords = ["reveal", "coupon", "code", "voucher", "promo", "discount", "deal"];
    const coreTokens = tokens.filter((t) => !intentWords.includes(t));

    return TOOLS_DATA.filter((t) => {
      const target = `${t.name} ${t.slug} ${t.tagline} ${t.category} ${t.bestFor}`.toLowerCase();
      if (coreTokens.length > 0) {
        return coreTokens.every((tok) => target.includes(tok));
      }
      return target.includes(q);
    }).slice(0, 5);
  }, [query]);

  // Tokenized deals matching with intent recognition
  const filteredDeals = useMemo(() => {
    if (!query) return DEALS_DATA.filter((d) => d.featured).slice(0, 4);
    const q = query.toLowerCase().trim();
    const tokens = q.split(/\s+/).filter(Boolean);
    const intentWords = ["reveal", "coupon", "code", "voucher", "promo", "discount", "deal"];
    const hasIntent = tokens.some((t) => intentWords.includes(t));
    const coreTokens = tokens.filter((t) => !intentWords.includes(t));

    return DEALS_DATA.filter((d) => {
      const target = `${d.toolName} ${d.toolSlug} ${d.title} ${d.description} ${d.code || ""} ${d.category}`.toLowerCase();
      if (coreTokens.length > 0) {
        return coreTokens.every((tok) => target.includes(tok));
      }
      if (hasIntent) {
        return d.dealType === "coupon" || Boolean(d.code);
      }
      return target.includes(q);
    }).sort((a, b) => {
      if (hasIntent || q.includes("beehiiv")) {
        const aHasCode = Boolean(a.code);
        const bHasCode = Boolean(b.code);
        if (aHasCode && !bHasCode) return -1;
        if (!aHasCode && bHasCode) return 1;
      }
      return (b.revealsCount || 0) - (a.revealsCount || 0);
    }).slice(0, 6);
  }, [query]);

  // Top coupon deal for high-intent instant reveal
  const topCouponDeal = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();
    const hasIntent = q.includes("reveal") || q.includes("coupon") || q.includes("code") || q.includes("beehiiv");
    const dealWithCode = filteredDeals.find((d) => Boolean(d.code));
    if (dealWithCode && (hasIntent || filteredDeals.length > 0)) {
      return dealWithCode;
    }
    return null;
  }, [query, filteredDeals]);

  // Instant coupon reveal & direct site redirect handler
  const handleRevealAndRedirect = (deal: SaaSDeal) => {
    const tool = TOOLS_DATA.find((t) => t.slug === deal.toolSlug);
    const customAffiliate =
      getCustomAffiliateUrl(deal.toolSlug) ||
      getCustomAffiliateUrl(deal.slug) ||
      getCustomAffiliateUrl(deal.id) ||
      CUSTOM_AFFILIATE_LINKS[deal.toolSlug] ||
      CUSTOM_AFFILIATE_LINKS[deal.slug];
    const targetUrl = customAffiliate || tool?.website || (deal.affiliateUrl?.startsWith("http") ? deal.affiliateUrl : `/go/${deal.toolSlug}`);

    // 1. Copy code to clipboard
    if (deal.code && typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        navigator.clipboard.writeText(deal.code);
      } catch {
        // Fallback for non-secure contexts
      }
    }

    // 2. Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#C6FF3D", "#FFFFFF", "#7C5CFF", "#111111"],
        disableForReducedMotion: true,
      });
    } catch {
      // Confetti fallback
    }

    // 3. Set visual notice banner
    setRevealedNotice({
      code: deal.code || "AUTOMATIC",
      toolName: deal.toolName,
      url: targetUrl,
    });

    // 4. Immediately open destination website
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && topCouponDeal) {
      e.preventDefault();
      handleRevealAndRedirect(topCouponDeal);
    }
  };

  const filteredArticles = useMemo(() => {
    if (!query) return FEATURED_ARTICLES.slice(0, 2);
    const q = query.toLowerCase();
    return FEATURED_ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [query]);

  const filteredDiscussions = useMemo(() => {
    if (!query) return TRENDING_DISCUSSIONS.slice(0, 2);
    const q = query.toLowerCase();
    return TRENDING_DISCUSSIONS.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.toolTags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/80 backdrop-blur-md">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -15 }}
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0A0A0C] shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_25px_rgba(198,255,61,0.1)] overflow-hidden z-10"
        >
          {/* Search Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10 bg-[#0F0F12]">
            <Search className="w-5 h-5 text-[#C6FF3D]" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setRevealedNotice(null);
              }}
              onKeyDown={handleInputKeyDown}
              placeholder="Search tools, type 'beehiiv reveal coupon' or press ↵ to open site..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 font-sans text-sm sm:text-base outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery("");
                  setRevealedNotice(null);
                }}
                className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded">
              ESC
            </kbd>
          </div>

          {/* Instant Coupon Reveal Notification Banner */}
          {revealedNotice && (
            <div className="mx-4 mt-3 p-3 rounded-xl bg-[#C6FF3D]/10 border border-[#C6FF3D]/40 flex items-center justify-between text-xs font-mono text-[#C6FF3D] animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  Code <strong className="text-white bg-black px-1.5 py-0.5 rounded border border-[#C6FF3D]/40">{revealedNotice.code}</strong> copied! Redirecting to {revealedNotice.toolName}...
                </span>
              </div>
              <a
                href={revealedNotice.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-white ml-2 shrink-0 font-bold"
              >
                Open Site ↗
              </a>
            </div>
          )}

          {/* Filter Pills */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/5 bg-[#0A0A0C] text-xs overflow-x-auto">
            <span className="text-zinc-500 font-mono text-[11px] uppercase mr-1">FILTER:</span>
            {(["all", "tools", "deals", "articles", "community"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-full capitalize font-medium transition-all ${
                  filter === tab
                    ? "bg-[#C6FF3D] text-black font-semibold"
                    : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search Results Scroll Area */}
          <div className="max-h-[60vh] overflow-y-auto p-4 space-y-6">
            {/* Top Direct Coupon Reveal & Instant Site Redirection Action */}
            {topCouponDeal && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#C6FF3D]/15 via-[#0F0F14] to-black border border-[#C6FF3D]/40 shadow-[0_0_25px_rgba(198,255,61,0.15)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-black border border-[#C6FF3D]/60 flex flex-col items-center justify-center font-bold text-xs text-[#C6FF3D] shadow-[0_0_15px_rgba(198,255,61,0.25)] shrink-0">
                    <Sparkles className="w-4 h-4 text-[#C6FF3D] mb-0.5" />
                    <span className="text-[10px] leading-none">{topCouponDeal.discountPercentage}%</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#C6FF3D] px-2 py-0.5 rounded bg-[#C6FF3D]/15 border border-[#C6FF3D]/30">
                        COUPON: {topCouponDeal.code || "AUTOMATIC"}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {topCouponDeal.successRate}% Success
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white mt-1">
                      Reveal {topCouponDeal.toolName} Coupon & Go To Official Site
                    </div>
                    <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                      {topCouponDeal.title}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRevealAndRedirect(topCouponDeal)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(198,255,61,0.35)] cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Reveal & Open Site ↗</span>
                </button>
              </div>
            )}

            {/* Tools Section */}
            {(filter === "all" || filter === "tools") && filteredTools.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-white">
                    <Layers className="w-3.5 h-3.5 text-[#C6FF3D]" />
                    Software Tools ({filteredTools.length})
                  </span>
                  <Link
                    href="/tools"
                    onClick={onClose}
                    className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    View All Directory <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {filteredTools.map((tool) => (
                    <Link
                      key={tool.id}
                      href={`/tools/${tool.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.07] hover:border-[#C6FF3D]/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center font-bold text-xs text-[#C6FF3D] group-hover:border-[#C6FF3D]/50">
                          {tool.logoLetter}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[#C6FF3D] transition-colors flex items-center gap-2">
                            <span>{tool.name}</span>
                            {tool.tier === "indie-budget" ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                                INDIE GEM
                              </span>
                            ) : tool.tier === "mid-tier" ? (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                                MID-TIER
                              </span>
                            ) : null}
                          </div>
                          <div className="text-xs text-zinc-400 line-clamp-1 mt-0.5">
                            {tool.tagline}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 text-zinc-300 border border-white/10">
                          ${tool.pricingStart}/mo
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            {/* Deals Section */}
            {(filter === "all" || filter === "deals") && filteredDeals.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-[#C6FF3D]">
                    <Tag className="w-3.5 h-3.5" />
                    Verified Deals ({filteredDeals.length})
                  </span>
                  <Link
                    href="/deals"
                    onClick={onClose}
                    className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    View All Deals <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {filteredDeals.map((deal) => (
                    <div
                      key={deal.id}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.07] hover:border-[#C6FF3D]/40 transition-all"
                    >
                      <Link
                        href={`/deals/${deal.slug}`}
                        onClick={onClose}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center font-bold text-xs text-[#C6FF3D] group-hover:border-[#C6FF3D]/50 shrink-0">
                          {deal.discountPercentage}%
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-white group-hover:text-[#C6FF3D] transition-colors truncate">
                            {deal.toolName} — {deal.title}
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-zinc-500">{deal.category}</span>
                            <span>✦</span>
                            <span className="text-[#C6FF3D]">{deal.successRate}% Success</span>
                            {deal.code && (
                              <>
                                <span>✦</span>
                                <span className="font-mono text-[10px] text-[#C6FF3D] bg-black/60 px-1 rounded border border-[#C6FF3D]/30">
                                  {deal.code}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                      <div className="flex items-center gap-2 shrink-0 ml-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRevealAndRedirect(deal);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-[#C6FF3D] text-black font-mono font-bold text-[11px] hover:bg-[#D6FF66] transition-all flex items-center gap-1 shadow-[0_0_12px_rgba(198,255,61,0.25)] cursor-pointer"
                          title={`Reveal ${deal.code || 'code'} and open official site`}
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>Reveal & Visit ↗</span>
                        </button>
                        <Link
                          href={`/deals/${deal.slug}`}
                          onClick={onClose}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                          title="View Details"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Articles Section */}
            {(filter === "all" || filter === "articles") && filteredArticles.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-white">
                    <FileText className="w-3.5 h-3.5 text-[#7C5CFF]" />
                    In-Depth Articles & Reviews
                  </span>
                  <Link
                    href="/articles"
                    onClick={onClose}
                    className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    View All <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {filteredArticles.map((article) => (
                    <Link
                      key={article.id}
                      href={`/articles/${article.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#C6FF3D] transition-colors">
                          {article.title}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[10px] text-zinc-500">{article.category}</span>
                          <span>✦</span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Community Section */}
            {(filter === "all" || filter === "community") && filteredDiscussions.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-xs font-mono uppercase text-zinc-500 mb-2 px-2">
                  <span className="flex items-center gap-1.5 text-zinc-400">
                    <MessageSquare className="w-3.5 h-3.5 text-[#C6FF3D]" />
                    Community Discussions
                  </span>
                  <Link
                    href="/community"
                    onClick={onClose}
                    className="hover:text-white transition-colors flex items-center gap-1 text-[11px]"
                  >
                    View Forum <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
                <div className="space-y-1.5">
                  {filteredDiscussions.map((disc) => (
                    <Link
                      key={disc.id}
                      href={`/community/${disc.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.07] hover:border-white/20 transition-all"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-[#C6FF3D] transition-colors">
                          {disc.title}
                        </div>
                        <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                          <span className="text-[#C6FF3D] font-mono font-medium">▲ {disc.upvotes} upvotes</span>
                          <span>✦</span>
                          <span>{disc.commentCount} comments</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredDeals.length === 0 && filteredArticles.length === 0 && filteredDiscussions.length === 0 && (
              <div className="py-12 text-center text-zinc-500">
                <Sparkles className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                <p className="text-sm">No matches found for &quot;{query}&quot;</p>
                <p className="text-xs text-zinc-600 mt-1">Try searching for &quot;AI&quot;, &quot;EdgeBase&quot;, or &quot;Lifetime&quot;</p>
              </div>
            )}
          </div>

          {/* Quick Categories Bar in Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/10 bg-[#08080A] text-xs text-zinc-400">
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-zinc-500">POPULAR:</span>
              {CATEGORIES.slice(0, 4).map((c) => (
                <Link
                  key={c.id}
                  href={`/deals?category=${c.slug}`}
                  onClick={onClose}
                  className="px-2 py-0.5 rounded bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-mono text-[10px]"
                >
                  {c.shortCode}
                </Link>
              ))}
            </div>
            <div className="font-mono text-[10px] text-zinc-500">
              PRESS <span className="text-white">↵</span> TO NAVIGATE
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

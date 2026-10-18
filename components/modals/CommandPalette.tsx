"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Search, Tag, FileText, MessageSquare, ExternalLink, X, Sparkles, ArrowRight } from "lucide-react";
import { HOT_DEALS, FEATURED_ARTICLES, TRENDING_DISCUSSIONS, CATEGORIES } from "@/lib/mock-data";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "deals" | "articles" | "community">("all");

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
        } else {
          // handled by parent or window listener
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Filtered results
  const filteredDeals = useMemo(() => {
    if (!query) return HOT_DEALS.slice(0, 3);
    const q = query.toLowerCase();
    return HOT_DEALS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.toolName.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );
  }, [query]);

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search 1,200+ SaaS deals, software tools, reviews & discussions..."
              className="flex-1 bg-transparent text-white placeholder-zinc-500 font-sans text-sm sm:text-base outline-none"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="text-zinc-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-white/5 border border-white/10 rounded">
              ESC
            </kbd>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 px-5 py-2.5 border-b border-white/5 bg-[#0A0A0C] text-xs overflow-x-auto">
            <span className="text-zinc-500 font-mono text-[11px] uppercase mr-1">FILTER:</span>
            {(["all", "deals", "articles", "community"] as const).map((tab) => (
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
                    <Link
                      key={deal.id}
                      href={`/deals/${deal.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.07] hover:border-[#C6FF3D]/40 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-black border border-white/10 flex items-center justify-center font-bold text-xs text-[#C6FF3D] group-hover:border-[#C6FF3D]/50">
                          {deal.discountPercentage}%
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white group-hover:text-[#C6FF3D] transition-colors">
                            {deal.toolName} — {deal.title}
                          </div>
                          <div className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[10px] text-zinc-500">{deal.category}</span>
                            <span>✦</span>
                            <span className="text-[#C6FF3D]">{deal.successRate}% Success Rate</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#C6FF3D]/10 text-[#C6FF3D] border border-[#C6FF3D]/20">
                          {deal.dealType.toUpperCase()}
                        </span>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </Link>
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

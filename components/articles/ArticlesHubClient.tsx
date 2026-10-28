"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen, Search, Clock, ArrowRight } from "lucide-react";
import type { ArticlePreview } from "@/lib/data/articles-data";

const CATEGORIES = [
  "All",
  "Guides & Stacks",
  "Comparisons",
  "Case Studies",
  "Tool Roundups",
];

export function ArticlesHubClient({ articles, savingsLinks }: { articles: ArticlePreview[]; savingsLinks?: React.ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = articles.filter((art) => {
    const matchesCategory =
      selectedCategory === "All" || art.category === selectedCategory;
    const matchesQuery =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesQuery;
  });

  const featuredLead = articles.find((a) => a.featured) || articles[0];
  const listArticles = filteredArticles.filter((a) =>
    selectedCategory === "All" && searchQuery === "" ? a.id !== featuredLead.id : true
  );

  return (
    <div className="min-h-screen bg-[#050505] pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-[#C6FF3D] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> BACK TO DISCOVERY HOME
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <span className="p-1.5 rounded-lg bg-[#C6FF3D]/10 text-[#C6FF3D]">
            <BookOpen className="w-4 h-4" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
            SOURCED SOFTWARE BUYING GUIDES
          </span>
        </div>
        <h1 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-6xl text-white mb-4">
          SAAS EDITORIAL MAGAZINE
        </h1>
        <p className="text-zinc-400 max-w-2xl text-base">
          Original guides to software costs, coupon conditions, trial evaluation and renewal decisions, with references you can inspect.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl font-mono text-xs uppercase tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-[#C6FF3D] text-black font-bold shadow-[0_0_15px_rgba(198,255,61,0.25)]"
                  : "bg-[#09090C] text-zinc-400 hover:text-white border border-white/10 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search articles or tags..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#09090C] border border-white/10 text-white placeholder-zinc-500 focus:outline-none focus:border-[#C6FF3D] font-mono text-xs"
          />
        </div>
      </div>

      {savingsLinks && <div className="my-10">{savingsLinks}</div>}

      {/* Lead Featured Article Card (Shown on default "All" view with empty search) */}
      {selectedCategory === "All" && searchQuery === "" && featuredLead && (
        <div className="mb-12">
          <Link
            href={`/articles/${featuredLead.slug}`}
            className="group block p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#0F140A] via-[#090C06] to-[#0A0A0E] border-2 border-[#C6FF3D]/40 hover:border-[#C6FF3D] transition-all relative overflow-hidden shadow-[0_0_35px_rgba(198,255,61,0.06)]"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#C6FF3D]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-3xl">
              <div className="flex items-center gap-3 mb-4 font-mono text-xs">
                <span className="px-3 py-1 rounded-full bg-[#C6FF3D] text-black font-bold uppercase tracking-wider">
                  FEATURED DEEP DIVE
                </span>
                <span className="text-[#C6FF3D] font-bold">
                  {featuredLead.category}
                </span>
                <span className="text-zinc-600">✦</span>
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {featuredLead.readTime}
                </span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-4xl text-white group-hover:text-[#C6FF3D] transition-colors mb-4 leading-tight">
                {featuredLead.title}
              </h2>

              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed mb-6">
                {featuredLead.summary}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-8">
                {featuredLead.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 rounded-md bg-black/40 border border-white/10 font-mono text-[11px] text-zinc-300"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/10 font-mono text-xs text-zinc-400">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#C6FF3D] text-black font-display font-bold flex items-center justify-center">
                    {featuredLead.author.avatarLetter}
                  </div>
                  <span>{featuredLead.author.name}</span>
                </div>

                <span className="text-[#C6FF3D] font-bold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform">
                  Read In-Depth Analysis <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listArticles.map((article) => (
          <Link
            key={article.id}
            href={`/articles/${article.slug}`}
            className="group p-6 sm:p-8 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#0D0D10] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-4 font-mono text-xs text-zinc-500">
                <span className="text-[#C6FF3D] font-bold">{article.category}</span>
                <span>✦</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.readTime}
                </span>
              </div>

              <h2 className="font-display font-bold text-xl text-white group-hover:text-[#C6FF3D] transition-colors mb-3 leading-snug">
                {article.title}
              </h2>

              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed mb-6 line-clamp-3">
                {article.summary}
              </p>
            </div>

            <div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded bg-white/5 font-mono text-[10px] text-zinc-400"
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
                <span>By {article.author.name}</span>
                <span className="text-[#C6FF3D] font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Read Story <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 bg-[#09090C]">
          <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-white mb-1">
            No matching articles found
          </h3>
          <p className="text-zinc-500 text-xs font-mono mb-4">
            Try adjusting your search query or switching categories.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("All");
              setSearchQuery("");
            }}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

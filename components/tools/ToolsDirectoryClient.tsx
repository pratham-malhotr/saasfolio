"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, Star, ArrowRight, X, GitCompare } from "lucide-react";
import { DetailedTool } from "@/lib/types";
import { CATEGORIES } from "@/lib/mock-data";
import { TiltCard } from "@/components/animations/TiltCard";

interface ToolsDirectoryClientProps {
  initialTools: DetailedTool[];
  comparisonLinks: Record<string, string>;
}

export function ToolsDirectoryClient({ initialTools, comparisonLinks }: ToolsDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [pricingModel, setPricingModel] = useState("all");
  const [selectedTier, setSelectedTier] = useState("all");

  const filteredTools = useMemo(() => {
    return initialTools.filter((tool) => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchName = tool.name.toLowerCase().includes(q);
        const matchTag = tool.tagline.toLowerCase().includes(q);
        const matchDesc = tool.description.toLowerCase().includes(q);
        if (!matchName && !matchTag && !matchDesc) return false;
      }

      if (selectedCategory !== "all") {
        if (tool.categorySlug !== selectedCategory) return false;
      }

      if (pricingModel !== "all") {
        if (tool.pricingModel !== pricingModel) return false;
      }

      if (selectedTier !== "all") {
        const toolTier = tool.tier || "popular";
        if (toolTier !== selectedTier) return false;
      }

      return true;
    });
  }, [initialTools, searchQuery, selectedCategory, pricingModel, selectedTier]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24">
      {/* Page Header */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
          <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
            CURATED SOFTWARE ARCHIVE // {filteredTools.length} PROFILES
          </span>
        </div>
        <h1 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-6xl text-white mb-4">
          SAAS DIRECTORY
        </h1>
        <p className="text-zinc-400 max-w-2xl text-base leading-relaxed">
          Browse vetted software tools categorized by architecture, pricing model, tier, and user reviews. Compare specs, discover budget indie gems, and uncover active discounts.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-8 p-3 rounded-2xl bg-[#09090C] border border-white/10">
        <div className="flex items-center gap-3 px-3 py-2 flex-1">
          <Search className="w-4 h-4 text-[#C6FF3D]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search software products, keywords, features..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-500 outline-none font-sans"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="text-zinc-500 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-white/5 text-xs font-mono">
          <select
            value={selectedTier}
            onChange={(e) => setSelectedTier(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0C]">All Brand Tiers</option>
            <option value="popular" className="bg-[#0A0A0C]">⭐ Popular Leaders</option>
            <option value="mid-tier" className="bg-[#0A0A0C]">⚡ Mid-Tier Powerhouses</option>
            <option value="indie-budget" className="bg-[#0A0A0C]">🌱 Indie & Budget Gems</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0C]">All Verticals</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.slug} className="bg-[#0A0A0C]">
                {cat.name}
              </option>
            ))}
          </select>

          <select
            value={pricingModel}
            onChange={(e) => setPricingModel(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white outline-none cursor-pointer"
          >
            <option value="all" className="bg-[#0A0A0C]">All Pricing Models</option>
            <option value="Open Source" className="bg-[#0A0A0C]">Open Source</option>
            <option value="Freemium" className="bg-[#0A0A0C]">Freemium</option>
            <option value="Free Trial" className="bg-[#0A0A0C]">Free Trial</option>
            <option value="Paid" className="bg-[#0A0A0C]">Paid Only</option>
          </select>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map((tool) => (
          <TiltCard
            key={tool.id}
            cursorLabel="TOOL"
            className="flex flex-col justify-between p-6 bg-[#09090C] border-white/10 hover:border-[#C6FF3D]/50 transition-all duration-300"
          >
            <div>
              {/* Header: Logo + Rating */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center font-display font-black text-sm text-[#C6FF3D]">
                  {tool.logoLetter}
                </div>
                <div className="flex items-center gap-2">
                  {tool.tier === "indie-budget" ? (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
                      🌱 INDIE GEM
                    </span>
                  ) : tool.tier === "mid-tier" ? (
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold">
                      ⚡ MID-TIER
                    </span>
                  ) : null}
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10 text-zinc-300">
                    {tool.pricingModel}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs text-[#C6FF3D] font-bold">
                    <Star className="w-3.5 h-3.5 fill-[#C6FF3D]" />
                    <span>{tool.reviewCount ? tool.rating : "Unrated"}</span>
                  </div>
                </div>
              </div>

              {/* Tool Name & Category */}
              <div className="font-mono text-[10px] uppercase text-zinc-500 mb-1">
                {tool.category}
              </div>
              <Link href={`/tools/${tool.slug}`}>
                <h3 className="font-display font-bold text-xl text-white group-hover:text-[#C6FF3D] transition-colors mb-2">
                  {tool.name}
                </h3>
              </Link>
              <p className="text-xs text-zinc-400 line-clamp-2 mb-4 leading-relaxed">
                {tool.tagline}
              </p>

              {/* Features List */}
              <div className="space-y-1 mb-6">
                {tool.keyFeatures.slice(0, 2).map((feat, i) => (
                  <div key={i} className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono">
                    <span className="text-[#C6FF3D]">✦</span>
                    <span className="line-clamp-1">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-400">
                {tool.pricingVerified ? <>Starts at <strong className="text-white">${tool.pricingStart}</strong>/mo</> : "See official pricing"}
              </span>

              <div className="flex items-center gap-2">
                {tool.alternatives[0] && (
                  <Link
                    href={comparisonLinks[tool.slug] || "/compare"}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                    title={`Compare ${tool.name} vs ${tool.alternatives[0].name}`}
                  >
                    <GitCompare className="w-3.5 h-3.5" />
                  </Link>
                )}

                <Link
                  href={`/tools/${tool.slug}`}
                  className="px-3.5 py-1.5 rounded-lg bg-[#C6FF3D] text-black font-bold uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-1"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}

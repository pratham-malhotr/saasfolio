"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Users, Code2, Palette, BarChart3, Server, CreditCard, CheckSquare, ShieldCheck, ShoppingBag, Layers } from "lucide-react";
import type { Category } from "@/lib/mock-data";
import { Reveal } from "@/components/animations/Reveal";

// Helper icon resolver
function getCategoryIcon(name: string) {
  switch (name) {
    case "Sparkles": return <Sparkles className="w-5 h-5" />;
    case "TrendingUp": return <TrendingUp className="w-5 h-5" />;
    case "Users": return <Users className="w-5 h-5" />;
    case "Code2": return <Code2 className="w-5 h-5" />;
    case "Palette": return <Palette className="w-5 h-5" />;
    case "BarChart3": return <BarChart3 className="w-5 h-5" />;
    case "Server": return <Server className="w-5 h-5" />;
    case "CreditCard": return <CreditCard className="w-5 h-5" />;
    case "CheckSquare": return <CheckSquare className="w-5 h-5" />;
    case "ShieldCheck": return <ShieldCheck className="w-5 h-5" />;
    case "ShoppingBag": return <ShoppingBag className="w-5 h-5" />;
    default: return <Layers className="w-5 h-5" />;
  }
}

export function CategoryMatrix({ categories }: { categories: Category[] }) {
  return (
    <section className="home-deferred py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
                EXPLORE BY VERTICAL // 12 DOMAINS
              </span>
            </div>
            <h2 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-5xl lg:text-6xl text-white">
              SOFTWARE CATEGORIES
            </h2>
          </div>

          <p className="max-w-md text-sm text-zinc-400 font-sans leading-relaxed">
            Explore software brands, sourced offers, free trials, and official pricing links by category.
          </p>
        </div>

        {/* 12 Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat, idx) => (
            <Reveal key={cat.id} delay={idx * 0.05} direction="up">
              <Link
                href={`/deals/category/${cat.slug}`}
                className="group relative flex flex-col justify-between p-6 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#0E0E12] transition-all duration-300 h-full"
              >
                <div>
                  {/* Top Bar: Icon + Shortcode */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center text-zinc-300 group-hover:text-[#C6FF3D] group-hover:border-[#C6FF3D]/40 transition-all">
                      {getCategoryIcon(cat.iconName)}
                    </div>
                    <span className="font-mono text-xs font-black tracking-widest px-2.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-400 group-hover:text-[#C6FF3D] group-hover:border-[#C6FF3D]/30 transition-colors">
                      {cat.shortCode}
                    </span>
                  </div>

                  {/* Title & Count */}
                  <h3 className="font-display font-bold text-xl text-white group-hover:text-[#C6FF3D] transition-colors mb-2">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mb-4 line-clamp-2">
                    {cat.description}
                  </p>

                  {/* Popular Tools Pills */}
                  <div className="space-y-1.5 mb-6">
                    <div className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                      FEATURED TOOLS:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.popularTools.map((tool) => (
                        <span
                          key={tool}
                          className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/60 border border-white/5 text-zinc-300"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom Action Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-xs font-mono">
                  <span className="text-zinc-500 group-hover:text-zinc-300 transition-colors">
                    {cat.dealCount} Active Deals
                  </span>
                  <div className="flex items-center gap-1 text-[#C6FF3D] font-bold group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

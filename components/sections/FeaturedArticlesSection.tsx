"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Tag, ExternalLink } from "lucide-react";
import { FEATURED_ARTICLES } from "@/lib/mock-data";
import { Reveal } from "@/components/animations/Reveal";
import { TiltCard } from "@/components/animations/TiltCard";

export function FeaturedArticlesSection() {
  const [heroArticle, ...secondaryArticles] = FEATURED_ARTICLES;

  return (
    <section className="py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
                EDITORIAL & REVIEWS // HANDS-ON
              </span>
            </div>
            <h2 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-5xl lg:text-6xl text-white">
              LATEST ARTICLES & COMPARISONS
            </h2>
          </div>

          <Link
            href="/articles"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C6FF3D] hover:underline uppercase font-mono tracking-wider"
          >
            All Editorial Guides <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Editorial Layout: Large Hero Card + Secondary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Hero Article Card (7 columns) */}
          {heroArticle && (
            <div className="lg:col-span-7">
              <Reveal delay={0.1} direction="up" className="h-full">
                <Link href={`/articles/${heroArticle.slug}`} className="block h-full group">
                  <TiltCard
                    cursorLabel="READ"
                    className="h-full p-8 sm:p-10 flex flex-col justify-between bg-[#0A0A0D] border-white/10 hover:border-[#C6FF3D]/50 transition-all duration-300"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-3 mb-6">
                        <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#C6FF3D] text-black font-black uppercase tracking-wider">
                          FEATURED STORY
                        </span>
                        <span className="font-mono text-xs text-zinc-400 bg-white/5 px-2.5 py-1 rounded border border-white/10">
                          {heroArticle.category}
                        </span>
                        <span className="font-mono text-xs text-zinc-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {heroArticle.readTime}
                        </span>
                      </div>

                      {/* Main Title */}
                      <h3 className="font-display font-black text-2xl sm:text-4xl text-white group-hover:text-[#C6FF3D] transition-colors leading-[1.15] mb-4">
                        {heroArticle.title}
                      </h3>

                      {/* Summary */}
                      <p className="text-sm sm:text-base text-zinc-400 font-sans leading-relaxed mb-8 max-w-xl">
                        {heroArticle.summary}
                      </p>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-8">
                        {heroArticle.tags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-zinc-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Author & Read Action */}
                    <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/20 flex items-center justify-center font-bold text-sm text-[#C6FF3D]">
                          {heroArticle.author.avatarLetter}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {heroArticle.author.name}
                          </div>
                          <div className="text-xs text-zinc-500 font-mono">
                            {heroArticle.author.role} ✦ {heroArticle.publishedAt}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[#C6FF3D] font-mono text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                        <span>Read Review</span>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </TiltCard>
                </Link>
              </Reveal>
            </div>
          )}

          {/* Secondary Stack (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-6">
            {secondaryArticles.map((article, idx) => (
              <Reveal key={article.id} delay={0.2 + idx * 0.1} direction="up">
                <Link href={`/articles/${article.slug}`} className="block group">
                  <div className="p-6 rounded-2xl bg-[#08080A] border border-white/10 hover:border-[#C6FF3D]/40 hover:bg-[#0D0D10] transition-all duration-300">
                    <div className="flex items-center gap-3 mb-2 font-mono text-xs text-zinc-500">
                      <span className="text-[#C6FF3D] font-bold">{article.category}</span>
                      <span>✦</span>
                      <span>{article.readTime}</span>
                      <span>✦</span>
                      <span>{article.publishedAt}</span>
                    </div>

                    <h4 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#C6FF3D] transition-colors leading-snug mb-2">
                      {article.title}
                    </h4>

                    <p className="text-xs text-zinc-400 font-sans line-clamp-2 mb-4 leading-relaxed">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                      <span>By {article.author.name}</span>
                      <span className="text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors">
                        Read Story <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowRight, MessageSquare, Users } from "lucide-react";
import { TRENDING_DISCUSSIONS } from "@/lib/mock-data";
import { Reveal } from "@/components/animations/Reveal";

export function CommunityTrendingSection() {
  const [upvotedIds, setUpvotedIds] = useState<Record<string, boolean>>({});
  const [counts, setCounts] = useState<Record<string, number>>(() =>
    TRENDING_DISCUSSIONS.reduce((acc, curr) => {
      acc[curr.id] = curr.upvotes;
      return acc;
    }, {} as Record<string, number>)
  );

  const toggleUpvote = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    const isUpvoted = upvotedIds[id];
    setUpvotedIds((prev) => ({ ...prev, [id]: !isUpvoted }));
    setCounts((prev) => ({
      ...prev,
      [id]: isUpvoted ? prev[id] - 1 : prev[id] + 1,
    }));
  };

  return (
    <section className="home-deferred py-24 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#C6FF3D] animate-ping" />
              <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
                COMMUNITY DEBATES & Q&A // LIVE
              </span>
            </div>
            <h2 className="font-display font-black tracking-tighter uppercase text-4xl sm:text-5xl lg:text-6xl text-white">
              SOFTWARE BUYING QUESTIONS
            </h2>
          </div>

          <Link
            href="/community"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C6FF3D] hover:underline uppercase font-mono tracking-wider"
          >
            Open Community Forum <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Discussions List */}
        <div className="space-y-4">
          {TRENDING_DISCUSSIONS.map((thread, idx) => {
            const isUpvoted = upvotedIds[thread.id];
            const upvoteCount = counts[thread.id];

            return (
              <Reveal key={thread.id} delay={idx * 0.08} direction="up">
                <Link
                  href={`/community/${thread.slug}`}
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-[#08080A] border border-white/10 hover:border-[#C6FF3D]/50 hover:bg-[#0D0D10] transition-all duration-300"
                >
                  {/* Left: Upvote button + Title + Snippet */}
                  <div className="flex items-start gap-5">
                    {/* Interactive Upvote Box */}
                    <button
                      onClick={(e) => toggleUpvote(e, thread.id)}
                      className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 px-2 rounded-xl border transition-all cursor-pointer ${
                        isUpvoted
                          ? "bg-[#C6FF3D] text-black border-[#C6FF3D] shadow-[0_0_15px_rgba(198,255,61,0.4)]"
                          : "bg-white/[0.03] text-zinc-300 border-white/10 hover:border-white/30 hover:bg-white/[0.08]"
                      }`}
                      aria-label="Upvote thread"
                    >
                      <span className="text-xs font-bold">▲</span>
                      <span className="font-mono text-xs font-black tracking-tight">
                        {upvoteCount}
                      </span>
                    </button>

                    <div>
                      {/* Meta: Author + Time + Tag */}
                      <div className="flex flex-wrap items-center gap-2 mb-2 font-mono text-xs text-zinc-500">
                        <span className="text-zinc-300 font-semibold">
                          @{thread.author.username}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-white/5 text-[#C6FF3D] border border-white/10 text-[10px]">
                          {thread.author.badge}
                        </span>
                        <span>✦</span>
                        <span>{thread.createdAt}</span>
                        <span>✦</span>
                        <span className="text-zinc-400">{thread.category}</span>
                      </div>

                      {/* Title */}
                      <h3 className="font-display font-bold text-lg sm:text-xl text-white group-hover:text-[#C6FF3D] transition-colors leading-snug mb-2">
                        {thread.title}
                      </h3>

                      {/* Snippet */}
                      <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed line-clamp-1 max-w-3xl mb-3">
                        {thread.contentSnippet}
                      </p>

                      {/* Tool Mention Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        {thread.toolTags.map((tag) => (
                          <span
                            key={tag}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-black/60 border border-white/5 text-[#C6FF3D]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right: Comments count & Arrow */}
                  <div className="flex items-center gap-6 self-end md:self-center font-mono text-xs text-zinc-400">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                      <span>{thread.commentCount} replies</span>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:text-black group-hover:bg-[#C6FF3D] transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>

        {/* Start a Discussion CTA Box */}
        <Reveal delay={0.3} direction="up" className="mt-10">
          <div className="p-6 rounded-2xl bg-gradient-to-r from-white/[0.03] to-white/[0.01] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[#C6FF3D]" />
              <div>
                <h4 className="text-sm font-bold text-white">Have a question about a software tool?</h4>
                <p className="text-xs text-zinc-400">Browse editorial prompts. Discussion drafts remain in your browser.</p>
              </div>
            </div>
            <Link
              href="/community"
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-[#C6FF3D] hover:text-black text-white font-mono text-xs font-bold uppercase tracking-wider transition-all"
            >
              Start a Discussion →
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

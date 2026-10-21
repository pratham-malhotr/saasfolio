"use client";

import React from "react";
import { Reveal } from "@/components/animations/Reveal";

export function StatsCounters({ toolCount, offerCount, couponCount, categoryCount }: { toolCount: number; offerCount: number; couponCount: number; categoryCount: number }) {
  const stats = [
    { value: toolCount, decimals: 0, prefix: "", suffix: "", label: "SOFTWARE PROFILES", detail: "Products available in the software directory" },
    { value: offerCount, decimals: 0, prefix: "", suffix: "", label: "SOURCED OFFERS", detail: "Includes free plans, trials, and recorded promotions" },
    { value: couponCount, decimals: 0, prefix: "", suffix: "", label: "RECORDED COUPON CODES", detail: "Source checked; acceptance is not checkout tested" },
    { value: categoryCount, decimals: 0, prefix: "", suffix: "", label: "SOFTWARE CATEGORIES", detail: "Browse tools by the work you need to do" },
  ];

  return (
    <section className="py-20 bg-[#050505] border-b border-white/10 relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => (
            <Reveal key={stat.label} delay={idx * 0.1} direction="up">
              <div className="group relative p-6 sm:p-8 rounded-2xl bg-[#09090C] border border-white/10 hover:border-[#C6FF3D]/40 transition-all duration-300">
                {/* Subtle corner badge */}
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-widest">
                    METRIC // 0{idx + 1}
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C6FF3D]/60 group-hover:bg-[#C6FF3D] group-hover:shadow-[0_0_8px_#C6FF3D] transition-all" />
                </div>

                {/* Animated Count */}
                <div className="font-display font-black text-4xl sm:text-5xl lg:text-6xl text-white tracking-tighter mb-2 group-hover:text-[#C6FF3D] transition-colors">
                  {stat.value.toLocaleString("en-US")}
                </div>

                {/* Metric Title */}
                <div className="font-mono text-xs uppercase tracking-wider text-zinc-300 font-bold mb-1.5">
                  {stat.label}
                </div>

                {/* Context Subtitle */}
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  {stat.detail}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

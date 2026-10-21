"use client";

import React from "react";
import { Marquee } from "@/components/animations/Marquee";

export function MarqueeTickerBand() {
  const tickerItems1 = [
    "VERIFIED COUPONS",
    "LIFETIME DEALS",
    "ARCHITECTURAL REVIEWS",
    "SAAS COMPARISONS",
    "COMMUNITY FORUM",
    "FOUNDER TECH STACKS",
    "SOURCED SOFTWARE OFFERS",
    "ZERO CLICKBAIT",
  ];

  const tickerItems2 = [
    "CLAUDE & OPENAI STACKS",
    "SERVERLESS DATABASES",
    "COGNITIVE WORKFLOWS",
    "SOC2 COMPLIANCE",
    "COOKIELESS ANALYTICS",
    "OMNICHANNEL MARKETING",
    "SUB-10MS EDGE LATENCY",
    "DEVELOPER INFRASTRUCTURE",
  ];

  return (
    <section className="relative py-6 bg-black border-y border-white/10 overflow-hidden select-none">
      {/* Top Tape (Left) */}
      <div className="py-2.5 bg-[#C6FF3D] text-black font-display font-black tracking-tighter text-sm sm:text-base uppercase">
        <Marquee direction="left" speed={28} pauseOnHover={true}>
          {tickerItems1.map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 px-3">
              <span>{item}</span>
              <span className="font-mono text-xs opacity-75">✦</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Bottom Tape (Right) */}
      <div className="py-2.5 bg-[#0C0C0E] border-t border-black text-white font-mono font-bold tracking-widest text-xs uppercase">
        <Marquee direction="right" speed={32} pauseOnHover={true}>
          {tickerItems2.map((item, idx) => (
            <div key={idx} className="flex items-center gap-6 px-3 text-zinc-300">
              <span className="hover:text-[#C6FF3D] transition-colors">{item}</span>
              <span className="text-[#C6FF3D]">×</span>
            </div>
          ))}
        </Marquee>
      </div>
    </section>
  );
}

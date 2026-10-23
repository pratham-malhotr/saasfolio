"use client";

import React from "react";
import { Marquee } from "@/components/animations/Marquee";
import { SAAS_LOGOS } from "@/lib/mock-data";

export function LogoMarqueeSection() {
  return (
    <section className="py-16 bg-[#040406] border-b border-white/10 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 mb-8 text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-zinc-500 font-semibold">
          DISCOVER MORE SOFTWARE
        </span>
      </div>

      <Marquee direction="left" speed={30} pauseOnHover={true}>
        {SAAS_LOGOS.map((tool, idx) => (
          <div
            key={idx}
            className="flex items-center gap-3 px-6 py-3 mx-2 rounded-xl bg-white/[0.02] border border-white/5 hover:border-[#C6FF3D]/40 hover:bg-white/[0.06] transition-all duration-300 group cursor-pointer"
          >
            {/* Custom Monogram Badge */}
            <div className="w-8 h-8 rounded-lg bg-black border border-white/10 flex items-center justify-center font-display font-black text-xs text-zinc-400 group-hover:text-[#C6FF3D] group-hover:border-[#C6FF3D]/40 transition-colors">
              {tool.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">
                {tool.name}
              </div>
              <div className="font-mono text-[10px] text-zinc-500 group-hover:text-[#C6FF3D] transition-colors">
                {tool.label}
              </div>
            </div>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, ShieldCheck, ExternalLink } from "lucide-react";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getDealBySlug, DEALS_DATA } from "@/lib/data/deals-data";

import { SafeStorage } from "@/lib/storage";

export function RedirectClient({ id }: { id: string }) {
  const [countdown, setCountdown] = useState(2);
  const [targetUrl, setTargetUrl] = useState("https://saasfolio.tech/deals");
  const [toolName, setToolName] = useState("Partner Tool");
  const [discount, setDiscount] = useState("Exclusive Discount");
  const [toolSlug, setToolSlug] = useState("");

  useEffect(() => {
    if (!id) return;

    const deal = getDealBySlug(id) || DEALS_DATA.find((d) => d.toolSlug === id);
    const tool = getToolBySlug(id);

    const name = tool?.name || deal?.toolName || id.replace(/-/g, " ").toUpperCase();
    const dest = tool?.website || (deal?.toolSlug ? `/tools/${deal.toolSlug}` : "https://saasfolio.tech/deals");
    const disc = deal ? `${deal.discountPercentage}% OFF` : "Verified Deal";

    setToolName(name);
    setTargetUrl(dest);
    setDiscount(disc);
    if (tool?.slug) setToolSlug(tool.slug);

    // Click telemetry with SafeStorage circuit breaker
    const existingLogs = SafeStorage.get<any[]>("saasfolio_clicks", []);
    SafeStorage.set("saasfolio_clicks", [
      {
        id,
        toolName: name,
        timestamp: new Date().toISOString(),
        referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
      },
      ...existingLogs.slice(0, 99),
    ]);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = dest;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [id]);

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 text-center">
      <div className="absolute w-[450px] h-[450px] rounded-full bg-[#C6FF3D]/10 blur-[130px] pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-[#09090C] border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_25px_rgba(198,255,61,0.15)]">
        <div className="relative flex items-center justify-center w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-2xl border border-[#C6FF3D] animate-ping opacity-35" />
          <div className="w-14 h-14 rounded-2xl bg-black border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(198,255,61,0.3)]">
            <Sparkles className="w-7 h-7 text-[#C6FF3D]" />
          </div>
        </div>

        <div className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold mb-2">
          APPLYING VERIFIED PROMO RATE ✦
        </div>

        <h1 className="font-display font-black text-2xl sm:text-3xl text-white uppercase mb-2">
          REDIRECTING TO {toolName}
        </h1>

        <div className="inline-block px-3 py-1 rounded-full bg-[#C6FF3D]/10 border border-[#C6FF3D]/30 font-mono text-xs text-[#C6FF3D] font-bold mb-6">
          {discount} AUTO-TAGGED
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed mb-6">
          We are securing your exclusive partner rate and transferring you directly to the official vendor checkout in{" "}
          <span className="font-mono text-white font-bold">{countdown}s</span>...
        </p>

        <div className="space-y-3 mb-6">
          <a
            href={targetUrl}
            className="w-full py-3.5 px-6 rounded-xl bg-[#C6FF3D] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(198,255,61,0.3)]"
          >
            <span>Continue Immediately</span>
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
          </a>

          {toolSlug && (
            <a
              href={`/tools/${toolSlug}`}
              className="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 font-mono text-xs uppercase tracking-wider transition-all block"
            >
              View Full Profile on SaaSFolio
            </a>
          )}
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-center gap-1.5 font-mono text-[10px] text-zinc-500 uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF3D]" />
          <span>Verified Safe Outbound Redirect</span>
        </div>
      </div>
    </div>
  );
}

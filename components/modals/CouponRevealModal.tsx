"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import { Copy, Check, ExternalLink, ThumbsUp, ThumbsDown, X, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { SaaSDeal } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";

interface CouponRevealModalProps {
  deal: SaaSDeal | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CouponRevealModal({ deal, isOpen, onClose }: CouponRevealModalProps) {
  const [copied, setCopied] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [voted, setVoted] = useState<"up" | "down" | null>(null);

  if (!isOpen || !deal) return null;

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#C6FF3D", "#FFFFFF", "#7C5CFF", "#111111"],
      disableForReducedMotion: true,
    });
  };

  const handleRevealAndCopy = () => {
    setRevealed(true);
    triggerConfetti();

    if (deal.code) {
      try {
        navigator.clipboard.writeText(deal.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } catch {
        // Fallback for non-secure contexts
      }
    }

    // Seamlessly open the official vendor checkout in a new window with discount activated
    if (deal.affiliateUrl && typeof window !== "undefined") {
      window.open(deal.affiliateUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleVote = (type: "up" | "down") => {
    if (voted) return;
    setVoted(type);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={onClose} />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-lg rounded-2xl border border-white/20 bg-[#0C0C0E] p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_30px_rgba(198,255,61,0.15)] z-10"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-black border border-white/15 flex items-center justify-center font-bold text-base text-[#C6FF3D] shadow-[0_0_15px_rgba(198,255,61,0.2)]">
              {deal.discountPercentage}%
            </div>
            <div>
              <span className="font-mono text-[11px] uppercase tracking-wider text-zinc-400">
                {deal.toolName} ✦ {deal.category}
              </span>
              <h3 className="text-xl font-bold text-white leading-snug">{deal.title}</h3>
            </div>
          </div>

          <p className="text-sm text-zinc-300 mb-6 leading-relaxed">
            {deal.description}
          </p>

          {/* Reveal Code Box */}
          <div className="relative mb-6 rounded-xl border border-dashed border-[#C6FF3D]/40 bg-black/60 p-4 text-center">
            <div className="font-mono text-xs uppercase tracking-widest text-zinc-400 mb-2">
              EXCLUSIVE DISCOUNT COUPON CODE
            </div>

            {revealed ? (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <div className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#141416] border border-[#C6FF3D] font-mono text-xl font-black tracking-widest text-[#C6FF3D] shadow-[0_0_20px_rgba(198,255,61,0.25)] select-all">
                  {deal.code || "AUTOMATIC_DISCOUNT"}
                </div>
                <button
                  onClick={handleRevealAndCopy}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-[#C6FF3D] text-black font-bold text-sm hover:bg-[#D6FF66] transition-all shadow-[0_0_20px_rgba(198,255,61,0.4)]"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy Code
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="filter blur-md select-none font-mono text-2xl font-bold tracking-widest text-zinc-400">
                  ••••••••••••
                </div>
                <button
                  onClick={handleRevealAndCopy}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#C6FF3D] text-black font-bold text-base hover:bg-[#D6FF66] transition-all shadow-[0_0_25px_rgba(198,255,61,0.4)] cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  Reveal Code & Copy to Clipboard
                </button>
              </div>
            )}

            {copied && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-xs font-medium text-[#C6FF3D] flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" /> Coupon copied! Ready to paste at checkout.
              </motion.div>
            )}
          </div>

          {/* Social Proof & Guarantee */}
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-6 px-1">
            <span className="flex items-center gap-1.5 text-zinc-300">
              <ShieldCheck className="w-4 h-4 text-[#C6FF3D]" />
              {deal.successRate}% Success Rate ({deal.revealsCount} reveals)
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              Verified {deal.verifiedAt}
            </span>
          </div>

          {/* Did it work voting widget */}
          <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between mb-6">
            <span className="text-xs text-zinc-300 font-medium">Did this discount work?</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleVote("up")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  voted === "up"
                    ? "bg-[#C6FF3D] text-black font-bold"
                    : "bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes ({deal.successRate}%)</span>
              </button>
              <button
                onClick={() => handleVote("down")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                  voted === "down"
                    ? "bg-red-500/20 text-red-300 border border-red-500/30"
                    : "bg-white/5 text-zinc-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>No</span>
              </button>
            </div>
          </div>

          {/* Action Button: Direct to Deal Partner */}
          <a
            href={deal.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white/10 text-white font-semibold text-sm hover:bg-white/15 border border-white/15 transition-all group"
          >
            <span>Visit {deal.toolName} Checkout</span>
            <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>

          <p className="font-mono text-[10px] text-center text-zinc-500 uppercase mt-4">
            Affiliate Disclosure: SaaSFolio may earn a verified commission on eligible plans.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

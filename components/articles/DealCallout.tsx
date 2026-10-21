"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Tag, Sparkles, Copy, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { getDealBySlug } from "@/lib/data/deals-data";
import { offerStatus } from "@/lib/offer-links";
import { CouponRevealModal } from "@/components/modals/CouponRevealModal";

interface DealCalloutProps {
  dealSlug: string;
}

export function DealCallout({ dealSlug }: DealCalloutProps) {
  const deal = getDealBySlug(dealSlug);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!deal) return null;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (deal.code) {
      navigator.clipboard.writeText(deal.code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(() => setCopied(false));
    }
  };

  return (
    <>
      <div className="my-8 p-6 rounded-2xl bg-gradient-to-br from-[#0F140A] via-[#090C06] to-[#0A0A0E] border-2 border-[#C6FF3D]/40 shadow-[0_0_30px_rgba(198,255,61,0.08)] relative overflow-hidden">
        {/* Glow corner */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#C6FF3D]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#C6FF3D]/10 text-[#C6FF3D]">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D] font-bold">
              CURRENT PROVIDER OFFER
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C6FF3D]" />
            <span>{offerStatus(deal)}</span>
          </div>
        </div>

        <div className="relative z-10">
          <h4 className="font-display font-bold text-xl sm:text-2xl text-white mb-2">
            {deal.title}
          </h4>
          <p className="text-zinc-300 text-sm mb-6 max-w-xl">
            {deal.description}
          </p>

          <div className="flex flex-wrap items-center gap-3">
            {deal.code ? (
              <button
                onClick={() => setModalOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2 shadow-[0_0_15px_rgba(198,255,61,0.2)]"
              >
                <Tag className="w-3.5 h-3.5" />
                Reveal Coupon Code
              </button>
            ) : (
              <Link
                href={`/go/${deal.slug}`}
                rel="sponsored nofollow noopener noreferrer"
                target="_blank"
                className="px-5 py-2.5 rounded-xl bg-[#C6FF3D] text-black font-display font-bold text-xs uppercase tracking-wider hover:bg-[#D6FF66] transition-all flex items-center gap-2"
              >
                View Provider Offer <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {deal.code && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-zinc-300">
                <span className="text-zinc-500">CODE:</span>
                <span className="text-[#C6FF3D] font-bold tracking-wider">{deal.code}</span>
                <button
                  onClick={handleCopy}
                  className="p-1 hover:text-[#C6FF3D] transition-colors ml-1"
                  title="Copy code"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#C6FF3D]" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            <Link
              href={`/deals/${deal.slug}`}
              className="text-xs font-mono text-zinc-400 hover:text-white transition-colors ml-auto flex items-center gap-1"
            >
              View Full Deal Details <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      <CouponRevealModal
        deal={deal}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}

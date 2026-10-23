"use client";

import { X, ExternalLink } from "lucide-react";
import type { SaaSDeal } from "@/lib/types";
import { useDialog } from "@/components/modals/useDialog";
import { CouponCode } from "@/components/deals/CouponCode";
import { getOfferHref, offerActionLabel, offerLabel, offerStatus } from "@/lib/offer-links";
import { OfferReportLink } from "@/components/deals/OfferReportLink";

export function CouponRevealModal({ deal, isOpen, onClose }: { deal: SaaSDeal | null; isOpen: boolean; onClose: () => void }) {
  const dialogRef = useDialog(isOpen && Boolean(deal), onClose);
  if (!isOpen || !deal) return null;
  return <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
    <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label={`${deal.toolName} offer details`} tabIndex={-1} className="relative z-10 max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/20 bg-[#0C0C0E] p-6 shadow-2xl sm:p-8 space-y-5">
      <button type="button" onClick={onClose} aria-label="Close offer details" className="absolute right-4 top-4 rounded-lg bg-white/5 p-2 text-zinc-300 hover:text-white"><X className="h-5 w-5" /></button>
      <div className="pr-9 space-y-3">
        <span className="inline-block rounded-lg bg-[#C6FF3D]/10 px-3 py-1 font-mono text-xs text-[#C6FF3D]">{offerLabel(deal)}</span>
        <p className="text-xs text-zinc-400">{deal.toolName} · {deal.category}</p>
        <h2 className="font-display text-xl font-bold text-white">{deal.title}</h2>
      </div>
      {deal.code ? <CouponCode key={`${deal.slug}:${deal.code}`} code={deal.code} /> : <p className="text-sm text-zinc-300">{deal.dealType === "pricing" ? "This is a pricing link. No coupon or paid-plan discount is recorded." : "No coupon code is recorded for this option. Review the provider’s signup and eligibility terms."}</p>}
      <p className="text-sm leading-relaxed text-zinc-300">{deal.terms}</p>
      <p className="text-xs text-zinc-400">{offerStatus(deal)}.{deal.checkedAt && <> Source checked <time dateTime={deal.checkedAt}>{deal.checkedAt.slice(0, 10)}</time>.</>}</p>
      <a href={getOfferHref(deal)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#C6FF3D] px-5 py-3 font-bold text-black">
        {offerActionLabel(deal)}<ExternalLink className="h-4 w-4" />
      </a>
      <p className="text-xs text-zinc-500">Provider links may earn SaaSFolio a commission. A referral link does not by itself apply a discount.</p>
      <OfferReportLink offerSlug={deal.slug} />
    </div>
  </div>;
}

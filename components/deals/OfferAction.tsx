"use client";

import type { ReactNode } from "react";
import type { SaaSDeal } from "@/lib/types";
import { getOfferHref, offerActionLabel } from "@/lib/offer-links";

export function OfferAction({ deal, onReveal, className, icon }: {
  deal: SaaSDeal;
  onReveal?: (deal: SaaSDeal) => void;
  className?: string;
  icon?: ReactNode;
}) {
  if (deal.code && onReveal) return <button type="button" onClick={() => onReveal(deal)} className={className} aria-label={`View ${deal.toolName} coupon code`}>
    {icon}<span>View code</span>
  </button>;
  return <a href={getOfferHref(deal)} target="_blank" rel="sponsored nofollow noopener noreferrer" className={className} aria-label={`${offerActionLabel(deal)} for ${deal.toolName}`}>
    {icon}<span>{offerActionLabel(deal)}</span>
  </a>;
}

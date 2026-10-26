import type { SaaSDeal } from "@/lib/types";
import { offerStatus, publicHttpsUrl } from "@/lib/offer-links";

type OfferEvidence = Pick<SaaSDeal, "slug" | "dealType" | "sourceUrl" | "sourceKind" | "checkedAt" | "expiryDate">;

function recordedDate(value?: string) {
  if (!value || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value)) return undefined;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return undefined;
  // Date.parse normalizes impossible days such as February 30; those are not
  // valid recorded observations and must not turn into a different date.
  const day = value.slice(0, 10);
  if (new Date(`${day}T00:00:00Z`).toISOString().slice(0, 10) !== day) return undefined;
  const iso = new Date(timestamp).toISOString();
  return { iso, label: iso.slice(0, 10) };
}

// Plain markup can render in server cards and client dialogs. A source check
// records an observation; it does not establish successful coupon redemption.
export function OfferEvidenceDetails({ deal }: { deal: OfferEvidence }) {
  const sourceUrl = publicHttpsUrl(deal.sourceUrl);
  const checked = recordedDate(deal.checkedAt);
  const expiry = recordedDate(deal.expiryDate);
  const sourceLabel = deal.sourceKind === "vendor" ? "Provider source" : deal.sourceKind === "coupon-site" ? "Coupon publisher" : "Recorded source";

  return <div data-offer-evidence={deal.slug} className="space-y-3 text-xs leading-relaxed text-zinc-400">
    <p>{offerStatus({ ...deal, checkedAt: checked ? deal.checkedAt : undefined })}.</p>
    {(sourceUrl || checked || expiry) && <dl className="space-y-2 rounded-xl border border-white/10 bg-black/30 p-4">
      {sourceUrl && <div className="space-y-1">
        <dt className="text-zinc-500">Source</dt>
        <dd><a href={sourceUrl} target="_blank" rel="nofollow noopener noreferrer" className="text-[#C6FF3D] underline underline-offset-4">{sourceLabel} · <span className="break-all">{new URL(sourceUrl).hostname}</span> ↗</a></dd>
      </div>}
      {checked && <div className="flex flex-wrap gap-x-2 gap-y-1"><dt className="text-zinc-500">Source checked</dt><dd><time dateTime={checked.iso}>{checked.label}</time></dd></div>}
      {expiry && <div className="flex flex-wrap gap-x-2 gap-y-1"><dt className="text-zinc-500">Published expiry</dt><dd><time dateTime={expiry.iso}>{expiry.label}</time></dd></div>}
    </dl>}
  </div>;
}

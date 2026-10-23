import Link from "next/link";
import type { DetailedTool } from "@/lib/types";
import { DISCOUNT_SOURCES } from "@/lib/discount-sources";
import { brandReportHref } from "@/lib/offer-report-links";

export function BrandSourcePanel({ tool }: { tool: DetailedTool }) {
  const sources = DISCOUNT_SOURCES[tool.slug] || [];
  if (tool.providerStatus === "unavailable") return null;
  return <section id="offer-sources" className="scroll-mt-28 rounded-2xl border border-white/10 bg-[#09090C] p-6 space-y-5">
    <div className="max-w-3xl space-y-3"><h2 className="font-display text-2xl font-bold text-white">Where to check {tool.name} discounts</h2><p className="text-sm leading-relaxed text-zinc-400">Start with official pricing. {sources.length ? "Compare third-party listings below and check access costs before joining a deal service." : "No additional coupon publisher has been reviewed for this profile."} These research links do not establish that a code will work for your account.</p></div>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <div className="rounded-xl border border-[#C6FF3D]/25 p-5 space-y-3"><p className="font-mono text-xs text-[#C6FF3D]">OFFICIAL PROVIDER</p><a href={tool.pricingUrl || tool.website} target="_blank" rel="sponsored nofollow noopener noreferrer" className="font-semibold text-white underline underline-offset-4">{tool.name} pricing & terms ↗</a><p className="text-sm text-zinc-400">Check eligible plans, renewal costs, cancellation rules and any provider-published promotion. A referral alone does not apply a discount.</p></div>
      {sources.map(source => <div key={source.url} className="rounded-xl border border-white/10 p-5 space-y-3" data-research-source>
        <p className="font-mono text-xs text-zinc-400">{source.kind === "partner-marketplace" ? "PARTNER MARKETPLACE" : "COUPON PUBLISHER"}</p>
        <a href={source.url} target="_blank" rel="nofollow noopener noreferrer" className="font-semibold text-white underline underline-offset-4">{source.name} ↗</a>
        <p className={`text-xs font-semibold ${source.access === "paid-membership" ? "text-amber-300" : "text-zinc-300"}`}>{source.access === "paid-membership" ? "Paid membership required in reviewed listing" : source.access === "account" ? "Account or application may be required" : "Public offer research"}</p>
        <p className="text-sm leading-relaxed text-zinc-400">{source.note || "This publisher reports its own codes and verification activity. Read the original restrictions and dates; SaaSFolio has not checkout tested those reports."}</p>
        {source.reviewedAt && <p className="text-xs text-zinc-500">Public page reviewed <time dateTime={source.reviewedAt}>{source.reviewedAt}</time></p>}
      </div>)}
    </div>
    <p className="text-xs leading-relaxed text-zinc-500">A publisher’s verification badge is its own report. Source links can include expired or historical codes. Partner offers may have membership fees and different eligibility from direct pricing.</p>
    <div className="flex flex-wrap gap-5 text-sm"><Link href="/about#standards" className="text-[#C6FF3D] underline">How we check offers</Link><Link href={brandReportHref(tool.slug)} className="text-zinc-400 underline">Report an issue with this brand</Link></div>
  </section>;
}

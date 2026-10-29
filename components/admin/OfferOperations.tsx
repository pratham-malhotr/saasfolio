"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import type { OfferOperationsResponse, OfferReviewReason } from "@/lib/offer-operations-types";

const labels: Record<OfferReviewReason, string> = { removed: "Source removed", expired: "Offer expired", evidence_changed: "Evidence changed", blocked: "Source blocked", unavailable: "Source unavailable", stale: "Evidence due", expiring: "Expires within 7 days" };
const date = (value: string | null) => value ? new Date(value).toLocaleString() : "Not recorded";

export function OfferOperations({ onReports }: { onReports?: () => void }) {
  const [result, setResult] = useState<OfferOperationsResponse | null>(null);
  const [reason, setReason] = useState("all"), [page, setPage] = useState(1), [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(true), [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    apiRequest<OfferOperationsResponse>(`/api/admin/offers?reason=${reason}&page=${page}`, undefined, "GET")
      .then(data => { if (active) setResult(data); })
      .catch(error => { if (active) setError(error instanceof Error ? error.message : "The queue could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reason, page, refresh]);
  function change(nextReason: string, nextPage = 1) { setLoading(true); setError(""); setReason(nextReason); setPage(nextPage); setRefresh(value => value + 1); }
  return <section aria-labelledby="offer-operations-heading" className="space-y-6">
    <header className="space-y-3"><h2 id="offer-operations-heading" className="text-2xl font-display font-bold text-white">Offer review queue</h2><p className="max-w-3xl text-sm text-zinc-400">Review source failures, changed evidence and upcoming expiries. A failed request does not establish that a code is invalid. Source checks and customer reports still require editorial review; checkout acceptance is untested.</p>{onReports && <button type="button" onClick={onReports} className="text-sm text-[#C6FF3D] underline">Review customer corrections in the inbox</button>}</header>
    {result && <p className="text-xs text-zinc-400">Collection snapshot: {date(result.collectedAt)} · Queue evaluated: {date(result.generatedAt)}. Refreshing this view does not contact providers.</p>}
    <div className="flex flex-wrap items-end gap-4"><label className="text-sm text-zinc-300">Review reason<select value={reason} onChange={event => change(event.target.value)} className="block mt-2 rounded-xl border border-white/20 bg-black p-3 text-white"><option value="all">All ({result?.total ?? "…"})</option>{Object.entries(labels).map(([key, label]) => <option key={key} value={key}>{label} ({result?.counts[key as OfferReviewReason] ?? "…"})</option>)}</select></label><button type="button" disabled={loading} onClick={() => change(reason, page)} className="rounded-xl border border-white/20 px-4 py-3 text-sm text-white disabled:opacity-50">Refresh queue</button></div>
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {loading && <p role="status" className="text-zinc-400">Loading offer reviews…</p>}
    {!loading && !error && result && <div aria-live="polite" className="space-y-4"><p className="text-sm text-zinc-400">{result.filteredTotal} sources need this review. Page {result.page} of {result.pages}.</p>{result.items.length === 0 && <p className="rounded-xl border border-white/15 p-6 text-zinc-400">No recorded issues match this filter.</p>}{result.items.map(item => <article key={item.id} className="min-w-0 space-y-4 rounded-2xl border border-white/15 p-5 sm:p-6">
      <div className="flex flex-wrap justify-between gap-3"><h3 className="text-lg font-semibold text-white">{item.brandName}</h3><ul aria-label="Review reasons" className="flex flex-wrap gap-2">{item.reasons.map(flag => <li key={flag} className="rounded-md bg-white/5 px-2 py-1 text-xs text-[#C6FF3D]">{labels[flag]}</li>)}</ul></div>
      {item.sourceUrl && <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" className="block break-all text-sm text-zinc-300 underline">Open recorded source ↗</a>}
      <dl className="grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-zinc-500">Latest source evidence</dt><dd className="text-zinc-300">{date(item.checkedAt)}</dd></div><div><dt className="text-zinc-500">Last request {item.httpStatus ? `(HTTP ${item.httpStatus})` : ""}</dt><dd className="text-zinc-300">{date(item.lastAttemptAt)}</dd></div><div><dt className="text-zinc-500">Scheduled retry after</dt><dd className="text-zinc-300">{date(item.nextAttemptAt)}</dd></div></dl>
      {!!item.offers.length && <ul className="space-y-3">{item.offers.map(offer => <li key={offer.slug} className="break-words border-t border-white/10 pt-3"><Link href={`/deals/${offer.slug}`} className="text-sm text-[#C6FF3D] underline">{offer.title}</Link><p className="mt-1 text-xs text-zinc-400">Offer evidence: {date(offer.checkedAt)}{offer.expiryDate ? ` · Expires: ${date(offer.expiryDate)}` : " · No published expiry recorded"}</p></li>)}</ul>}
      <p className="break-all text-xs text-zinc-500">Source reference: {item.id}</p>
    </article>)}</div>}
    {result && result.pages > 1 && <nav aria-label="Offer review pages" className="flex flex-wrap gap-3"><button type="button" disabled={loading || page <= 1} onClick={() => change(reason, page - 1)} className="rounded-xl border border-white/20 px-4 py-3 text-white disabled:opacity-40">Previous</button><button type="button" disabled={loading || page >= result.pages} onClick={() => change(reason, page + 1)} className="rounded-xl border border-white/20 px-4 py-3 text-white disabled:opacity-40">Next</button></nav>}
  </section>;
}

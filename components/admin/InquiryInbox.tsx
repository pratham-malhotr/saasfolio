"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";
import { downloadJson } from "@/lib/browser-download";
import { filterInquiries, inquiryExport, type InboxInquiry } from "@/lib/inquiry-inbox";

const field = "mt-2 block min-h-11 w-full rounded-xl border border-white/15 bg-black p-3 text-sm text-white";
export function InquiryInbox({ onPrepareBrand, canPrepareBrand }: { canPrepareBrand: boolean; onPrepareBrand: (payload: Record<string, unknown>) => void }) {
  const [items, setItems] = useState<InboxInquiry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");
  const [reload, setReload] = useState(0);
  const [cursor, setCursor] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    apiRequest<{ inquiries: InboxInquiry[]; nextCursor: string | null }>("/api/admin/inquiries", undefined, "GET")
      .then(result => { if (active) { setItems(result.inquiries); setCursor(result.nextCursor); } })
      .catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reload]);
  async function update(id: string, nextStatus: string) {
    if (busy) return;
    setBusy(id); setError("");
    try { await apiRequest("/api/admin/inquiries", { id, status: nextStatus, previousStatus: items.find(item => item.id === id)?.status }, "PATCH"); setItems(previous => previous.map(item => item.id === id ? { ...item, status: nextStatus } : item)); }
    catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(null); }
  }
  const visible = filterInquiries(items, filter, status, query);
  return <div className="space-y-7">
    <header className="space-y-3"><h2 className="font-display text-2xl font-bold text-white">Brand submissions & review inbox</h2><p className="text-sm leading-7 text-zinc-400">Saved product details, contact information and review status stay together. Preparing a draft and marking a submission resolved are separate from editorial approval and publication.</p></header>
    <div className="grid gap-4 rounded-2xl border border-white/10 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <label className="text-sm text-zinc-400">Submission type<select value={filter} onChange={event => setFilter(event.target.value)} className={field}><option value="all">All inquiry types</option><option value="brands">Brand / software submissions</option><option value="submission">All submissions</option><option value="contact">Contact messages</option><option value="reports">Listing corrections</option><option value="advertise">Historical partnership inquiries</option></select></label>
      <label className="text-sm text-zinc-400">Review status<select value={status} onChange={event => setStatus(event.target.value)} className={field}><option value="all">All statuses</option><option value="pending">Pending</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></label>
      <label className="text-sm text-zinc-400">Find a saved inquiry<input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Brand, email, domain or reference" maxLength={254} className={field} /></label>
      <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400 sm:col-span-2 lg:col-span-3"><p role="status">{visible.length} matching · {items.length} loaded{cursor ? " · earlier records available" : ""}</p><button type="button" disabled={loading || busy !== null} onClick={() => { setLoading(true); setError(""); setReload(value => value + 1); }} className="ml-auto min-h-11 rounded-xl border border-white/15 px-4 text-white">Refresh inbox</button><button type="button" disabled={!visible.length || loading} onClick={() => { try { downloadJson(`saasfolio-inquiries-${new Date().toISOString().slice(0, 10)}.json`, inquiryExport(visible)); } catch { setError("The export could not be downloaded. Your saved records remain in the inbox."); } }} className="min-h-11 rounded-xl border border-[#C6FF3D]/30 px-4 text-[#C6FF3D] disabled:opacity-50">Export matching loaded records</button></div>
      <p className="text-xs leading-6 text-zinc-500 sm:col-span-2 lg:col-span-3">Exports contain private contact details. Store them securely. Filters apply to loaded records; use Load earlier inquiries to include older submissions.</p>
    </div>
    {error && <p role="alert" className="rounded-xl border border-rose-400/30 p-4 text-sm text-rose-300">{error}</p>}
    {loading && <p role="status" className="text-zinc-400">Loading the review queue…</p>}
    {!loading && !visible.length && !error && <p className="rounded-2xl border border-white/10 p-8 text-zinc-400">{items.length ? "No loaded inquiries match these filters." : "No saved inquiries have been received yet."}</p>}
    {visible.map(item => <section key={item.id} className="space-y-4 rounded-2xl border border-white/10 bg-[#09090C] p-6"><div className="flex flex-wrap justify-between gap-3"><div className="min-w-0"><p className="text-xs uppercase text-[#C6FF3D]">{item.payload.submissionType === "brand" ? "Brand submission" : item.kind} · {item.status}</p><h3 className="mt-2 break-words text-xl font-bold text-white">{String(item.payload.subject || item.payload.toolName || item.payload.companyName || "Inquiry")}</h3><p className="mt-2 break-all text-sm text-zinc-400">{item.email} · <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></p></div><label className="text-sm text-zinc-400">Review status<select value={item.status} disabled={busy !== null || loading} onChange={event => update(item.id, event.target.value)} className={field}><option value="pending">Pending</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></label></div>
      {typeof item.payload.brandSlug === "string" && <Link href={typeof item.payload.offerSlug === "string" ? `/deals/${item.payload.offerSlug}` : `/tools/${item.payload.brandSlug}`} className="inline-block text-sm text-[#C6FF3D] underline">Open reported listing</Link>}
      {canPrepareBrand && item.kind === "submission" && item.payload.submissionType === "brand" && <button type="button" onClick={() => onPrepareBrand(item.payload)} className="rounded-xl border border-[#C6FF3D]/40 px-4 py-2 text-sm text-[#C6FF3D]">Prepare brand draft</button>}
      <dl className="grid gap-4 sm:grid-cols-2">{Object.entries(item.payload).map(([key, value]) => <div key={key} className="min-w-0 break-words"><dt className="text-xs capitalize text-zinc-500">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="mt-1 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{Array.isArray(value) ? value.map(String).join("\n") : typeof value === "object" && value !== null ? JSON.stringify(value, null, 2) : String(value)}</dd></div>)}</dl><p className="break-all text-xs text-zinc-500">Saved reference: {item.id}</p>
    </section>)}
    {cursor && <button type="button" disabled={busy !== null || loading} onClick={async () => {
      setBusy("pagination"); setError("");
      try { const result = await apiRequest<{ inquiries: InboxInquiry[]; nextCursor: string | null }>(`/api/admin/inquiries?before=${encodeURIComponent(cursor)}`, undefined, "GET"); setItems(previous => [...previous, ...result.inquiries.filter(item => !previous.some(old => old.id === item.id))]); setCursor(result.nextCursor); }
      catch (error) { setError(error instanceof Error ? error.message : "Records could not be loaded."); }
      finally { setBusy(null); }
    }} className="rounded-xl border border-white/20 px-5 py-3 text-white">Load earlier inquiries</button>}
    <Link href="/profile" className="inline-block text-sm text-[#C6FF3D] underline">Back to your account</Link>
  </div>;
}

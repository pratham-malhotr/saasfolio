"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { apiRequest } from "@/lib/api-client";

type Inquiry = { id: string; kind: string; email: string; payload: Record<string, string | number>; status: string; created_at: string };
export function InquiryInbox() {
  const [items, setItems] = useState<Inquiry[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [cursor, setCursor] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    apiRequest<{ inquiries: Inquiry[]; nextCursor: string | null }>("/api/admin/inquiries", undefined, "GET")
      .then(result => { if (active) { setItems(result.inquiries); setCursor(result.nextCursor); } })
      .catch(error => { if (active) setError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function update(id: string, status: string) {
    setBusy(id); setError("");
    try { await apiRequest("/api/admin/inquiries", { id, status, previousStatus: items.find(item => item.id === id)?.status }, "PATCH"); setItems(previous => previous.map(item => item.id === id ? { ...item, status } : item)); }
    catch (error) { setError(error instanceof Error ? error.message : "Please try again."); }
    finally { setBusy(null); }
  }
  return <div className="space-y-7">
    <header className="space-y-3"><h2 className="font-display text-2xl text-white font-bold">Review inbox</h2><p className="text-sm text-zinc-400">Contact messages, partnership inquiries, and vendor submissions. Load earlier records as needed. Marking a submission resolved does not publish a catalog offer; source verification and the catalog workflow are required.</p></header>
    <label className="block text-sm text-zinc-400">Filter by type<select value={filter} onChange={event => setFilter(event.target.value)} className="ml-3 p-2 bg-black text-white border border-white/15 rounded-xl"><option value="all">All</option><option value="contact">Contact</option><option value="reports">Listing corrections</option><option value="advertise">Partnerships</option><option value="submission">Submissions</option></select></label>
    {error && <p role="alert" className="text-rose-400">{error}</p>}
    {loading && <p role="status" className="text-zinc-400">Loading the review queue…</p>}
    {!loading && items.length === 0 && !error && <p className="p-8 rounded-2xl border border-white/10 text-zinc-400">No inquiries have been received yet.</p>}
    {items.filter(item => filter === "all" || (filter === "reports" ? item.payload.reportStatus === "unreviewed" : item.kind === filter)).map(item => <section key={item.id} className="p-6 rounded-2xl border border-white/10 bg-[#09090C] space-y-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="text-xs text-[#C6FF3D] uppercase">{item.kind} · {item.status}</p><h2 className="text-xl text-white font-bold mt-2">{item.payload.subject || item.payload.toolName || item.payload.companyName || "Inquiry"}</h2><p className="text-sm text-zinc-400 mt-2">{item.email} · <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time></p></div><label className="text-sm text-zinc-400">Review status<select value={item.status} disabled={busy !== null} onChange={event => update(item.id, event.target.value)} className="block mt-2 rounded-xl p-2 bg-black border border-white/15 text-white"><option value="pending">Pending</option><option value="reviewing">Reviewing</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option></select></label></div>{typeof item.payload.brandSlug === "string" && <Link href={typeof item.payload.offerSlug === "string" ? `/deals/${item.payload.offerSlug}` : `/tools/${item.payload.brandSlug}`} className="inline-block text-sm text-[#C6FF3D] underline">Open reported listing</Link>}<dl className="grid sm:grid-cols-2 gap-3">{Object.entries(item.payload).map(([key, value]) => <div key={key} className="break-words"><dt className="text-xs text-zinc-500 capitalize">{key.replace(/([A-Z])/g, " $1")}</dt><dd className="text-sm text-zinc-300 whitespace-pre-wrap mt-1">{String(value)}</dd></div>)}</dl><p className="text-xs text-zinc-500">Reference: {item.id}</p></section>)}
    {cursor && <button type="button" disabled={busy !== null} onClick={async () => {
      setBusy("pagination"); setError("");
      try { const result = await apiRequest<{ inquiries: Inquiry[]; nextCursor: string | null }>(`/api/admin/inquiries?before=${encodeURIComponent(cursor)}`, undefined, "GET"); setItems(previous => [...previous, ...result.inquiries.filter(item => !previous.some(old => old.id === item.id))]); setCursor(result.nextCursor); }
      catch (error) { setError(error instanceof Error ? error.message : "Records could not be loaded."); }
      finally { setBusy(null); }
    }} className="px-5 py-3 rounded-xl border border-white/20 text-white">Load earlier inquiries</button>}
    <Link href="/profile" className="inline-block text-sm text-[#C6FF3D] underline">Back to your account</Link>
  </div>;
}

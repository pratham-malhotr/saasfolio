"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search, SlidersHorizontal, Check, X } from "lucide-react";
import type { HostingProvider } from "@/lib/data/hosting-providers";
import { filterHostingProviders } from "@/lib/hosting";

export function HostingFinder({ providers }: { providers: HostingProvider[] }) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [workload, setWorkload] = useState("all");
  const [managedOnly, setManagedOnly] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const filtered = filterHostingProviders(providers, query, kind, workload, managedOnly);
  const shortlist = providers.filter(p => selected.includes(p.slug));
  function toggle(slug: string) {
    if (selected.includes(slug)) { setSelected(selected.filter(item => item !== slug)); setNotice(""); }
    else if (selected.length < 3) { setSelected([...selected, slug]); setNotice(""); }
    else setNotice("Your shortlist has three providers. Remove one to add another.");
  }
  return <section id="finder" className="scroll-mt-28">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="hosting-eyebrow">Start with your workload</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Find your hosting fit.</h2></div><span className="text-xs text-zinc-500">Select up to 3 providers to compare responsibilities</span></div>
    <div className="mt-7 grid gap-4 rounded-2xl border border-white/10 bg-[#101216] p-4 sm:p-5 lg:grid-cols-[1.3fr_1fr_1fr]">
      <label className="text-xs text-zinc-400">Search providers<div className="relative"><Search className="pointer-events-none absolute left-3 top-5 h-4 w-4 text-zinc-500" /><input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Name, workload or feature…" className="hosting-input mt-2 pl-10" /></div></label>
      <label className="text-xs text-zinc-400">Hosting approach<select value={kind} onChange={e => setKind(e.target.value)} className="hosting-input mt-2"><option value="all">All approaches</option>{["VPS", "Managed WordPress", "App platform", "Static & edge", "Web hosting"].map(k => <option key={k}>{k}</option>)}</select></label>
      <label className="text-xs text-zinc-400">Your project<select value={workload} onChange={e => setWorkload(e.target.value)} className="hosting-input mt-2"><option value="all">All projects</option><option value="wordpress">WordPress publication</option><option value="application">Web app or API</option><option value="static">Static site or portfolio</option><option value="self-hosting">Self-hosted services</option></select></label>
      <label className="flex items-center gap-3 text-xs text-zinc-300 lg:col-span-2"><input type="checkbox" checked={managedOnly} onChange={e => setManagedOnly(e.target.checked)} className="h-4 w-4 accent-[#C6FF3D]" />Exclude self-managed VPS and Coolify</label>
      <div className="flex items-center justify-between gap-3 text-xs"><span role="status" className="text-zinc-400">{filtered.length} matching providers</span><button onClick={() => { setQuery(""); setKind("all"); setWorkload("all"); setManagedOnly(false); }} className="inline-flex items-center gap-2 text-[#C6FF3D]"><SlidersHorizontal className="h-3 w-3" />Reset filters</button></div>
    </div>
    <p role="status" className="mt-3 min-h-5 text-xs text-[#C6FF3D]">{notice}</p>
    {selected.length > 0 && <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-[#C6FF3D]/25 bg-[#C6FF3D]/5 p-4"><span className="text-xs text-zinc-400">Your shortlist</span>{shortlist.map(p => <button key={p.slug} onClick={() => toggle(p.slug)} className="inline-flex items-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs text-white" aria-label={`Remove ${p.name} from shortlist`}>{p.name}<X className="h-3 w-3" /></button>)}<a href="#shortlist" className="ml-auto text-xs text-[#C6FF3D] underline">Compare {selected.length} selected ↓</a></div>}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((p, i) => <article key={p.slug} className="hosting-provider-card flex flex-col rounded-2xl border border-white/10 bg-[#101216] p-6" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
      <div className="flex items-start justify-between gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-[#C6FF3D]/5 font-display text-lg text-[#C6FF3D]" aria-hidden="true">{p.name.slice(0, 1)}</span><span className="rounded-full border border-white/10 px-3 py-1 text-[10px] text-zinc-400">{p.kind}</span></div>
      <h3 className="mt-5 font-display text-xl font-semibold"><Link prefetch={false} href={`/tools/${p.slug}`} className="hover:text-[#C6FF3D]">{p.name}</Link></h3><p className="mt-3 text-sm leading-7 text-zinc-300">{p.fit}</p><p className="mb-5 mt-3 border-l border-[#C6FF3D]/30 pl-3 text-xs leading-6 text-zinc-500">{p.tradeoff}</p>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-white/10 pt-4"><label className="inline-flex cursor-pointer items-center gap-2 text-xs text-zinc-400"><input type="checkbox" checked={selected.includes(p.slug)} onChange={() => toggle(p.slug)} className="h-4 w-4 accent-[#C6FF3D]" />{selected.includes(p.slug) ? "Shortlisted" : "Compare"}</label><Link prefetch={false} href={`/tools/${p.slug}`} className="inline-flex items-center gap-1 text-xs text-[#C6FF3D]">Read profile<ArrowUpRight className="h-3 w-3" /></Link></div>
    </article>)}</div>
    {!filtered.length && <div className="rounded-2xl border border-dashed border-white/15 px-6 py-12 text-center text-sm text-zinc-400">No providers match these filters. Try another hosting approach or reset the filters.</div>}
    <section id="shortlist" className="mt-8 scroll-mt-28"><h3 className="mb-4 flex items-center gap-2 font-display text-xl"><Check className="h-5 w-5 text-[#C6FF3D]" />Compare the work behind the hosting</h3>{shortlist.length ? <div className="overflow-x-auto rounded-2xl border border-white/10"><table className="w-full min-w-[620px] text-left text-sm"><caption className="sr-only">Selected hosting providers compared by management, billing and recovery responsibilities</caption><thead className="bg-[#15181b]"><tr><th scope="col" className="p-5 text-zinc-400">Decision</th>{shortlist.map(p => <th key={p.slug} scope="col" className="p-5 text-white">{p.name}</th>)}</tr></thead><tbody>{([['Management', 'management'], ['How to budget', 'billing'], ['Recovery to verify', 'recovery'], ['Trade-off', 'tradeoff']] as const).map(([label, key]) => <tr key={key} className="border-t border-white/10"><th scope="row" className="p-5 font-medium text-zinc-400">{label}</th>{shortlist.map(p => <td key={p.slug} className="p-5 align-top text-xs leading-6 text-zinc-300">{p[key]}</td>)}</tr>)}</tbody></table></div> : <p className="text-sm leading-7 text-zinc-500">Use Compare on a provider card to build a shortlist. Selection stays here while you filter the directory.</p>}</section>
  </section>;
}

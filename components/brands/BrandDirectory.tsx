"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { BrandDirectoryEntry } from "@/lib/brand-directory";

import { CATEGORIES } from "@/lib/catalog-categories";

const alphabet = ["#", ..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"];
export function BrandDirectory({ brands, initialQuery = "", initialCategory = "all" }: { brands: BrandDirectoryEntry[]; initialQuery?: string; initialCategory?: string }) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(CATEGORIES.some(item => item.slug === initialCategory) ? initialCategory : "all");
  const [letter, setLetter] = useState("all");
  const [kind, setKind] = useState("all");
  const visible = useMemo(() => brands.filter(brand => (category === "all" || brand.categorySlug === category) && (letter === "all" || brand.letter === letter) && (!query.trim() || `${brand.name} ${brand.slug} ${brand.category} ${brand.description}`.toLowerCase().includes(query.toLowerCase().trim())) && (kind === "all" || kind === "codes" && brand.codeCount > 0 || kind === "free" && brand.hasFreeOption || kind === "guides" && brand.hasGuide)), [brands, query, category, letter, kind]);
  return <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-[1fr_240px_220px] rounded-2xl border border-white/10 bg-[#09090C] p-5">
      <div className="space-y-2"><label htmlFor="brand-search" className="text-sm text-zinc-300">Find a brand</label><input id="brand-search" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="beehiiv, Predis.ai, hosting…" className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]" /></div>
      <div className="space-y-2"><label htmlFor="directory-category" className="text-sm text-zinc-300">Category</label><select id="directory-category" value={category} onChange={event => setCategory(event.target.value)} className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]"><option value="all">All categories</option>{CATEGORIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div>
      <div className="space-y-2"><label htmlFor="brand-kind" className="text-sm text-zinc-300">Show</label><select id="brand-kind" value={kind} onChange={event => setKind(event.target.value)} className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]"><option value="all">All listed brands</option><option value="codes">Recorded coupon codes</option><option value="free">Free plans or trials</option><option value="guides">Brand savings guides</option></select></div>
    </div>
    <div role="group" aria-label="Filter brands by first letter" className="flex flex-wrap gap-2">{["all", ...alphabet].map(value => <button key={value} type="button" aria-pressed={letter === value} aria-controls="brand-directory-results" onClick={() => setLetter(value)} className={`min-w-9 min-h-10 rounded-lg border px-3 py-2 text-sm ${letter === value ? "border-[#C6FF3D] bg-[#C6FF3D] text-black font-bold" : "border-white/15 text-zinc-300 hover:border-[#C6FF3D]/50"}`}>{value === "all" ? "All letters" : value}</button>)}</div>
    <p role="status" className="text-sm text-zinc-400">Showing <strong className="text-white">{visible.length}</strong> of {brands.length} brands. A profile or pricing link does not imply a discount is available.</p>
    {(query || category !== "all" || letter !== "all" || kind !== "all") && <button type="button" onClick={() => { setQuery(""); setCategory("all"); setLetter("all"); setKind("all"); }} className="text-sm text-[#C6FF3D] underline">Clear filters</button>}
    <div id="brand-directory-results" className="space-y-8">{alphabet.map(initial => {
      const group = visible.filter(brand => brand.letter === initial);
      return group.length ? <section key={initial} aria-labelledby={`letter-${initial === "#" ? "numbers" : initial}`} className="space-y-3"><h2 id={`letter-${initial === "#" ? "numbers" : initial}`} className="font-display text-2xl font-bold text-[#C6FF3D]">{initial === "#" ? "Numbers & symbols" : initial}</h2><ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{group.map(brand => <li key={brand.slug} data-brand={brand.slug} className="rounded-2xl border border-white/10 bg-[#09090C] p-5 space-y-3">
        <Link href={`/tools/${brand.slug}`} className="font-display text-lg font-bold text-white hover:text-[#C6FF3D]">{brand.name}</Link><p className="text-xs text-zinc-500">{brand.category} · {brand.pricingModel}</p><p className="line-clamp-3 text-sm leading-relaxed text-zinc-400">{brand.description}</p>
        <p className="text-xs text-zinc-400">{brand.codeCount ? `${brand.codeCount} recorded coupon ${brand.codeCount === 1 ? "code" : "codes"} · not checkout tested` : brand.hasFreeOption ? "Free plan or trial recorded · check terms" : brand.hasOffer ? "Sourced offer recorded · check eligibility" : "No current coupon recorded · pricing research"}</p>
        <div className="flex flex-wrap gap-4"><Link prefetch={false} href={`/tools/${brand.slug}`} className="inline-block text-xs text-zinc-300 underline">Features & alternatives</Link>{brand.hasGuide && <Link prefetch={false} href={`/discounts/${brand.slug}`} className="inline-block text-xs text-[#C6FF3D] underline">{brand.name} discounts & coupon guide</Link>}</div>
      </li>)}</ul></section> : null;
    })}{!visible.length && <p className="rounded-2xl border border-white/10 p-8 text-zinc-400">No brands match these filters. Try another spelling, clear the filters, or suggest a brand using the link above.</p>}</div>
  </div>;
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, GitCompare } from "lucide-react";
import type { DetailedTool } from "@/lib/types";
import { CATEGORIES } from "@/lib/catalog-categories";

export type ToolDirectoryEntry = Pick<DetailedTool, "id" | "slug" | "name" | "category" | "categorySlug" | "tagline" | "description" | "logoLetter" | "keyFeatures">;
export const TOOLS_PER_PAGE = 24;

export function ToolsDirectoryClient({ initialTools, comparisonLinks, initialPage = 1 }: { initialTools: ToolDirectoryEntry[]; comparisonLinks: Record<string, string>; initialPage?: number }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(initialPage);
  const filtered = useMemo(() => initialTools.filter(tool => (category === "all" || tool.categorySlug === category) && (!query.trim() || `${tool.name} ${tool.description} ${tool.keyFeatures.join(" ")}`.toLowerCase().includes(query.trim().toLowerCase()))), [initialTools, query, category]);
  const pages = Math.max(1, Math.ceil(filtered.length / TOOLS_PER_PAGE));
  const activePage = Math.min(page, pages);
  const visible = filtered.slice((activePage - 1) * TOOLS_PER_PAGE, activePage * TOOLS_PER_PAGE);
  const filtering = Boolean(query || category !== "all");
  return <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-32 pb-24 space-y-8">
    <header className="max-w-3xl space-y-4"><p className="font-mono text-xs text-[#C6FF3D] uppercase">Software buying guidance</p><h1 className="font-display font-bold text-4xl sm:text-5xl text-white">Choose software around the work you need to do.</h1><p className="text-zinc-400 leading-relaxed">Explore software with a published, sourced buying guide or editorial evaluation notes. Compare the actual workflow, access and operating responsibilities before comparing an introductory price.</p><p className="text-sm text-zinc-400">These are documentation-based profiles. They do not imply customer ratings, hands-on benchmarks or a verified discount. <Link href="/editorial-policy" className="text-[#C6FF3D] underline">How the collection is selected</Link>.</p></header>
    <div className="grid gap-4 sm:grid-cols-[1fr_260px] rounded-2xl border border-white/10 bg-[#09090C] p-5">
      <div className="space-y-2"><label htmlFor="software-search" className="text-sm text-zinc-300">Find software or a workflow</label><input id="software-search" type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Search software products, keywords, features..." className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]" /></div>
      <div className="space-y-2"><label htmlFor="software-category" className="text-sm text-zinc-300">Category</label><select id="software-category" value={category} onChange={event => { setCategory(event.target.value); setPage(1); }} className="w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-white focus:ring-2 focus:ring-[#C6FF3D] focus:outline-none"><option value="all">All categories</option>{CATEGORIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></div>
    </div>
    <p role="status" className="text-sm text-zinc-400">Showing {visible.length ? (activePage - 1) * TOOLS_PER_PAGE + 1 : 0}–{Math.min(activePage * TOOLS_PER_PAGE, filtered.length)} of {filtered.length} software profiles.</p>
    {filtering && <button type="button" onClick={() => { setQuery(""); setCategory("all"); setPage(1); }} className="text-sm text-[#C6FF3D] underline">Clear filters</button>}
    <div data-published-tools="true" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{visible.map(tool => <section key={tool.slug} className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#09090C] p-6 space-y-5">
      <div className="space-y-3"><p className="text-xs text-zinc-500">{tool.category}</p><h2 className="text-xl font-display font-bold text-white"><Link prefetch={false} href={`/tools/${tool.slug}`} className="hover:text-[#C6FF3D]">{tool.name}</Link></h2><p className="text-sm text-zinc-400 leading-relaxed">{tool.description}</p></div>
      <div className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-4 text-sm"><Link prefetch={false} href={`/tools/${tool.slug}`} className="inline-flex items-center gap-2 text-[#C6FF3D]">Read buying notes <ArrowRight className="h-4 w-4" /></Link>{comparisonLinks[tool.slug] && comparisonLinks[tool.slug] !== "/compare" && <Link prefetch={false} href={comparisonLinks[tool.slug]} className="inline-flex items-center gap-2 text-zinc-300"><GitCompare className="h-4 w-4" />Compare</Link>}</div>
    </section>)}</div>
    {!visible.length && <p className="rounded-2xl border border-white/10 p-8 text-zinc-400">No published profiles match. Clear the filters or <Link href="/contact" className="text-[#C6FF3D] underline">suggest software to research</Link>.</p>}
    {pages > 1 && <nav aria-label="Software directory pages" className="flex flex-wrap gap-2">{Array.from({ length: pages }, (_, index) => index + 1).map(number => filtering ? <button key={number} type="button" aria-current={activePage === number ? "page" : undefined} onClick={() => setPage(number)} className={`rounded-lg border px-4 py-2 text-sm ${activePage === number ? "border-[#C6FF3D] text-[#C6FF3D]" : "border-white/15 text-zinc-300"}`}>{number}</button> : <Link key={number} prefetch={false} href={number === 1 ? "/tools" : `/tools?page=${number}`} aria-current={activePage === number ? "page" : undefined} className={`rounded-lg border px-4 py-2 text-sm ${activePage === number ? "border-[#C6FF3D] text-[#C6FF3D]" : "border-white/15 text-zinc-300"}`}>{number}</Link>)}</nav>}
    <section className="max-w-3xl space-y-4 border-t border-white/10 pt-8"><h2 className="text-2xl font-semibold text-white">Compare a complete configuration</h2><p className="text-zinc-400 leading-relaxed">Count the people who need paid access, the volume of work and the feature that determines the package. Include the additional services needed to finish the workflow. A self-hosted product also needs an operator, backups and a recovery process; a hosted product can have separate usage or workspace limits.</p><p className="text-zinc-400 leading-relaxed">Then compare the full first-year and renewal amounts. Our <Link href="/articles/compare-saas-pricing-limits" className="text-[#C6FF3D] underline">usage-limit guide</Link> helps turn package limits into a realistic estimate, while the <Link href="/compare" className="text-[#C6FF3D] underline">editorial comparisons</Link> explain where different approaches fit.</p></section>
  </article>;
}

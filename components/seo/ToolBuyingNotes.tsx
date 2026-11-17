import Link from "next/link";
import { BRAND_DISCOUNT_GUIDES } from "@/lib/data/brand-discount-guides";
import { EDITORIAL_TOOL_NOTES } from "@/lib/data/editorial-tool-notes";
import type { DetailedTool } from "@/lib/types";
import { BRAND_REVIEW_SLUGS, HOSTING_REVIEWS } from "@/lib/data/hosting-reviews";

export function ToolBuyingNotes({ tool }: { tool: DetailedTool }) {
  const guide = BRAND_DISCOUNT_GUIDES[tool.slug];
  const notes = EDITORIAL_TOOL_NOTES[tool.slug];
  const reviews = HOSTING_REVIEWS.filter(article => BRAND_REVIEW_SLUGS[tool.slug]?.includes(article.slug));
  return <section data-editorial-profile="true" className="mb-12 rounded-2xl border border-white/10 bg-[#09090C] p-6 sm:p-8 space-y-6">
    <header className="space-y-3"><p className="text-xs font-mono text-[#C6FF3D] uppercase">Software buying notes</p><h2 className="text-2xl font-display font-bold text-white">Before choosing {tool.name}</h2><p className="text-zinc-300 leading-relaxed">{guide?.summary || notes?.summary || tool.longDescription}</p></header>
    {guide && <div className="grid gap-5 md:grid-cols-3">{guide.decisionRows.map(row => <div key={row.option} className="space-y-2"><h3 className="font-semibold text-white">{row.option}</h3><p className="text-sm text-zinc-400">{row.bestFor}</p><p className="text-sm text-zinc-300">Check: {row.check}</p></div>)}</div>}
    {notes && <ul className="space-y-3 list-disc pl-5 text-zinc-300">{notes.checks.map(check => <li key={check}>{check}</li>)}</ul>}
    {reviews.length > 0 && <nav aria-label={`${tool.name} editorial reviews`} className="space-y-3 border-t border-white/10 pt-5"><h3 className="text-lg font-semibold text-white">Read the full assessment</h3>{reviews.map(article => <Link key={article.slug} href={`/articles/${article.slug}`} className="block text-sm text-[#C6FF3D] underline">{article.title} →</Link>)}</nav>}
    <p className="text-sm text-zinc-400">This profile draws on linked documentation and editorial buying guidance. It does not represent a hands-on benchmark or customer review. <Link href="/editorial-policy" className="text-[#C6FF3D] underline">Read the editorial method</Link>.</p>
    <a href={notes?.sourceUrl || guide?.sourceUrl || tool.sourceUrl || tool.website} target="_blank" rel="noopener noreferrer" className="inline-block text-sm text-[#C6FF3D] underline">Official {tool.name} documentation and terms ↗</a>
  </section>;
}

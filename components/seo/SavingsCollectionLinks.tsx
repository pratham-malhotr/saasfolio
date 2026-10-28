import Link from "next/link";
import { SAVINGS_COLLECTIONS, type SavingsCollectionSlug } from "@/lib/data/savings-collections";

export function SavingsCollectionLinks({ current, heading = "More ways to save on software", slugs }: { current?: SavingsCollectionSlug; heading?: string; slugs?: SavingsCollectionSlug[] }) {
  const collections = SAVINGS_COLLECTIONS.filter(collection => collection.slug !== current && (!slugs || slugs.includes(collection.slug)));
  return <nav aria-label={heading} className="space-y-4" data-savings-discovery="">
    <h2 className="font-display text-2xl font-bold text-white">{heading}</h2>
    <div className="grid gap-3 sm:grid-cols-2">{collections.map(collection => <Link prefetch={false} key={collection.slug} href={`/${collection.slug}`} className="rounded-2xl border border-white/10 bg-[#09090C] p-5 space-y-2 hover:border-[#C6FF3D]/50">
      <span className="block font-semibold text-[#C6FF3D]">{collection.navLabel} →</span>
      <span className="block text-sm leading-relaxed text-zinc-400">{collection.description}</span>
    </Link>)}</div>
  </nav>;
}

import Link from "next/link";
import { getCreatorGuidesForBrand } from "@/lib/data/creator-buying-guides";

export function BrandBuyingGuides({ slug }: { slug: string }) {
  const guides = getCreatorGuidesForBrand(slug);
  if (!guides.length) return null;

  return (
    <nav aria-label="Related buying guides" className="space-y-3 rounded-2xl border border-white/10 bg-[#0e1314] p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-white">Related buying guides</h2>
      <ul className="space-y-1">
        {guides.map(guide => <li key={guide.slug}><Link prefetch={false} href={`/articles/${guide.slug}`} className="inline-flex min-h-11 items-center text-sm text-[#C6FF3D] underline underline-offset-4">{guide.title}</Link></li>)}
      </ul>
    </nav>
  );
}

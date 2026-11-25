import Link from "next/link";
import { getToolComparisons } from "@/lib/data/comparisons-data";
import { SOFTWARE_REVIEWS } from "@/lib/data/software-reviews";
import { getCreatorGuidesForBrand } from "@/lib/data/creator-buying-guides";

export function BrandBuyingGuides({ slug }: { slug: string }) {
  const guides = [...getCreatorGuidesForBrand(slug), ...SOFTWARE_REVIEWS.filter(review => review.toolSlug === slug)];
  const comparisons = getToolComparisons(slug);
  const links = [
    ...guides.map(guide => ({ href: `/articles/${guide.slug}`, title: guide.title })),
    ...comparisons.map(comparison => ({ href: `/compare/${comparison.slug}`, title: comparison.title })),
  ];
  if (!links.length) return null;

  return (
    <nav aria-label="Related buying guides" className="space-y-3 rounded-2xl border border-white/10 bg-[#0e1314] p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold text-white">Related buying guides</h2>
      <ul className="space-y-1">
        {links.map(link => <li key={link.href}><Link prefetch={false} href={link.href} className="inline-flex min-h-11 items-center text-sm text-[#C6FF3D] underline underline-offset-4">{link.title}</Link></li>)}
      </ul>
    </nav>
  );
}

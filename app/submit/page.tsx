import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { AddBrandForm } from "@/components/submit/AddBrandForm";
import { formsConfigured } from "@/lib/server/supabase";
import { getPublishedTools } from "@/lib/published-catalog";

export const metadata = pageMetadata({
  title: 'Add Your Brand to SaaSFolio',
  description: 'Submit your SaaS product, hosting service or software brand to SaaSFolio. Preview your listing and share product details for an independent editorial review.',
  path: "/submit",
  noIndex: true,
});

export default function SubmitPage() {
  return <article className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
    <header className="mb-10 max-w-3xl space-y-5">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C6FF3D]">For the people building useful things</p>
      <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">Your next users could<br />find you here.</h1>
      <p className="max-w-2xl text-lg leading-relaxed text-zinc-400">Add your brand to SaaSFolio. Tell us what it does, who it helps, and what makes it worth a closer look. No account or coupon required.</p>
      <div className="flex flex-wrap gap-3 text-xs text-zinc-300"><span className="rounded-full border border-white/15 px-3 py-2">Free to submit</span><span className="rounded-full border border-white/15 px-3 py-2">Editorial review</span><span className="rounded-full border border-white/15 px-3 py-2">SaaS, hosting & software</span></div>
    </header>
    <AddBrandForm available={formsConfigured()} existingBrands={getPublishedTools().map(({ name, slug, website }) => ({ name, slug, website }))} />
    <section className="mt-16 grid gap-8 border-t border-white/10 pt-10 md:grid-cols-3" aria-label="How submissions work">
      {[['01', 'Share the details', 'Use your official website and pricing or documentation page. Explain a concrete use case and three useful features.'], ['02', 'We review the fit', 'We check the sources, category and usefulness for readers. We may ask for clarification. Submission does not guarantee a listing or a positive review.'], ['03', 'Publish a useful profile', 'Accepted brands enter our editorial publishing workflow. We prepare a profile with product context, buying considerations and official links.']].map(([number, title, body]) => <div key={number} className="space-y-3"><p className="font-mono text-xs text-[#C6FF3D]">{number}</p><h2 className="text-xl font-semibold text-white">{title}</h2><p className="text-sm leading-relaxed text-zinc-400">{body}</p></div>)}
    </section>
    <p className="mt-10 text-sm text-zinc-400">Already listed? <Link href="/contact" className="text-[#C6FF3D] underline">Request a correction</Link>. Sharing a promotion? <Link href="/submit/offer" className="text-[#C6FF3D] underline">Submit an offer</Link>. Read our <Link href="/editorial-policy" className="text-[#C6FF3D] underline">editorial standards</Link>.</p>
  </article>;
}

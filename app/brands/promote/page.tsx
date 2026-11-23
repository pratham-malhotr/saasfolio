import Link from "next/link";
import { connection } from "next/server";
import { BrandPromotionForm } from "@/components/brands/BrandPromotionForm";
import { pageMetadata } from "@/lib/seo";
import { brandVerificationEnabled } from "@/lib/server/brand-listings";

export const metadata = pageMetadata({
  title: "Promote Your Brand",
  description: "Verify your brand and discover sponsored placement in the SaaSFolio brand directory.",
  path: "/brands/promote",
  noIndex: true,
});

export default async function PromoteBrandPage() {
  await connection();
  return <article className="mx-auto max-w-5xl space-y-8 px-4 pb-24 pt-32 sm:px-6">
    <Link href="/brands" className="text-sm text-[#C6FF3D] underline">Back to brands</Link>
    <header className="max-w-2xl space-y-3">
      <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Promote your brand</h1>
      <p className="text-lg text-zinc-300">Give your brand a sponsored spot above the alphabetical results in the SaaSFolio directory. Your placement follows the same search and category filters as other listings.</p>
      <p className="text-sm text-zinc-400">Brand listings are free. Submit your brand and keep your receipt to verify your website.</p>
      <Link href="/submit" className="inline-block text-sm font-semibold text-[#C6FF3D] underline">Add your brand</Link>
    </header>
    <BrandPromotionForm verificationAvailable={brandVerificationEnabled()} />
  </article>;
}

import { pageMetadata } from "@/lib/seo";
import React, { Suspense } from "react";
import { getAllTools } from "@/lib/data/tools-data";
import { getAllDeals } from "@/lib/data/deals-data";
import { RedirectClient } from "@/components/redirect/RedirectClient";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return pageMetadata({ title: "Opening Software Offer", description: "Continue to the software provider from SaaSFolio.", path: `/go/${encodeURIComponent(id)}`, noIndex: true });
}

export async function generateStaticParams() {
  const tools = getAllTools().map((t) => ({ id: t.slug }));
  const deals = getAllDeals().map((d) => ({ id: d.slug }));
  return [...tools, ...deals];
}

export default async function AffiliateRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center font-mono text-xs text-[#C6FF3D] animate-pulse">
          PREPARING SECURE REDIRECT...
        </div>
      }
    >
      <RedirectClient id={id} />
    </Suspense>
  );
}

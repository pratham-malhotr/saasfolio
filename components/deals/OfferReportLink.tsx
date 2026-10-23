import Link from "next/link";
import { offerReportHref } from "@/lib/offer-report-links";

export function OfferReportLink({ offerSlug }: { offerSlug: string }) {
  return <Link href={offerReportHref(offerSlug)} className="inline-block text-xs text-zinc-400 underline underline-offset-4 hover:text-white">Report an expired offer, incorrect terms or broken link</Link>;
}

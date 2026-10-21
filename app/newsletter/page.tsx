import Link from "next/link";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({ title: "Newsletter signup confirmation", description: "Manage your SaaSFolio newsletter confirmation.", path: "/newsletter", noIndex: true });
export default async function NewsletterPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  return <div className="max-w-xl mx-auto px-6 pt-36 pb-24 space-y-5">
    <h1 className="font-display text-3xl text-white font-bold">{status === "confirmed" ? "Your newsletter signup is confirmed" : "Newsletter confirmation"}</h1>
    <p className="text-zinc-400">{status === "confirmed" ? "You can now receive the SaaSFolio newsletter. Every edition must include a way to unsubscribe." : status === "unavailable" ? "We couldn’t reach the signup service. Please try your email link again later." : "This link has expired or has already been used. You can request a fresh confirmation email from the homepage."}</p>
    <Link href="/#newsletter" className="inline-block text-[#C6FF3D] underline">Return to newsletter signup</Link>
    <p className="text-sm text-zinc-400">For help or to stop receiving email, <Link href="/contact" className="underline">contact support</Link> with the email address you subscribed with.</p>
  </div>;
}

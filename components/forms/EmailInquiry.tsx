import Link from "next/link";
import { Mail } from "lucide-react";
import { SUPPORT_EMAIL, SUPPORT_EMAIL_HREF } from "@/lib/site-contact";

type EmailInquiryProps = {
  kind: "submission" | "partnership";
  title: string;
  description: string;
  subject: string;
  body: string;
  details: { heading: string; text: string }[];
};

export function EmailInquiry({ kind, title, description, subject, body, details }: EmailInquiryProps) {
  const href = `${SUPPORT_EMAIL_HREF}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return <article className="mx-auto max-w-4xl px-4 pt-32 pb-24 sm:px-6 lg:px-8 space-y-8 text-zinc-300">
    <Link href="/" className="text-sm text-[#C6FF3D] underline">Home</Link>
    <header className="space-y-4">
      <p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">Contact SaaSFolio</p>
      <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-white">{title}</h1>
      <p className="text-base leading-relaxed text-zinc-400">{description}</p>
    </header>
    <section aria-label="What to include" className="rounded-2xl border border-white/10 bg-[#09090C] p-6 sm:p-8 space-y-6">
      <h2 className="font-display text-2xl font-semibold text-white">What to include in your email</h2>
      <ul className="space-y-5">{details.map(detail => <li key={detail.heading} className="space-y-1">
        <h3 className="font-semibold text-white">{detail.heading}</h3>
        <p className="text-sm leading-relaxed text-zinc-400">{detail.text}</p>
      </li>)}</ul>
      <a href={href} data-inquiry-email-draft={kind} className="inline-flex items-center gap-2 rounded-xl bg-[#C6FF3D] px-6 py-3.5 text-sm font-bold text-black hover:bg-[#D6FF66]">
        <Mail className="h-4 w-4" />Open email draft
      </a>
      <p className="text-sm leading-relaxed text-zinc-400">Review and send the draft in your email app. You can also email <a href={href} className="break-all text-[#C6FF3D] underline">{SUPPORT_EMAIL}</a> directly.</p>
    </section>
    <p className="text-sm leading-relaxed text-zinc-400">Suggestions and proposals are considered under our <Link href="/editorial-policy" className="text-[#C6FF3D] underline">editorial policy</Link>. An inquiry does not guarantee publication, placement or a positive review. Do not include passwords, payment details or private customer information.</p>
    <nav aria-label="Continue reading" className="flex flex-wrap gap-5 text-sm text-[#C6FF3D]">
      <Link href="/articles" className="underline">Read the buying guides</Link>
      <Link href="/contact" className="underline">Other contact questions</Link>
    </nav>
  </article>;
}

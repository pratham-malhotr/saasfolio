"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Copy, ExternalLink, Globe2, Loader2 } from "lucide-react";
import { apiRequest } from "@/lib/api-client";
import { CATEGORIES } from "@/lib/catalog-categories";
import { BRAND_PRICING_MODELS, BRAND_RELATIONSHIPS } from "@/lib/brand-submission";
import { SUPPORT_EMAIL_HREF } from "@/lib/site-contact";

type ExistingBrand = { name: string; slug: string; website: string };
const fieldClass = "mt-2 block w-full rounded-xl border border-white/15 bg-[#08090b] px-4 py-3 text-sm text-white outline-none transition focus:border-[#C6FF3D] focus:ring-1 focus:ring-[#C6FF3D]";

function hostname(value: string) {
  try { return new URL(value).hostname.toLowerCase().replace(/^www\./, ""); } catch { return ""; }
}

export function AddBrandForm({ available, existingBrands }: { available: boolean; existingBrands: ExistingBrand[] }) {
  const [name, setName] = useState(""), [url, setUrl] = useState(""), [tagline, setTagline] = useState("");
  const [category, setCategory] = useState(""), [pricing, setPricing] = useState("Paid");
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  const [receipt, setReceipt] = useState<{ id: string; name: string } | null>(null), [copied, setCopied] = useState(false);
  const pending = useRef(false);
  const match = url.trim() ? existingBrands.find(brand => hostname(brand.website) === hostname(url) && hostname(url)) : undefined;
  const emailHref = `${SUPPORT_EMAIL_HREF}?subject=${encodeURIComponent(`Brand submission: ${name || "My brand"}`)}&body=${encodeURIComponent(`Brand: ${name}\nOfficial website: ${url}\nDescription: ${tagline}\n\nPricing or documentation URL:\nCategory:\nProduct use case and limitations:\nThree key features:\nYour name and relationship to the brand:\nContact email:\n\nPlease consider this brand under the SaaSFolio editorial policy.`)}`;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending.current) return;
    const data = new FormData(event.currentTarget);
    const payload = {
      kind: "submission", submissionType: "brand", toolName: name, websiteUrl: url,
      tagline, categorySlug: category, pricingModel: pricing,
      pricingUrl: data.get("pricingUrl"), differentiator: data.get("differentiator"),
      keyFeatures: String(data.get("keyFeatures") || "").split("\n").map(value => value.trim()).filter(Boolean),
      contactName: data.get("contactName"), founderEmail: data.get("founderEmail"),
      relationship: data.get("relationship"), consent: data.get("consent") === "on", companyWebsite: data.get("companyWebsite"),
    };
    if (payload.keyFeatures.length < 3 || payload.keyFeatures.length > 8 || payload.keyFeatures.some(value => value.length < 5 || value.length > 160)) {
      setError("Include 3–8 features on separate lines, with 5–160 characters per feature."); return;
    }
    setError("");
    if (!available) {
      const body = `Brand: ${name}\nWebsite: ${url}\nPricing / documentation: ${payload.pricingUrl}\nCategory: ${CATEGORIES.find(item => item.slug === category)?.name}\nPricing model: ${pricing}\n\nDescription: ${tagline}\n\nUse case and limitations:\n${payload.differentiator}\n\nFeatures:\n${payload.keyFeatures.join("\n")}\n\nSubmitted by: ${payload.contactName}\nContact: ${payload.founderEmail}\nRelationship: ${payload.relationship}\n\nI agree that SaaSFolio may use these details to assess and contact me about this submission under its editorial and privacy policies.`;
      const draft = document.createElement("a");
      draft.href = `${SUPPORT_EMAIL_HREF}?subject=${encodeURIComponent(`Brand submission: ${name}`)}&body=${encodeURIComponent(body)}`;
      draft.click();
      return;
    }
    pending.current = true; setBusy(true);
    try {
      const result = await apiRequest<{ id: string }>("/api/inquiries", payload);
      setReceipt({ id: result.id, name });
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Your brand could not be saved. Please try again."); }
    finally { pending.current = false; setBusy(false); }
  }

  if (receipt) return <section aria-labelledby="submission-received" className="mx-auto max-w-2xl rounded-3xl border border-[#C6FF3D]/25 bg-[#10130b] p-8 sm:p-12">
    <CheckCircle2 className="mb-6 h-12 w-12 text-[#C6FF3D]" />
    <h2 id="submission-received" className="font-display text-3xl font-bold text-white" role="status">{receipt.name} is in the review queue.</h2>
    <p className="mt-4 leading-relaxed text-zinc-400">Your submission has been saved. Keep this reference if you need to contact us about it. Your listing will appear after editorial acceptance and publication.</p>
    <div className="mt-6 rounded-xl border border-white/15 bg-black/30 p-4"><p className="text-xs text-zinc-400">Submission reference</p><p className="mt-2 break-all font-mono text-sm text-white">{receipt.id}</p><button type="button" onClick={async () => { try { await navigator.clipboard.writeText(receipt.id); setCopied(true); } catch { setError("Copy the reference above manually."); } }} className="mt-3 inline-flex items-center gap-2 text-sm text-[#C6FF3D]"><Copy className="h-4 w-4" />{copied ? "Copied" : "Copy reference"}</button></div>
    {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
    <div className="mt-7 flex flex-wrap gap-5 text-sm text-[#C6FF3D]"><Link href="/brands">Explore the directory →</Link><Link href="/contact">Contact the editorial team</Link></div>
  </section>;

  return <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
    <noscript className="hidden"><style>{`.brand-submission-form { display: none !important; }`}</style></noscript>
    <form method="post" action="/api/inquiries" onSubmit={submit} className="brand-submission-form min-w-0 space-y-6" aria-label="Add your brand">
      <fieldset disabled={busy} className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0e11] p-6 sm:p-8">
        <legend className="px-2 font-display text-xl font-semibold text-white"><span className="mr-3 font-mono text-sm text-[#C6FF3D]">01</span>The essentials</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-zinc-300" htmlFor="brand-name">Brand name <span aria-hidden="true">*</span><input id="brand-name" name="toolName" required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} placeholder="Your product or company" autoComplete="organization" className={fieldClass} /></label>
          <label className="text-sm text-zinc-300" htmlFor="brand-url">Official website <span aria-hidden="true">*</span><input id="brand-url" name="websiteUrl" type="url" pattern="https://.*" required maxLength={2000} value={url} onChange={event => setUrl(event.target.value)} placeholder="https://yourbrand.com" autoComplete="url" className={fieldClass} /></label>
        </div>
        {match && <p role="status" className="rounded-xl border border-[#C6FF3D]/25 p-4 text-sm text-zinc-300">{match.name} already has a profile. <Link href={`/tools/${match.slug}`} className="text-[#C6FF3D] underline">View the listing</Link> or <Link href="/contact" className="text-[#C6FF3D] underline">request an update</Link>. Submit here only if this is a different product.</p>}
        <label className="block text-sm text-zinc-300" htmlFor="brand-tagline">Short product description <span aria-hidden="true">*</span><textarea id="brand-tagline" name="tagline" required minLength={60} maxLength={300} rows={3} value={tagline} onChange={event => setTagline(event.target.value)} placeholder="Explain what your product does and who it is for in one or two clear sentences." className={fieldClass} /><span className="mt-2 block text-xs text-zinc-500">60–300 characters · {tagline.length}/300</span></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-zinc-300" htmlFor="brand-category">Category <span aria-hidden="true">*</span><select id="brand-category" name="categorySlug" required value={category} onChange={event => setCategory(event.target.value)} className={fieldClass}><option value="" disabled>Choose the closest fit</option>{CATEGORIES.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></label>
          <label className="text-sm text-zinc-300" htmlFor="brand-pricing">Pricing model <span aria-hidden="true">*</span><select id="brand-pricing" name="pricingModel" value={pricing} onChange={event => setPricing(event.target.value)} className={fieldClass}>{BRAND_PRICING_MODELS.map(value => <option key={value}>{value}</option>)}</select></label>
        </div>
      </fieldset>
      <fieldset disabled={busy} className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0e11] p-6 sm:p-8">
        <legend className="px-2 font-display text-xl font-semibold text-white"><span className="mr-3 font-mono text-sm text-[#C6FF3D]">02</span>Give readers the useful details</legend>
        <label className="block text-sm text-zinc-300" htmlFor="brand-source">Official pricing or documentation URL <span aria-hidden="true">*</span><input id="brand-source" name="pricingUrl" type="url" pattern="https://.*" required maxLength={2000} placeholder="https://yourbrand.com/pricing" className={fieldClass} /></label>
        <label className="block text-sm text-zinc-300" htmlFor="brand-description">What problem does it solve? <span aria-hidden="true">*</span><textarea id="brand-description" name="differentiator" required minLength={200} maxLength={8000} rows={6} placeholder="Describe a real use case, the intended audience, how the product helps, and any important limits. Specific details help us write a useful profile." className={fieldClass} /><span className="mt-2 block text-xs text-zinc-500">200–8,000 characters. Use original copy and avoid unsupported claims.</span></label>
        <label className="block text-sm text-zinc-300" htmlFor="brand-features">Key features <span aria-hidden="true">*</span><textarea id="brand-features" name="keyFeatures" required maxLength={1300} rows={4} placeholder={"One feature per line\nInclude at least three distinct features\nDescribe the capability in plain language"} className={fieldClass} /><span className="mt-2 block text-xs text-zinc-500">3–8 features, each 5–160 characters.</span></label>
      </fieldset>
      <fieldset disabled={busy} className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0e11] p-6 sm:p-8">
        <legend className="px-2 font-display text-xl font-semibold text-white"><span className="mr-3 font-mono text-sm text-[#C6FF3D]">03</span>How we can reach you</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm text-zinc-300" htmlFor="brand-contact">Your name <span aria-hidden="true">*</span><input id="brand-contact" name="contactName" required minLength={2} maxLength={100} autoComplete="name" className={fieldClass} /></label>
          <label className="text-sm text-zinc-300" htmlFor="brand-email">Contact email <span aria-hidden="true">*</span><input id="brand-email" name="founderEmail" type="email" required maxLength={254} autoComplete="email" className={fieldClass} /><span className="mt-2 block text-xs text-zinc-500">Used for review correspondence; kept off your public profile.</span></label>
        </div>
        <label className="block text-sm text-zinc-300" htmlFor="brand-relationship">Your relationship to the brand <span aria-hidden="true">*</span><select id="brand-relationship" name="relationship" required defaultValue="" className={fieldClass}><option value="" disabled>Choose one</option>{BRAND_RELATIONSHIPS.map(value => <option key={value}>{value}</option>)}</select></label>
        <div className="hidden" aria-hidden="true"><label>Leave this field empty<input name="companyWebsite" tabIndex={-1} autoComplete="off" /></label></div>
        <label className="flex items-start gap-3 text-sm leading-relaxed text-zinc-400"><input name="consent" type="checkbox" required className="mt-1 h-4 w-4 shrink-0 accent-[#C6FF3D]" /><span>I can share these details for review and agree to the <Link href="/terms" className="text-zinc-200 underline">terms</Link> and <Link href="/privacy" className="text-zinc-200 underline">privacy policy</Link>. SaaSFolio may contact me about this submission. Editorial acceptance and publication are separate steps.</span></label>
      </fieldset>
      {!available && <p className="rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm leading-relaxed text-amber-100">Online submissions are temporarily unavailable. This form prepares a complete email for review. You will need to send it from your email app; it will not create a submission reference here.</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-400/30 p-4 text-sm text-rose-300">{error}</p>}
      <button type="submit" disabled={busy} className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#C6FF3D] px-7 py-4 font-semibold text-black transition hover:bg-[#d7ff77] disabled:opacity-60">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}{busy ? "Saving your submission…" : available ? "Submit brand for review" : "Open submission email"}</button>
      <p className="text-xs text-zinc-500">All fields are required. A standard submission is free. <a href={emailHref} data-inquiry-email-draft="submission" className="text-zinc-300 underline">Prefer to email the details?</a></p>
    </form>
    <aside className="space-y-5 lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#101114]">
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4"><p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">Your listing preview</p><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-zinc-500">Draft</span></div>
        <div className="space-y-5 p-6"><div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/10 font-display text-2xl font-semibold text-[#C6FF3D]">{name.trim().charAt(0).toUpperCase() || <Globe2 className="h-6 w-6" />}</div><div><p className="mb-2 text-xs text-[#C6FF3D]">{CATEGORIES.find(item => item.slug === category)?.name || "Your category"}</p><h2 className="break-words font-display text-2xl font-bold text-white">{name || "Your brand, right here."}</h2></div><p className="break-words text-sm leading-relaxed text-zinc-400">{tagline || "A clear description makes it easier for the right people to find your product. Fill in the essentials to preview it."}</p><div className="flex items-center justify-between gap-3 border-t border-white/10 pt-4 text-xs text-zinc-400"><span>{pricing}</span><span className="flex min-w-0 items-center gap-2"><span className="truncate">{hostname(url) || "yourbrand.com"}</span><ExternalLink className="h-3 w-3 shrink-0" /></span></div></div>
      </div>
      <p className="px-2 text-xs leading-relaxed text-zinc-500">Preview only. Our editors may revise the copy, choose a different category, or request more information. Submitted details are claims to assess, not a verified review.</p>
      <noscript><p className="px-2 text-sm text-zinc-300">Enable JavaScript to use the form, or <a href={emailHref} className="text-[#C6FF3D] underline">submit your brand by email</a>.</p></noscript>
    </aside>
  </div>;
}

"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/api-client";
import { PROMOTION_EMAIL, PROMOTION_PLANS, type PromotionPlan } from "@/lib/brand-promotion";

type Verification = { dnsName: string; dnsValue: string; approved: boolean; status?: "checked" | "record_not_found" };
const inputClass = "mt-2 block w-full rounded-xl border border-white/15 bg-[#08090b] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]";
const primaryClass = "rounded-xl bg-[#C6FF3D] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50";

export function BrandPromotionForm({ verificationAvailable }: { verificationAvailable: boolean }) {
  const [receipt, setReceipt] = useState("");
  const [email, setEmail] = useState("");
  const [verification, setVerification] = useState<Verification>();
  const [plan, setPlan] = useState<PromotionPlan>("monthly");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const selected = PROMOTION_PLANS[plan];
  const subject = `SaaSFolio brand promotion · ${selected.name} ($${selected.price} USD)`;
  const body = "Hi SaaSFolio,\n\nI'd like to arrange a sponsored brand placement.\n\nBrand name:\nOfficial website:\n\nThanks!";
  const inquiryLink = `mailto:${PROMOTION_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  async function verify(action: "instructions" | "verify") {
    setBusy(true); setError("");
    try { setVerification(await apiRequest<Verification>("/api/brands/verify", { receipt, email, action })); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "The submission could not be checked."); }
    finally { setBusy(false); }
  }

  return <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
    <section id="verify" aria-labelledby="verify-brand-title" className="scroll-mt-28 space-y-5 rounded-2xl border border-white/15 bg-[#0d0e11] p-5 sm:p-7">
      <h2 id="verify-brand-title" className="font-display text-2xl font-bold text-white">Verify your brand</h2>
      {verificationAvailable
        ? <form onSubmit={event => { event.preventDefault(); void verify("instructions"); }} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            <label className="block text-sm text-zinc-300">Submission reference<input required maxLength={36} className={inputClass} value={receipt} onChange={event => { setReceipt(event.target.value); setVerification(undefined); setError(""); }} /></label>
            <label className="block text-sm text-zinc-300">Email used to submit the brand<input type="email" autoComplete="email" required maxLength={254} className={inputClass} value={email} onChange={event => { setEmail(event.target.value); setVerification(undefined); setError(""); }} /></label>
            <button className={primaryClass} type="submit">Get verification instructions</button>
          </fieldset>
        </form>
        : <p className="text-sm text-zinc-400">Online verification is unavailable. You can still submit a brand for review.</p>}
      {verification && <div className="space-y-3 rounded-xl border border-white/15 bg-black/25 p-4 text-sm text-zinc-300">
        {verification.approved && <p role="status" className="font-semibold text-[#C6FF3D]">Your brand has been approved for the directory.</p>}
        <p>Add this TXT record in your domain’s DNS settings so we can confirm you manage the website.</p>
        <dl className="grid gap-2">
          <div><dt className="text-zinc-400">Record name</dt><dd><code className="break-all text-white">{verification.dnsName}</code></dd></div>
          <div><dt className="text-zinc-400">TXT value</dt><dd><code className="break-all text-white">{verification.dnsValue}</code></dd></div>
        </dl>
        {!verification.approved && <button disabled={busy} className={primaryClass} type="button" onClick={() => void verify("verify")}>Check domain and approve</button>}
        {!verification.approved && verification.status === "record_not_found" && <p role="status">The TXT record hasn’t been found. Check the value or try again after DNS updates.</p>}
        {!verification.approved && verification.status === "checked" && <p role="status">Domain verified. Your submission is pending manual review.</p>}
      </div>}
      {busy && <p role="status" className="text-sm text-zinc-400">Checking your request…</p>}
      {error && <p role="alert" className="rounded-xl border border-rose-400/35 p-3 text-sm text-rose-300">{error}</p>}
    </section>
    <section aria-labelledby="promotion-plan-title" className="space-y-4 rounded-2xl border border-[#C6FF3D]/25 bg-[#11150c] p-5 sm:p-7">
      <h2 id="promotion-plan-title" className="font-display text-2xl font-bold text-white">Choose a promotion period</h2>
      <fieldset className="grid gap-3">
        <legend className="sr-only">Billing frequency</legend>
        {(Object.keys(PROMOTION_PLANS) as PromotionPlan[]).map(option => {
          const details = PROMOTION_PLANS[option];
          return <label key={option} className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/15 bg-black/25 p-4 has-checked:border-[#C6FF3D]">
            <span className="flex items-center gap-2 text-sm font-semibold text-zinc-300"><input type="radio" name="plan" checked={plan === option} onChange={() => setPlan(option)} className="accent-[#C6FF3D]" />{details.name}</span>
            <span className="text-sm text-zinc-300"><strong className="text-lg text-white">${details.price}</strong> USD / {details.interval}</span>
          </label>;
        })}
      </fieldset>
      <p className="text-sm leading-relaxed text-zinc-300">Email us to arrange placement and payment for your chosen period. To extend it, contact us again.</p>
      <a className={`inline-flex ${primaryClass}`} href={inquiryLink}>Email about ${selected.name.toLowerCase()} promotion</a>
      <p className="break-all text-sm text-zinc-400">{PROMOTION_EMAIL}</p>
    </section>
  </div>;
}

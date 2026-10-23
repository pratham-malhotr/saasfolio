"use client";

import { useId, useState } from "react";
import { compareAnnualBilling } from "@/lib/savings.mjs";

export function SavingsCalculator({ brand }: { brand?: string }) {
  const id = useId();
  const [monthly, setMonthly] = useState("");
  const [annual, setAnnual] = useState("");
  const [fee, setFee] = useState("");
  const [currency, setCurrency] = useState("USD");
  const filled = monthly.trim() !== "" && annual.trim() !== "";
  const result = filled ? compareAnnualBilling(Number(monthly), Number(annual), fee.trim() ? Number(fee) : 0) : null;
  const money = (value: number) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
  return <section id="compare-costs" className="scroll-mt-28 rounded-3xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/[0.025] p-6 sm:p-8 space-y-6" aria-labelledby={`${id}-title`}>
    <div className="max-w-3xl space-y-3">
      <p className="font-mono text-xs uppercase tracking-widest text-[#C6FF3D]">Compare the full commitment</p>
      <h2 id={`${id}-title`} className="font-display text-2xl font-bold text-white">{brand ? `Is ${brand} annual billing worth it?` : "Compare monthly and annual software costs"}</h2>
      <p className="text-sm leading-relaxed text-zinc-400">Enter the provider’s current quotes for the same plan and usage. Add any membership or access fee needed for the annual offer. No prices or discounts are assumed.</p>
    </div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[{ key: "monthly", label: "Monthly plan price", value: monthly, change: setMonthly }, { key: "annual", label: "Annual plan total", value: annual, change: setAnnual }, { key: "fee", label: "Annual offer access fee (optional)", value: fee, change: setFee }].map(field => <div key={field.key} className="space-y-2">
        <label htmlFor={`${id}-${field.key}`} className="block text-sm text-zinc-300">{field.label}</label>
        <input id={`${id}-${field.key}`} name={field.key} type="number" min={field.key === "monthly" ? "0.01" : "0"} max="1000000000" step="0.01" inputMode="decimal" value={field.value} onChange={event => field.change(event.target.value)} placeholder={field.key === "fee" ? "0" : "Enter quoted price"} className="w-full rounded-xl border border-white/15 bg-[#09090C] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]" />
      </div>)}
      <div className="space-y-2"><label htmlFor={`${id}-currency`} className="block text-sm text-zinc-300">Quote currency</label><select id={`${id}-currency`} value={currency} onChange={event => setCurrency(event.target.value)} className="w-full rounded-xl border border-white/15 bg-[#09090C] px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-[#C6FF3D]">{["USD", "EUR", "GBP", "INR", "CAD", "AUD"].map(code => <option key={code}>{code}</option>)}</select></div>
    </div>
    <div aria-live="polite" aria-atomic="true" data-savings-result>
      {result ? <div className="space-y-4">
        <dl className="grid gap-4 sm:grid-cols-3">{[{ label: "12 monthly payments", value: money(result.monthlyTotal) }, { label: "Annual payment + access fee", value: money(result.annualTotal) }, { label: "Annual effective monthly cost", value: money(result.effectiveMonthly) }].map(item => <div key={item.label} className="rounded-2xl border border-white/10 bg-black/30 p-4"><dt className="text-xs text-zinc-400">{item.label}</dt><dd className="mt-2 font-display text-2xl font-bold text-white">{item.value}</dd></div>)}</dl>
        <p className="text-base font-semibold text-[#C6FF3D]">{Math.abs(result.saving) < 0.005 ? "Both options cost the same over 12 months." : result.saving > 0 ? `Annual billing saves ${money(result.saving)} (${result.savingPercent.toFixed(1)}%) over 12 months after the access fee.` : `The annual option costs ${money(Math.abs(result.saving))} more over 12 months after the access fee.`}</p>
      </div> : <p className="text-sm text-zinc-400">{filled ? "Enter a monthly price above zero and non-negative annual and fee amounts." : "Add both quoted prices to see the 12-month comparison."}</p>}
    </div>
    <p className="text-xs leading-relaxed text-zinc-500">This compares 12 months at unchanged prices. Annual billing is paid upfront. Check renewal prices, cancellation terms, taxes, add-ons and usage limits separately. The currency selector formats your quotes; it does not convert currencies. This calculation does not apply or validate a coupon.</p>
  </section>;
}

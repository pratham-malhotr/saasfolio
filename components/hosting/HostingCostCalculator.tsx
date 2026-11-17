"use client";

import { useState } from "react";
import { calculateHostingCost, type HostingQuote } from "@/lib/hosting";

const fields: { key: keyof HostingQuote; label: string; hint: string }[] = [
  { key: "introRate", label: "First-term monthly equivalent", hint: "Amount in your quote" },
  { key: "introMonths", label: "Prepaid first-term months", hint: "Whole months, 1–120" },
  { key: "renewalRate", label: "Renewal monthly equivalent", hint: "Use the same currency" },
  { key: "monthlyExtras", label: "Monthly running extras", hint: "Backups, email, storage, etc." },
  { key: "setup", label: "One-time costs", hint: "Setup, migration or licences" },
];
type Inputs = Record<keyof HostingQuote, string>;
const examples: Inputs[] = [ { introRate: "3", introMonths: "12", renewalRate: "15", monthlyExtras: "0", setup: "0" }, { introRate: "7", introMonths: "12", renewalRate: "7", monthlyExtras: "0", setup: "0" } ];
const money = (value: number, currency: string) => new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 2 }).format(value);
export function HostingCostCalculator() {
  const [quotes, setQuotes] = useState(examples);
  const [months, setMonths] = useState(24);
  const [currency, setCurrency] = useState("USD");
  const totals = quotes.map(quote => calculateHostingCost(Object.fromEntries(Object.entries(quote).map(([key, value]) => [key, value.trim() ? Number(value) : NaN])) as unknown as HostingQuote, months));
  return <section id="cost-calculator" className="scroll-mt-28 rounded-3xl border border-white/10 bg-[#101216] p-5 sm:p-8">
    <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="hosting-eyebrow">The number after the sale</p><h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-white">What will your hosting really cost?</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">Compare the prepaid commitment, renewal and the extras you need. The starting amounts are fictional examples, not provider prices.</p></div>
      <div className="flex gap-3"><label className="text-xs text-zinc-400">Compare over<select value={months} onChange={e => setMonths(Number(e.target.value))} className="hosting-input mt-2"><option value={12}>12 months</option><option value={24}>24 months</option><option value={36}>36 months</option><option value={48}>48 months</option></select></label><label className="text-xs text-zinc-400">Currency<select value={currency} onChange={e => setCurrency(e.target.value)} className="hosting-input mt-2"><option>USD</option><option>INR</option><option>EUR</option><option>GBP</option></select></label></div>
    </div>
    <div className="mt-8 grid gap-5 md:grid-cols-2">{quotes.map((quote, index) => <fieldset key={index} className="min-w-0 rounded-2xl border border-white/10 p-5"><legend className="px-2 font-display text-lg text-white">Plan {index === 0 ? "A" : "B"}</legend><div className="grid gap-4 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="text-xs leading-5 text-zinc-300">{field.label}<input type="number" inputMode={field.key === "introMonths" ? "numeric" : "decimal"} min={field.key === "introMonths" ? 1 : 0} max={field.key === "introMonths" ? 120 : 1000000} step={field.key === "introMonths" ? 1 : "0.01"} value={quote[field.key]} onChange={e => setQuotes(previous => previous.map((old, i) => i === index ? { ...old, [field.key]: e.target.value } : old))} className="hosting-input mt-2" /><span className="mt-1 block text-[10px] text-zinc-500">{field.hint}</span></label>)}</div>
      {totals[index] && <dl className="mt-6 space-y-2 border-t border-white/10 pt-4 text-xs text-zinc-400"><div className="flex justify-between gap-3"><dt>Full first-term commitment</dt><dd>{money(totals[index]!.upfront, currency)}</dd></div><div className="flex justify-between gap-3"><dt>Renewal within {months} months</dt><dd>{money(totals[index]!.renewal, currency)}</dd></div><div className="flex justify-between gap-3"><dt>Extras and one-time costs</dt><dd>{money(totals[index]!.extras, currency)}</dd></div><div className="flex justify-between gap-3 pt-3 text-base font-semibold text-white"><dt>Total budget</dt><dd>{money(totals[index]!.total, currency)}</dd></div></dl>}
    </fieldset>)}</div>
    <div aria-live="polite" aria-atomic="true" className="mt-5 rounded-xl border border-[#C6FF3D]/20 bg-[#C6FF3D]/5 p-5 text-sm text-[#C6FF3D]">{totals[0] && totals[1] ? totals[0].total === totals[1].total ? "Both plans have the same total with these inputs." : `Plan ${totals[0].total < totals[1].total ? "A" : "B"} costs ${money(Math.abs(totals[0].total - totals[1].total), currency)} less with these inputs.` : "Enter valid, nonnegative amounts and a whole first-term length from 1 to 120 months to compare."}</div>
    <p className="mt-4 text-xs leading-6 text-zinc-500">Use the same currency for both quotes. Changing the label does not convert amounts. This model includes the entire prepaid first term even if it extends beyond the horizon, then allocates renewal by month. If renewal requires a longer prepaid term, budget that full commitment separately. Add applicable tax and usage costs to your inputs.</p>
  </section>;
}

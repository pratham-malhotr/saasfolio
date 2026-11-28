"use client";

import { useState } from "react";
import { trackProductEvent } from "@/lib/client-analytics";
import { estimateFirecrawlCosts } from "@/lib/firecrawl-cost.mjs";

const number = new Intl.NumberFormat("en-US");
const dollars = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const control = "mt-2 min-h-11 w-full rounded-lg border border-white/20 bg-black/30 px-3 text-white";

export function FirecrawlCalculator() {
  const [pages, setPages] = useState("500");
  const [runs, setRuns] = useState("4");
  const [format, setFormat] = useState("1");
  const estimate = estimateFirecrawlCosts(Number(pages), Number(runs), Number(format));

  return <section aria-label="Firecrawl workload calculator" className="space-y-5 rounded-2xl border border-white/10 bg-[#09090C] p-5 sm:p-7">
    <div className="grid gap-4 sm:grid-cols-3">
      <label className="text-sm font-semibold text-zinc-200">Pages per run
        <input className={control} inputMode="numeric" type="number" min="1" step="1" value={pages} onChange={event => setPages(event.target.value)} />
      </label>
      <label className="text-sm font-semibold text-zinc-200">Runs per month
        <input className={control} inputMode="numeric" type="number" min="1" step="1" value={runs} onChange={event => setRuns(event.target.value)} />
      </label>
      <label className="text-sm font-semibold text-zinc-200">Scrape or crawl output
        <select className={control} value={format} onChange={event => setFormat(event.target.value)}>
          <option value="1">Basic (1 credit/page)</option>
          <option value="5">JSON, Question or Highlight (5)</option>
        </select>
      </label>
    </div>
    <p role="status" aria-live="polite" className="text-lg text-white">{estimate
      ? <><strong>{number.format(estimate.credits)}</strong> estimated credits per month</>
      : "Enter positive whole numbers for pages per run and runs per month."}</p>
    {estimate && <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full min-w-[470px] text-left text-sm text-zinc-300">
        <caption className="sr-only">Firecrawl monthly plan costs for the estimated workload, in US dollars</caption>
        <thead className="text-white"><tr>{["Plan", "Included credits", "Base price", "Extra credits cost", "Monthly total"].map(label => <th scope="col" className="p-3" key={label}>{label}</th>)}</tr></thead>
        <tbody>{estimate.plans.map(plan => <tr key={plan.name} className="border-t border-white/10">
          <th scope="row" className="p-3 font-medium text-white">{plan.name}</th>
          <td className="p-3">{number.format(plan.included)}</td>
          <td className="p-3">{dollars.format(plan.monthlyPrice)}</td>
          <td className="p-3">{plan.total === null ? "Unavailable" : dollars.format(plan.overage)}</td>
          <td className="p-3 font-semibold">{plan.total === null ? "Over limit" : dollars.format(plan.total)}</td>
        </tr>)}</tbody>
      </table>
    </div>}
    <p className="text-sm leading-relaxed text-zinc-400">USD, before tax. Paid estimates assume pay-as-you-go is enabled and its spend cap can cover the extra credits. First-purchase savings and unused credit balances are excluded.</p>
  </section>;
}

export function FirecrawlPartnerLink() {
  // Through /go/ like every partner CTA, so the click is attributed and counted.
  // /go/ is a redirect route handler, not a page, so a plain anchor is correct.
  // eslint-disable-next-line @next/next/no-html-link-for-pages
  return <a href="/go/firecrawl" rel="sponsored nofollow" className="text-[#C6FF3D] underline underline-offset-4"
    onClick={() => trackProductEvent("affiliate_outbound_click", { partner: "firecrawl" })}>Get 10% off your first Firecrawl purchase via our partner link</a>;
}

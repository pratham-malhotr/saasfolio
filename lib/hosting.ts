import type { HostingProvider } from "@/lib/data/hosting-providers";

export interface HostingQuote { introRate: number; introMonths: number; renewalRate: number; monthlyExtras: number; setup: number }
export function calculateHostingCost(quote: HostingQuote, months: number) {
  if (!Number.isInteger(months) || months < 1 || months > 120 || !Number.isInteger(quote.introMonths) || quote.introMonths < 1 || quote.introMonths > 120 ||
    !Object.values(quote).every(value => Number.isFinite(value) && value >= 0 && value <= 1_000_000)) return undefined;
  // Include the full prepaid first term even if it outlasts the comparison.
  const upfront = quote.introRate * quote.introMonths;
  const renewalMonths = Math.max(0, months - quote.introMonths);
  const renewal = renewalMonths * quote.renewalRate;
  const extras = months * quote.monthlyExtras + quote.setup;
  return { total: upfront + renewal + extras, upfront, renewal, extras, renewalMonths };
}
export function filterHostingProviders(providers: HostingProvider[], query: string, kind: string, workload: string, managedOnly: boolean) {
  const search = query.trim().toLowerCase();
  return providers.filter(p => (!search || `${p.name} ${p.fit} ${p.kind} ${p.management}`.toLowerCase().includes(search)) &&
    (kind === "all" || p.kind === kind) && (workload === "all" || p.workloads.some(w => w === workload)) &&
    (!managedOnly || p.kind !== "VPS" && p.slug !== "coolify"));
}

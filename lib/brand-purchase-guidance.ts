import type { DetailedTool } from "@/lib/types";
import type { BrandDiscountGuide } from "@/lib/data/brand-discount-guides";
import type { BrandPurchaseChecks } from "@/lib/data/brand-purchase-checks";

// These are evaluation questions, not assertions that old provider policies
// remain in force. Keep useful guidance when dated price observations expire.
export function evergreenPurchaseChecks(tool: DetailedTool, guide?: BrandDiscountGuide): BrandPurchaseChecks {
  const routes = guide?.decisionRows.slice(0, 3) || [];
  return {
    eligibility: routes.map(row => ({
      label: row.option,
      detail: `If your requirement is ${row.bestFor.charAt(0).toLowerCase() + row.bestFor.slice(1)}, ask ${tool.name} which current account and package qualify. Use the option as a comparison checklist; the earlier guide does not establish today's plan entitlement.`,
    })),
    troubleshooting: [
      { problem: `The ${tool.name} code does not match your selected package`, action: `Compare the offer's exact account, product and billing restrictions with your selected ${tool.name} package. Save the provider's error message without account or payment information, and ask support to confirm the eligible route before purchasing.` },
      { problem: `The ${tool.name} invoice differs from the expected saving`, action: `Separate the base subscription from usage, add-ons and taxes. Check whether the offer applies to the first payment or a later renewal. Ask ${tool.name} for a current quote rather than assuming an earlier promotion still applies.` },
    ],
  };
}

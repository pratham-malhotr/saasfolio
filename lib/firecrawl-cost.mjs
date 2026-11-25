export const FIRECRAWL_PRICING = "https://www.firecrawl.dev/pricing";
export const FIRECRAWL_CALCULATOR_PATH = "/firecrawl-pricing-calculator";

const plans = [
  { name: "Free", monthlyPrice: 0, included: 1_000, creditsPerBlock: 0 },
  { name: "Hobby", monthlyPrice: 19, included: 5_000, creditsPerBlock: 1_000 },
  { name: "Standard", monthlyPrice: 99, included: 100_000, creditsPerBlock: 2_000 },
  { name: "Growth", monthlyPrice: 399, included: 500_000, creditsPerBlock: 2_500 },
  { name: "Scale", monthlyPrice: 749, included: 1_000_000, creditsPerBlock: 5_000 },
];

export function estimateFirecrawlCosts(pages, runs, creditsPerPage) {
  if (![pages, runs, creditsPerPage].every(value => Number.isSafeInteger(value) && value > 0)) return null;
  const credits = pages * runs * creditsPerPage;
  if (!Number.isSafeInteger(credits)) return null;
  return {
    credits,
    plans: plans.map(plan => {
      const extraCredits = Math.max(0, credits - plan.included);
      const overage = plan.creditsPerBlock ? Math.ceil(extraCredits / plan.creditsPerBlock) * 5 : 0;
      return { ...plan, overage, total: extraCredits > 0 && !plan.creditsPerBlock ? null : plan.monthlyPrice + overage };
    }),
  };
}

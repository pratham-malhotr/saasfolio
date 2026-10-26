// Multiple query variants belong to one substantive canonical brand guide.
// These are content targets, not search volumes or measured Google positions.
export function getBrandSearchIntents(name: string, billingModel?: "subscription" | "usage", hasAnnualSavings = false) {
  return [
    { id: "discount-code", query: `${name} discount code`, section: "discount-answer" },
    { id: "promo-code", query: `${name} promo code`, section: "discount-availability" },
    { id: "best-discount", query: `best discount for ${name}`, section: "best-discount" },
    { id: "billing-savings", query: billingModel === "usage" ? `${name} usage pricing discounts` : hasAnnualSavings ? `${name} annual discount` : `${name} pricing discounts`, section: "plan-fit" },
    { id: "redemption", query: `how to get a ${name} discount`, section: "redemption" },
    { id: "eligibility", query: `${name} discount eligibility`, section: "eligibility" },
    { id: "code-help", query: `${name} discount code not working`, section: "coupon-help" },
    { id: "renewal", query: billingModel === "usage" ? `${name} ongoing usage costs` : `${name} discount renewal price`, section: "saving-guide" },
    { id: "free-access", query: `${name} free trial vs discount`, section: "discount-availability" },
  ];
}

export const PROMOTION_PLANS = {
  monthly: { name: "Monthly", price: 49, interval: "month" },
  annual: { name: "Yearly", price: 349, interval: "year" },
} as const;

export type PromotionPlan = keyof typeof PROMOTION_PLANS;

export const PROMOTION_EMAIL = "prathammalhotracsai@gmail.com";

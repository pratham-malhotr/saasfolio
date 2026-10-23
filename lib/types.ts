export interface PricingPlan {
  name: string;
  priceMonthly: number;
  priceYearly: number;
  features: string[];
  popular?: boolean;
}

export interface ToolAlternative {
  name: string;
  slug: string;
  tagline: string;
  rating: number;
}

export interface ToolReview {
  id: string;
  author: string;
  authorTitle: string;
  avatar: string;
  rating: number;
  date: string;
  content: string;
  pros: string[];
  cons: string[];
}

export interface SaaSDeal {
  id: string;
  title: string;
  slug: string;
  toolName: string;
  toolSlug: string;
  category: string;
  categorySlug: string;
  discountPercentage: number;
  discountKind?: "exact" | "up-to";
  dealType: "coupon" | "lifetime" | "free_trial" | "free_plan" | "offer" | "pricing";
  code?: string;
  originalPrice?: number;
  dealPrice?: number;
  billingPeriod?: "monthly" | "yearly" | "one-time";
  description: string;
  terms: string;
  badge?: "HOT" | "VERIFIED" | "EXCLUSIVE" | "LIMITED";
  expiryDate: string; // ISO format
  successRate: number; // percentage, e.g. 98
  votesUp: number;
  votesDown: number;
  verifiedAt: string;
  revealsCount: number;
  affiliateUrl: string;
  featured?: boolean;
  sourceUrl?: string;
  sourceKind?: "vendor" | "coupon-site";
  checkedAt?: string;
  updatedAt?: string;
  evidence?: string;
  destinationUrl?: string;
  checkoutTested?: boolean;
}

export interface DetailedTool {
  id: string;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  longDescription: string;
  category: string;
  categorySlug: string;
  website: string;
  logoLetter: string;
  rating: number;
  reviewCount: number;
  pricingStart: number;
  pricingModel: "Free Trial" | "Freemium" | "Paid" | "Open Source";
  verified: boolean;
  bestFor: string;
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  pricingPlans: PricingPlan[];
  alternatives: ToolAlternative[];
  reviews: ToolReview[];
  dealsCount: number;
  tier?: "popular" | "mid-tier" | "indie-budget";
  sourceUrl?: string;
  pricingUrl?: string;
  pricingVerified?: boolean;
  providerStatus?: "unavailable";
  providerNote?: string;
  updatedAt?: string;
}

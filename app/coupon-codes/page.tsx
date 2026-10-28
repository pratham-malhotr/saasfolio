import { SavingsCollectionPage, savingsCollectionMetadata } from "@/components/seo/SavingsCollectionPage";

export const metadata = savingsCollectionMetadata("coupon-codes");
export const revalidate = 3600;

export default function Page() {
  return <SavingsCollectionPage slug="coupon-codes" />;
}

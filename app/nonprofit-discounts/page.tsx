import { SavingsCollectionPage, savingsCollectionMetadata } from "@/components/seo/SavingsCollectionPage";

export const metadata = savingsCollectionMetadata("nonprofit-discounts");
export const revalidate = 3600;

export default function Page() {
  return <SavingsCollectionPage slug="nonprofit-discounts" />;
}

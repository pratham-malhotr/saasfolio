import { SavingsCollectionPage, savingsCollectionMetadata } from "@/components/seo/SavingsCollectionPage";

export const metadata = savingsCollectionMetadata("startup-deals");
export const revalidate = 3600;

export default function Page() {
  return <SavingsCollectionPage slug="startup-deals" />;
}

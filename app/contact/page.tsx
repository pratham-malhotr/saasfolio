import ContactClient from "@/components/contact/ContactClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: 'Contact SaaSFolio',
  description: 'Contact SaaSFolio for help with software discounts, SaaS listings, editorial reviews, partnerships and account questions.',
  path: "/contact",
});

export default function Page() {
  return <ContactClient />;
}

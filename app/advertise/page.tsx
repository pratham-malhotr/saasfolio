import AdvertiseClient from "@/components/advertise/AdvertiseClient";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: 'Advertise Your SaaS on SaaSFolio',
  description: 'Explore SaaSFolio advertising, featured software listings and sponsorship opportunities for reaching people researching SaaS tools and discounts.',
  path: "/advertise",
});

export default function Page() {
  return <AdvertiseClient />;
}

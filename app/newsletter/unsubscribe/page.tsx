import { UnsubscribeClient } from "@/components/auth/UnsubscribeClient";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Unsubscribe from the newsletter", description: "Manage your SaaSFolio newsletter subscription.", path: "/newsletter/unsubscribe", noIndex: true });
export default async function UnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  return <div className="max-w-xl mx-auto px-6 pt-36 pb-24"><UnsubscribeClient token={/^[0-9a-f]{64}$/.test(token || "") ? token! : ""} /></div>;
}

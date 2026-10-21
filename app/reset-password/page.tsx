import { Suspense } from "react";
import { AuthClient } from "@/components/auth/AuthClient";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata({ title: "Reset your password", description: "Choose a new password for your SaaSFolio account.", path: "/reset-password", noIndex: true });
export default function ResetPasswordPage() {
  return <Suspense fallback={<p className="pt-32 text-center">Loading…</p>}><AuthClient initialMode="password" /></Suspense>;
}

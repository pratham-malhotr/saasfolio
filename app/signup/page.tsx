import { pageMetadata } from "@/lib/seo";
import React, { Suspense } from "react";
import { AuthClient } from "@/components/auth/AuthClient";

export const metadata = pageMetadata({
  title: 'Create an Account',
  description: 'Create a SaaSFolio account to save software deals and take part in SaaS discussions.',
  path: "/signup",
  noIndex: true,
});

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs">
          Loading registration portal...
        </div>
      }
    >
      <AuthClient initialMode="signup" />
    </Suspense>
  );
}

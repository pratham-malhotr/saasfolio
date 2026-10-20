import { pageMetadata } from "@/lib/seo";
import React, { Suspense } from "react";
import { AuthClient } from "@/components/auth/AuthClient";

export const metadata = pageMetadata({
  title: 'Sign In',
  description: 'Sign in to SaaSFolio to access saved software deals, bookmarks and community discussions.',
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#050505] flex items-center justify-center text-zinc-400 font-mono text-xs">
          Loading authentication portal...
        </div>
      }
    >
      <AuthClient initialMode="login" />
    </Suspense>
  );
}

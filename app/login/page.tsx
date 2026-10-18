import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthClient } from "@/components/auth/AuthClient";

export const metadata: Metadata = {
  title: "Sign In — SaaSFolio | Access Deals, Bookmarks & Discussions",
  description: "Sign in to SaaSFolio to reveal exclusive SaaS promo codes, save architectural guides, and engage with the community.",
};

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

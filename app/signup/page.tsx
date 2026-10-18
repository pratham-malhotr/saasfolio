import React, { Suspense } from "react";
import { Metadata } from "next";
import { AuthClient } from "@/components/auth/AuthClient";

export const metadata: Metadata = {
  title: "Create Pro Account — SaaSFolio | Free Membership",
  description: "Join 10,000+ founders and engineers finding verified software deals, coupons, and benchmarks on SaaSFolio.",
};

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

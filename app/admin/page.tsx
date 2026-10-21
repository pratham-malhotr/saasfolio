import { pageMetadata } from "@/lib/seo";
import React from "react";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { currentUser, isAdmin } from "@/lib/server/supabase";
import Link from "next/link";

export const metadata = pageMetadata({
  title: 'Admin Dashboard',
  description: 'SaaSFolio administration dashboard.',
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  const user = await currentUser();
  if (!isAdmin(user)) return <div className="max-w-xl mx-auto px-6 pt-36 pb-24 space-y-5"><h1 className="font-display text-3xl font-bold text-white">Administrator access required</h1><p className="text-zinc-400">This area is restricted to authorized SaaSFolio administrators.</p><Link href="/login?redirect=/admin" className="text-[#C6FF3D] underline">Sign in with an administrator account</Link></div>;
  return <AdminDashboardClient />;
}

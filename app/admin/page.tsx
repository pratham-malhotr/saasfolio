import { pageMetadata } from "@/lib/seo";
import React from "react";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { requireStaff } from "@/lib/server/staff";
import { HttpError } from "@/lib/server/http";
import { AdminMfaGate } from "@/components/admin/AdminMfaGate";
import Link from "next/link";
import { connection } from "next/server";

export const metadata = pageMetadata({
  title: 'Admin Dashboard',
  description: 'SaaSFolio administration dashboard.',
  path: "/admin",
  noIndex: true,
});

export default async function AdminPage() {
  // Authorization must run for every request, including deployments whose
  // server credentials are only injected after the build.
  await connection();
  let access;
  let issue: HttpError | undefined;
  try {
    access = await requireStaff({ mfa: false, writable: false });
  } catch (error) {
    if (!(error instanceof HttpError)) throw error;
    issue = error;
  }
  if (issue || !access) return <div className="max-w-xl mx-auto px-6 pt-36 pb-24 space-y-5"><h1 className="font-display text-3xl font-bold text-white">{issue?.status === 503 ? "Administration is temporarily unavailable" : "Administrator access required"}</h1><p className="text-zinc-400">{issue?.message}</p><Link href="/login?redirect=/admin" className="text-[#C6FF3D] underline">Sign in with a staff account</Link></div>;
  if (!access.mfaVerified) return <AdminMfaGate />;
  return <AdminDashboardClient role={access.role} />;
}

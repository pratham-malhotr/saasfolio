import { pageMetadata } from "@/lib/seo";
import React from "react";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata = pageMetadata({
  title: 'Admin Dashboard',
  description: 'SaaSFolio administration dashboard.',
  path: "/admin",
  noIndex: true,
});

export default function AdminPage() {
  return <AdminDashboardClient />;
}

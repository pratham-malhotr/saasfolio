import React from "react";
import { Metadata } from "next";
import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";

export const metadata: Metadata = {
  title: "Admin Mission Control — SaaSFolio Operations",
  description: "Operations dashboard for SaaS vendor submissions, coupon approvals, link redirection analytics, and moderation.",
};

export default function AdminPage() {
  return <AdminDashboardClient />;
}

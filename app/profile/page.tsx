import React from "react";
import { Metadata } from "next";
import { ProfileDashboardClient } from "@/components/profile/ProfileDashboardClient";

export const metadata: Metadata = {
  title: "My Member Passport & Saved Deals — SaaSFolio",
  description: "Manage your bookmarked SaaS guides, verified deal alerts, upvoted community discussions, and submitted software.",
};

export default function ProfilePage() {
  return <ProfileDashboardClient />;
}

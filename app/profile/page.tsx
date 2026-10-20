import { pageMetadata } from "@/lib/seo";
import React from "react";
import { ProfileDashboardClient } from "@/components/profile/ProfileDashboardClient";

export const metadata = pageMetadata({
  title: 'My Profile & Saved Deals',
  description: 'Manage your SaaSFolio profile, saved deals and bookmarks.',
  path: "/profile",
  noIndex: true,
});

export default function ProfilePage() {
  return <ProfileDashboardClient />;
}

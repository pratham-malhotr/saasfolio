import React from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ProfileDashboardClient } from "@/components/profile/ProfileDashboardClient";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return pageMetadata({
    title: `@${username} — Member Profile`,
    description: `SaaSFolio member profile for @${username}.`,
    path: `/u/${encodeURIComponent(username)}`,
    noIndex: true,
  });
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  return <ProfileDashboardClient targetUsername={username} />;
}

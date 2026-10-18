import React from "react";
import { Metadata } from "next";
import { ProfileDashboardClient } from "@/components/profile/ProfileDashboardClient";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `@${username} — SaaSFolio Member Profile`,
    description: `View public profile, submitted software, and curated SaaS recommendations by @${username} on SaaSFolio.`,
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const { username } = await params;
  return <ProfileDashboardClient targetUsername={username} />;
}

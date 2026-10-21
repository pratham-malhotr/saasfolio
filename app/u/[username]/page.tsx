import React from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";

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

export default function UserProfilePage() {
  return <div className="max-w-xl mx-auto pt-36 pb-24 px-6 space-y-4"><h1 className="font-display text-3xl text-white font-bold">Member profile</h1><p className="text-zinc-400">Public member profiles are not available. Account details and saved items are private.</p><Link href="/profile" className="text-[#C6FF3D] underline">Open your own account</Link></div>;
}

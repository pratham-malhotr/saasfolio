import React from "react";
import { Metadata } from "next";
import { CommunityHubClient } from "@/components/community/CommunityHubClient";

export const metadata: Metadata = {
  title: "SaaS Community Forum — Discussions, Reviews & Architecture Q&A | SaaSFolio",
  description: "Join 10,000+ founders, architects and engineers debating software tools, lifetime deals, and tech architectures without vendor censorship.",
};

export default function CommunityPage() {
  return <CommunityHubClient />;
}

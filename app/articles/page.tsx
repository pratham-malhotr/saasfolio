import React from "react";
import { Metadata } from "next";
import { ArticlesHubClient } from "@/components/articles/ArticlesHubClient";

export const metadata: Metadata = {
  title: "SaaS Reviews & Architecture Comparisons | SaaSFolio Editorial",
  description: "Hands-on software latency stress-tests, database cost audits, and real-world tech stack blueprints from engineers and founders.",
};

export default function ArticlesPage() {
  return <ArticlesHubClient />;
}

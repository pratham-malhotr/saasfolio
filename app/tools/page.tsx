import React from "react";
import { ToolsDirectoryClient } from "@/components/tools/ToolsDirectoryClient";
import { getAllTools } from "@/lib/data/tools-data";

export const metadata = {
  title: "SaaS Tools Directory — Curated Software Catalogue",
  description: "Browse 30+ curated SaaS software tools with verified ratings, pricing tiers, benchmarks, and active deals.",
};

export default function ToolsPage() {
  const allTools = getAllTools();

  return (
    <div className="min-h-screen bg-[#050505]">
      <ToolsDirectoryClient initialTools={allTools} />
    </div>
  );
}

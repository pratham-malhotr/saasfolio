import React from "react";
import { Metadata } from "next";
import { SubmitWizardClient } from "@/components/submit/SubmitWizardClient";

export const metadata: Metadata = {
  title: "Submit a SaaS Tool or Exclusive Deal — SaaSFolio",
  description: "Get your software product discovered by 10,000+ founders, tech leads, and developers with verified promotions and benchmarks.",
};

export default function SubmitPage() {
  return <SubmitWizardClient />;
}

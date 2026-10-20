import { pageMetadata } from "@/lib/seo";
import React from "react";
import { SubmitWizardClient } from "@/components/submit/SubmitWizardClient";

export const metadata = pageMetadata({
  title: 'Submit a SaaS Tool or Deal',
  description: 'Submit a software tool, SaaS discount or coupon for consideration on SaaSFolio.',
  path: "/submit",
  noIndex: true,
});

export default function SubmitPage() {
  return <SubmitWizardClient />;
}

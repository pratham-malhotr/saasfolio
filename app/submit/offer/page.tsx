import { pageMetadata } from "@/lib/seo";
import { SubmitWizardClient } from "@/components/submit/SubmitWizardClient";

export const metadata = pageMetadata({ title: "Submit a software offer or coupon", description: "Suggest a sourced software offer for editorial consideration.", path: "/submit/offer", noIndex: true });
export default function OfferSubmissionPage() { return <SubmitWizardClient />; }

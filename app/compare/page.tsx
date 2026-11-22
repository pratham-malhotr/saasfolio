import { FolioArtwork } from "@/components/animations/FolioArtwork";
import { ScrollMotion } from "@/components/animations/ScrollMotion";
import CompareHubClient from "@/components/compare/CompareHubClient";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { POPULAR_COMPARISONS } from "@/lib/data/comparisons-data";
import { getPublishedTools } from "@/lib/published-catalog";

const title = "Compare SaaS Tools Side by Side";
const description = "Compare SaaS tools by features, pricing structure, workflow and limits. Read software comparisons for website builders, analytics, notes and hosting.";
export const metadata = pageMetadata({ title, description, path: "/compare" });

export default function Page() {
  const tools = getPublishedTools().map(({ id, slug, name, category }) => ({ id, slug, name, category }));
  return <><JsonLd data={collectionSchema(title, description, "/compare", POPULAR_COMPARISONS.map((item) => ({ name: item.title, path: `/compare/${item.slug}` })))} /><ScrollMotion><CompareHubClient tools={tools} comparisons={POPULAR_COMPARISONS} illustration={<FolioArtwork variant="compare" />} /></ScrollMotion></>;
}

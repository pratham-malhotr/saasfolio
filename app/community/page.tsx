import { DETAILED_THREADS } from "@/lib/data/community-data";
import { JsonLd } from "@/components/seo/JsonLd";
import { collectionSchema } from "@/lib/structured-data";
import { pageMetadata } from "@/lib/seo";
import { getToolHref } from "@/lib/catalog-links";
import React from "react";
import { CommunityHubClient } from "@/components/community/CommunityHubClient";

export const metadata = pageMetadata({
  title: 'SaaS Community: Software Discussions & Deals',
  description: 'Discuss SaaS tools, software deals, pricing and technology choices with the SaaSFolio community.',
  path: "/community",
  noIndex: true,
});

export default function CommunityPage() {
  return <div data-community-preview="true"><JsonLd data={collectionSchema('SaaS Community Discussions', 'Discussions about SaaS tools, deals, software pricing and technology.', "/community", DETAILED_THREADS.map((thread) => ({ name: thread.title, path: `/community/${thread.slug}` })))} /><CommunityHubClient toolLinks={Object.fromEntries(DETAILED_THREADS.flatMap((thread) => thread.toolTags.map((tag) => [tag.slug, getToolHref(tag.slug)])))} /></div>;
}

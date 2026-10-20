import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { SocialImage } from "@/components/seo/SocialImage";

export const alt = "SaaSFolio software reviews, comparisons and buying guides";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return DETAILED_ARTICLES.map(({ slug }) => ({ slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = DETAILED_ARTICLES.find((item) => item.slug === slug);
  if (!article) notFound();
  return new ImageResponse(<SocialImage title={article.title} label={article.category.toUpperCase()} />, size);
}

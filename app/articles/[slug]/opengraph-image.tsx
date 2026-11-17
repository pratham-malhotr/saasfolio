import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { DETAILED_ARTICLES } from "@/lib/data/articles-data";
import { SocialImage } from "@/components/seo/SocialImage";
import { readFile } from "node:fs/promises";
import path from "node:path";

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
  const backgroundImage = article.coverImage ? `data:image/webp;base64,${(await readFile(path.join(process.cwd(), "public", article.coverImage.src))).toString("base64")}` : undefined;
  return new ImageResponse(<SocialImage title={article.title} label={article.category.toUpperCase()} backgroundImage={backgroundImage} />, size);
}

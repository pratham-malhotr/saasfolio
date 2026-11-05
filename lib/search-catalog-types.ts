import type { DetailedTool, SaaSDeal } from "@/lib/types";
import type { ArticlePreview } from "@/lib/data/articles-data";

export interface PublicSearchCatalog {
  tools: Pick<DetailedTool, "id" | "slug" | "name" | "category" | "tagline" | "bestFor" | "logoLetter">[];
  offers: SaaSDeal[];
  articles: ArticlePreview[];
}

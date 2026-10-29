export type OfferReviewReason = "removed" | "expired" | "evidence_changed" | "blocked" | "unavailable" | "stale" | "expiring";
export type OfferReviewRow = {
  id: string; toolSlug: string; brandName: string; sourceUrl: string | null;
  reasons: OfferReviewReason[]; checkedAt: string | null; lastAttemptAt: string | null;
  nextAttemptAt: string | null; httpStatus: number | null;
  offers: { slug: string; title: string; checkedAt: string | null; expiryDate: string | null }[];
};
export type OfferOperationsResponse = {
  generatedAt: string; collectedAt: string | null; total: number; filteredTotal: number;
  counts: Record<OfferReviewReason, number>; items: OfferReviewRow[]; page: number; pages: number;
};

import { failure, HttpError, json } from "@/lib/server/http";
import { requireStaff } from "@/lib/server/staff";
import { buildOfferReviewQueue, OFFER_REVIEW_REASONS } from "@/lib/offer-operations.mjs";
import snapshot from "@/lib/data/offer-snapshot.json";
import { MANAGED_OFFERS, RETIRED_MANAGED_OFFERS } from "@/lib/data/managed-content";
import { getToolBySlug } from "@/lib/data/tools-data";

export async function GET(request: Request) {
  try {
    await requireStaff();
    const params = new URL(request.url).searchParams;
    const reason = params.get("reason") || "all";
    const page = Number(params.get("page") || "1");
    if ((reason !== "all" && !OFFER_REVIEW_REASONS.includes(reason)) || !Number.isSafeInteger(page) || page < 1 || page > 10000) throw new HttpError(400, "Choose a valid queue filter and page.");
    const queue = buildOfferReviewQueue(snapshot, { managedOffers: MANAGED_OFFERS, retiredOffers: [...RETIRED_MANAGED_OFFERS] });
    const eligible = queue.items.filter(item => { const brand = getToolBySlug(item.toolSlug); return brand && brand.providerStatus !== "unavailable"; });
    const counts = Object.fromEntries(OFFER_REVIEW_REASONS.map(flag => [flag, eligible.filter(item => item.reasons.includes(flag)).length]));
    const filtered = eligible.filter(item => reason === "all" || item.reasons.includes(reason));
    return json({ ...queue, counts, total: eligible.length, filteredTotal: filtered.length, page, pages: Math.max(1, Math.ceil(filtered.length / 40)),
      items: filtered.slice((page - 1) * 40, page * 40).map(item => ({ ...item, brandName: getToolBySlug(item.toolSlug)?.name || item.toolSlug })) });
  } catch (error) { return failure(error); }
}

import { getDealBySlug, getHistoricOfferToolSlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getCustomAffiliateUrl } from "@/lib/data/affiliate-links";
import { publicHttpsUrl } from "@/lib/offer-links";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = getDealBySlug(id);
  const tool = getToolBySlug(id);
  const legacySlug = getHistoricOfferToolSlug(id);
  const resolvedTool = tool || (deal ? getToolBySlug(deal.toolSlug) : legacySlug ? getToolBySlug(legacySlug) : undefined);
  const headers = { "X-Robots-Tag": "noindex, follow", "Cache-Control": "no-store" };
  if (resolvedTool?.providerStatus === "unavailable") return new Response("<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Provider link unavailable | SaaSFolio</title><body><h1>This provider link is unavailable</h1><p>We could not confirm a working official destination. No current offer is published.</p><p><a href=\"/tools\">Browse other software</a> · <a href=\"/contact\">Report a link correction</a></p></body></html>", { status: 410, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } });
  const exactOffer = deal && (id === deal.slug || id === deal.id);
  const destination = deal
    ? exactOffer ? publicHttpsUrl(deal.destinationUrl) || publicHttpsUrl(deal.affiliateUrl) : publicHttpsUrl(resolvedTool?.pricingUrl) || publicHttpsUrl(resolvedTool?.website)
    : resolvedTool ? (tool ? publicHttpsUrl(getCustomAffiliateUrl(tool.slug)) : undefined) || publicHttpsUrl(resolvedTool.pricingUrl) || publicHttpsUrl(resolvedTool.website) : undefined;
  if (!destination) return new Response("Offer not found", { status: 404, headers });
  // An HTTP redirect works without JavaScript, popup permission or a countdown.
  return new Response(null, { status: 302, headers: { ...headers, Location: destination } });
}

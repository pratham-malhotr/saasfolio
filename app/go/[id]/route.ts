import { getDealBySlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getCustomAffiliateUrl } from "@/lib/data/affiliate-links";
import { publicHttpsUrl } from "@/lib/offer-links";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const deal = getDealBySlug(id);
  const tool = getToolBySlug(id);
  const destination = deal
    ? publicHttpsUrl(deal.destinationUrl) || publicHttpsUrl(deal.affiliateUrl)
    : tool ? publicHttpsUrl(getCustomAffiliateUrl(tool.slug)) || publicHttpsUrl(tool.pricingUrl) || publicHttpsUrl(tool.website) : undefined;
  const headers = { "X-Robots-Tag": "noindex, follow", "Cache-Control": "no-store" };
  if (!destination) return new Response("Offer not found", { status: 404, headers });
  // An HTTP redirect works without JavaScript, popup permission or a countdown.
  return new Response(null, { status: 302, headers: { ...headers, Location: destination } });
}

import { approveAndNotify, brandClaim, getClaimListing, ownsBrandDomain } from "@/lib/server/brand-listings";
import { failure, HttpError, json, readBody } from "@/lib/server/http";
import { enforceLimit } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const body = await readBody(request, 2000);
    if (body.action !== "instructions" && body.action !== "verify") throw new HttpError(400, "Choose a verification action.");
    await enforceLimit(request, "brand-verification", 15, 600);
    const claim = await brandClaim(body);
    const approved = Boolean(await getClaimListing(claim));
    const instructions = { dnsName: claim.dnsName, dnsValue: claim.dnsValue, approved };
    if (body.action === "instructions" || approved) return json(instructions);
    if (!await ownsBrandDomain(claim)) return json({ ...instructions, status: "record_not_found" });
    return json({ ...instructions, approved: await approveAndNotify(claim), status: "checked" });
  } catch (error) { return failure(error); }
}

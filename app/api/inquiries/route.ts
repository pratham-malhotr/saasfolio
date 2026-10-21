import { email, failure, HttpError, json, readBody, text, website } from "@/lib/server/http";
import { enforceLimit, serviceClient } from "@/lib/server/supabase";

export async function POST(request: Request) {
  try {
    const data = await readBody(request);
    if (data.companyWebsite) return json({ error: "Please try again." }, 400);
    const kind = text(data, "kind", 1, 20);
    let address: string;
    let payload: Record<string, string | number>;
    if (kind === "contact") {
      address = email(data);
      payload = { name: text(data, "name", 2, 100), department: text(data, "department", 1, 40), subject: text(data, "subject", 3, 200), message: text(data, "message", 10, 8000) };
    } else if (kind === "advertise") {
      address = email(data, "contactEmail");
      payload = { companyName: text(data, "companyName", 2, 100), toolUrl: website(data, "toolUrl"), packageSelected: text(data, "packageSelected", 1, 100), budget: text(data, "budget", 1, 100), message: text(data, "message", 10, 8000) };
    } else if (kind === "submission") {
      address = email(data, "founderEmail");
      const submissionType = text(data, "submissionType", 1, 20);
      if (!["tool", "deal", "review"].includes(submissionType)) throw new HttpError(400, "Choose a valid submission type.");
      payload = { submissionType, toolName: text(data, "toolName", 2, 100), websiteUrl: website(data, "websiteUrl"), tagline: text(data, "tagline", 5, 300), category: text(data, "category", 1, 100), differentiator: text(data, "differentiator", 10, 8000), techStack: text(data, "techStack", 0, 500) };
      if (submissionType === "deal") {
        const discount = Number(data.discountPercentage);
        if (!Number.isFinite(discount) || discount < 0 || discount > 100) throw new HttpError(400, "Enter a discount between 0 and 100.");
        const expiry = text(data, "expirationDate", 0, 10);
        if (expiry && (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) || !Number.isFinite(Date.parse(expiry)) || Date.parse(`${expiry}T23:59:59Z`) <= Date.now())) throw new HttpError(400, "Choose a future expiry date or leave it blank.");
        Object.assign(payload, { discountPercentage: discount, couponCode: text(data, "couponCode", 0, 100), dealType: text(data, "dealType", 1, 100), expirationDate: expiry, verificationProof: website(data, "verificationProof") });
      }
    } else throw new HttpError(400, "Choose a valid form type.");
    await enforceLimit(request, `inquiry:${kind}`);
    const service = serviceClient();
    const { data: record, error } = await service.from("inquiries").insert({ kind, email: address, payload }).select("id").single();
    if (error || !record) throw new HttpError(503, "Your submission could not be saved. Please try again or contact us by email.");
    return json({ id: record.id, message: "Your submission has been saved for review." }, 201);
  } catch (error) { return failure(error); }
}

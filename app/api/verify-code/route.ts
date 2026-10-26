import { json, readBody, failure, text } from "@/lib/server/http";
import { verifyCodeLocally, type CodeVerificationInput } from "@/lib/code-verification";

export async function POST(request: Request) {
  try {
    const data = await readBody(request);
    const code = text(data, "code", 1, 60);
    const rawType = text(data, "codeType", 1, 30);
    const codeType = ["coupon", "referral", "discount"].includes(rawType) 
      ? (rawType as "coupon" | "referral" | "discount")
      : "coupon";
    const toolName = text(data, "toolName", 1, 100);
    const websiteUrl = text(data, "websiteUrl", 0, 2000);
    const discountPercentage = Number(data.discountPercentage ?? 0);

    const input: CodeVerificationInput = {
      code,
      codeType,
      toolName,
      websiteUrl,
      discountPercentage,
      discountDescription: text(data, "discountDescription", 0, 300),
      expirationDate: text(data, "expirationDate", 0, 10),
    };

    // A preview of local input checks. This endpoint does not submit the code,
    // verify a source, or test acceptance with the provider.
    const report = verifyCodeLocally(input);
    return json({ report });
  } catch (error) {
    return failure(error);
  }
}

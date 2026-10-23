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
    const websiteUrl = String(data.websiteUrl || "").slice(0, 500);
    const discountPercentage = Number(data.discountPercentage || 0);

    const input: CodeVerificationInput = {
      code,
      codeType,
      toolName,
      websiteUrl,
      discountPercentage,
      discountDescription: String(data.discountDescription || "").slice(0, 200),
    };

    const report = verifyCodeLocally(input);
    return json({ report });
  } catch (error) {
    return failure(error);
  }
}

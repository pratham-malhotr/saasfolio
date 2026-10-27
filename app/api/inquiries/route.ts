import { email, failure, HttpError, json, readBody, text, website } from "@/lib/server/http";
import { currentUser, enforceLimit, isSupabaseConfigured, publicUser, serviceClient } from "@/lib/server/supabase";
import { verifyCodeLocally } from "@/lib/code-verification";
import { saveLocalInquiry } from "@/lib/server/local-auth";

export async function POST(request: Request) {
  try {
    const data = await readBody(request);
    if (data.companyWebsite) return json({ error: "Please try again." }, 400);
    const kind = text(data, "kind", 1, 20);
    let address: string;
    let payload: Record<string, unknown>;

    if (kind === "contact") {
      address = email(data);
      payload = {
        name: text(data, "name", 2, 100),
        department: text(data, "department", 1, 40),
        subject: text(data, "subject", 3, 200),
        message: text(data, "message", 10, 8000),
      };
    } else if (kind === "advertise") {
      address = email(data, "contactEmail");
      payload = {
        companyName: text(data, "companyName", 2, 100),
        toolUrl: website(data, "toolUrl"),
        packageSelected: text(data, "packageSelected", 1, 100),
        budget: text(data, "budget", 1, 100),
        message: text(data, "message", 10, 8000),
      };
    } else if (kind === "submission") {
      const submissionType = text(data, "submissionType", 1, 20);
      if (!["code", "deal", "tool", "review"].includes(submissionType)) {
        throw new HttpError(400, "Choose a valid submission type.");
      }

      // Check for authenticated user
      const user = await currentUser();

      if (submissionType === "code") {
        // Enforce: User MUST be logged in to submit a promo or referral code
        if (!user) {
          throw new HttpError(401, "You must be signed in to submit a promo or referral code.");
        }
        address = user.email || email(data, "founderEmail");

        const toolName = text(data, "toolName", 2, 100);
        const websiteUrl = website(data, "websiteUrl");
        const code = text(data, "code", 1, 60).toUpperCase();
        const codeTypeRaw = text(data, "codeType", 1, 30);
        const codeType = ["coupon", "referral", "discount"].includes(codeTypeRaw)
          ? (codeTypeRaw as "coupon" | "referral" | "discount")
          : "coupon";
        const discount = Number(data.discountPercentage || 0);
        if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
          throw new HttpError(400, "Enter a discount between 0 and 100.");
        }

        const expiry = text(data, "expirationDate", 0, 10);
        if (
          expiry &&
          (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) ||
            !Number.isFinite(Date.parse(expiry)) ||
            Date.parse(`${expiry}T23:59:59Z`) <= Date.now())
        ) {
          throw new HttpError(400, "Choose a future expiry date or leave it blank.");
        }

        const verificationProof = website(data, "verificationProof");
        const discountDescription = text(data, "discountDescription", 2, 300);
        const terms = text(data, "terms", 0, 1000);

        // Input checks inform editorial review; they never establish source or
        // checkout verification and cannot publish an offer.
        const verificationReport = verifyCodeLocally({
          code,
          codeType,
          toolName,
          websiteUrl,
          discountPercentage: discount,
          discountDescription,
          expirationDate: expiry,
        });

        payload = {
          submissionType: "code",
          toolName,
          websiteUrl,
          code,
          codeType,
          discountPercentage: discount,
          discountDescription,
          terms,
          expirationDate: expiry,
          verificationProof,
          verificationScore: verificationReport.score,
          verificationStatus: verificationReport.status,
          verificationBadge: verificationReport.recommendedBadge,
          verificationSummary: verificationReport.summary,
          preflightValid: verificationReport.valid,
          reviewStatus: verificationReport.reviewStatus,
          sourceChecked: verificationReport.sourceChecked,
          checkoutTested: verificationReport.checkoutTested,
          submittedBy: publicUser(user),
          submittedAt: new Date().toISOString(),
        };
      } else {
        address = user?.email || email(data, "founderEmail");
        payload = {
          submissionType,
          toolName: text(data, "toolName", 2, 100),
          websiteUrl: website(data, "websiteUrl"),
          tagline: text(data, "tagline", 5, 300),
          category: text(data, "category", 1, 100),
          differentiator: text(data, "differentiator", 10, 8000),
          techStack: text(data, "techStack", 0, 500),
          submittedBy: user ? publicUser(user) : null,
        };

        if (submissionType === "deal") {
          const discount = Number(data.discountPercentage);
          if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
            throw new HttpError(400, "Enter a discount between 0 and 100.");
          }
          const expiry = text(data, "expirationDate", 0, 10);
          if (
            expiry &&
            (!/^\d{4}-\d{2}-\d{2}$/.test(expiry) ||
              !Number.isFinite(Date.parse(expiry)) ||
              Date.parse(`${expiry}T23:59:59Z`) <= Date.now())
          ) {
            throw new HttpError(400, "Choose a future expiry date or leave it blank.");
          }
          Object.assign(payload, {
            discountPercentage: discount,
            couponCode: text(data, "couponCode", 0, 100),
            dealType: text(data, "dealType", 1, 100),
            expirationDate: expiry,
            verificationProof: website(data, "verificationProof"),
          });
        }
      }
    } else {
      throw new HttpError(400, "Choose a valid form type.");
    }

    await enforceLimit(request, `inquiry:${kind}`);
    let recordId: string;
    if (
      isSupabaseConfigured() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")
    ) {
      const service = serviceClient();
      const { data: record, error } = await service
        .from("inquiries")
        .insert({ kind, email: address, payload })
        .select("id")
        .single();

      if (error || !record) {
        throw new HttpError(
          503,
          "Your submission could not be saved. Please try again or contact us by email."
        );
      }
      recordId = record.id;
    } else {
      if (isSupabaseConfigured() && !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // A missing private-service key must not redirect cloud data to local storage.
        serviceClient();
      }
      const localRecord = saveLocalInquiry(kind, address, payload);
      recordId = localRecord.id;
    }

    return json({ id: recordId, message: "Your submission has been saved for review." }, 201);
  } catch (error) {
    return failure(error);
  }
}

import { email, failure, HttpError, json, readBody, text, website } from "@/lib/server/http";
import { currentUser, enforceLimit, isSupabaseConfigured, publicUser, serviceClient } from "@/lib/server/supabase";
import { verifyCodeLocally } from "@/lib/code-verification";
import { saveLocalInquiry } from "@/lib/server/local-auth";
import { getDealBySlug, getHistoricOfferToolSlug } from "@/lib/data/deals-data";
import { getToolBySlug } from "@/lib/data/tools-data";
import { readBrandSubmission } from "@/lib/server/brand-submission";
import { brandDnsInstructions } from "@/lib/server/brand-verification";
import { brandReceivedEmail, sendTransactionalEmail } from "@/lib/server/transactional-email";

// Best effort: the saved submission stands even if the email cannot be sent.
async function notifyBrandReceived(receipt: string, address: string, payload: Record<string, unknown>) {
  try {
    const dns = brandDnsInstructions(receipt, address, payload);
    if (dns) await sendTransactionalEmail(brandReceivedEmail({ to: address, brand: String(payload.toolName), receipt: receipt.toLowerCase(), ...dns }));
  } catch { /* email is optional */ }
}
import { createHash } from "node:crypto";

export async function POST(request: Request) {
  try {
    const data = await readBody(request, 64000);
    if (data.companyWebsite) return json({ error: "Please try again." }, 400);
    const kind = text(data, "kind", 1, 20);
    let address: string;
    let payload: Record<string, unknown>;
    let submissionKey: string | undefined;

    if (kind === "contact") {
      address = email(data);
      payload = {
        name: text(data, "name", 2, 100),
        department: text(data, "department", 1, 40),
        subject: text(data, "subject", 3, 200),
        message: text(data, "message", 10, 8000),
      };
      if (data.reportOffer || data.reportBrand) {
        const offerSlug = text(data, "reportOffer", 0, 120), brandSlug = text(data, "reportBrand", 0, 120);
        if ([offerSlug, brandSlug].some(slug => slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))) throw new HttpError(400, "Choose a valid listing to report.");
        const offerBrand = offerSlug ? getHistoricOfferToolSlug(offerSlug) || getDealBySlug(offerSlug)?.toolSlug : undefined;
        const brand = getToolBySlug(offerBrand || brandSlug);
        if (!brand || (offerSlug && !offerBrand) || (brandSlug && getToolBySlug(brandSlug)?.slug !== brand.slug)) throw new HttpError(400, "This report does not match a recorded listing.");
        payload.brandSlug = brand.slug;
        if (offerSlug) payload.offerSlug = offerSlug;
        // An unauthenticated visitor report supplies review context, never a
        // verified failure or an instruction to change the public catalog.
        payload.reportStatus = "unreviewed";
      }
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
      if (!["brand", "code", "deal", "tool", "review"].includes(submissionType)) {
        throw new HttpError(400, "Choose a valid submission type.");
      }

      // Check for authenticated user
      const user = submissionType === "brand" ? null : await currentUser();

      if (submissionType === "brand") {
        ({ address, payload } = readBrandSubmission(data));
        if (data.submissionKey !== undefined) {
          submissionKey = text(data, "submissionKey", 36, 36).toLowerCase();
          if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(submissionKey)) throw new HttpError(400, "The submission reference is invalid. Reload the form and try again.");
        }
      } else if (submissionType === "code") {
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
    const { submittedAt: submissionTimestamp, ...stablePayload } = payload;
    void submissionTimestamp;
    const fingerprint = submissionKey ? createHash("sha256").update(JSON.stringify({ address, payload: stablePayload })).digest("hex") : undefined;
    let recordId: string;
    if (
      isSupabaseConfigured() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      !process.env.SUPABASE_SERVICE_ROLE_KEY.includes("your-service")
    ) {
      const service = serviceClient();
      if (submissionKey) {
        const { data: savedId, error } = await service.rpc("save_brand_submission", { request_key: submissionKey, request_email: address, request_payload: payload, request_fingerprint: fingerprint });
        if (error?.code === "23505") throw new HttpError(409, "This submission reference was already used for different details. Reload the form before submitting a different product.");
        if (error || typeof savedId !== "string" || !/^[a-f0-9-]{36}$/i.test(savedId)) throw new HttpError(503, "Your submission could not be confirmed. Retry with the same details or download a copy and contact us.");
        if (payload.submissionType === "brand") await notifyBrandReceived(savedId, address, payload);
        return json({ id: savedId, message: "Your submission has been saved for review." }, 201);
      }
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
      const localRecord = saveLocalInquiry(kind, address, payload, submissionKey ? { key: submissionKey, fingerprint: fingerprint! } : undefined);
      recordId = localRecord.id;
    }

    return json({ id: recordId, message: "Your submission has been saved for review." }, 201);
  } catch (error) {
    return failure(error);
  }
}

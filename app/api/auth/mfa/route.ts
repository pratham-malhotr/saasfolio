import { authClient, enforceLimit, isSupabaseConfigured, requireUser } from "@/lib/server/supabase";
import { failure, HttpError, json, readBody, text } from "@/lib/server/http";

async function session() {
  const user = await requireUser();
  if (!isSupabaseConfigured()) throw new HttpError(503, "Authenticator security requires the production account service.");
  return { user, client: await authClient() };
}
export async function GET() {
  try {
    const { client } = await session();
    const [factors, assurance] = await Promise.all([client.auth.mfa.listFactors(), client.auth.mfa.getAuthenticatorAssuranceLevel()]);
    if (factors.error || assurance.error) throw new HttpError(503, "Authenticator settings could not be loaded.");
    return json({ level: assurance.data.currentLevel, factors: factors.data.all.filter(factor => factor.factor_type === "totp").map(factor => ({ id: factor.id, name: factor.friendly_name || "Authenticator", status: factor.status })) });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const body = await readBody(request);
    const { user, client } = await session();
    const action = text(body, "action", 1, 30);
    await enforceLimit(request, `mfa:${user.id}:${action}`, action === "verify" ? 8 : 3, 600);
    const listed = await client.auth.mfa.listFactors();
    if (listed.error) throw new HttpError(503, "Authenticator settings could not be loaded.");
    const factors = listed.data.all.filter(factor => factor.factor_type === "totp");
    if (action === "enroll") {
      const verified = factors.some(factor => factor.status === "verified");
      if (verified) {
        const level = await client.auth.mfa.getAuthenticatorAssuranceLevel();
        if (level.error || level.data.currentLevel !== "aal2") throw new HttpError(403, "Verify your existing authenticator before adding another.", "MFA_REQUIRED");
      }
      if (factors.length >= 3) throw new HttpError(400, "Remove an unfinished setup before adding another authenticator.");
      const result = await client.auth.mfa.enroll({ factorType: "totp", friendlyName: `SaaSFolio ${new Date().toISOString()}` });
      if (result.error) throw new HttpError(503, "Authenticator setup could not be started.");
      return json({ factorId: result.data.id, qrCode: result.data.totp.qr_code, secret: result.data.totp.secret });
    }
    const factorId = text(body, "factorId", 36, 36);
    const factor = factors.find(item => item.id === factorId);
    if (!factor) throw new HttpError(400, "Choose an authenticator belonging to your account.");
    if (action === "cancel") {
      if (factor.status !== "unverified") throw new HttpError(403, "A verified authenticator cannot be removed through setup cancellation.");
      const result = await client.auth.mfa.unenroll({ factorId });
      if (result.error) throw new HttpError(503, "The unfinished setup could not be removed.");
      return json({ ok: true });
    }
    if (action !== "verify") throw new HttpError(400, "Choose a supported authenticator action.");
    const code = text(body, "code", 6, 6);
    if (!/^\d{6}$/.test(code)) throw new HttpError(400, "Enter the six-digit authenticator code.");
    const result = await client.auth.mfa.challengeAndVerify({ factorId, code });
    if (result.error) throw new HttpError(400, "That code could not be verified. Try a fresh code.", "MFA_CODE_REJECTED");
    return json({ verified: true });
  } catch (error) { return failure(error); }
}

import { failure, HttpError, json, readBody, text } from "@/lib/server/http";
import { requireStaff, rpcValue } from "@/lib/server/staff";
import { enforceLimit, serviceClient } from "@/lib/server/supabase";
import { CatalogValidationError, validateManagedPayload } from "@/lib/managed-catalog.mjs";
import { checkOfferSource, SourceCheckError } from "@/lib/server/source-fetch.mjs";
import { getToolBySlug } from "@/lib/data/tools-data";
import { getHistoricOfferToolSlug } from "@/lib/data/deals-data";
import { MANAGED_CATALOG } from "@/lib/data/managed-content";

type Entry = { id: string; kind: string; slug: string; payload: Record<string, unknown>; revision: number; state: string };
export async function GET(request: Request) {
  try {
    const { client } = await requireStaff();
    const params = new URL(request.url).searchParams;
    const id = params.get("id");
    if (id) {
      if (!/^[a-f0-9-]{36}$/i.test(id)) throw new HttpError(400, "Choose a valid entry.");
      return json({ entry: rpcValue(await client.rpc("catalog_entry_details", { target_entry: id })), history: rpcValue(await client.rpc("catalog_revision_history", { target_entry: id })) });
    }
    const cursor = params.get("before");
    let before_time: string | null = null, before_id: string | null = null;
    if (cursor) {
      const parts = cursor.split("|");
      if (parts.length !== 2 || !Number.isFinite(Date.parse(parts[0])) || !/^[a-f0-9-]{36}$/i.test(parts[1])) throw new HttpError(400, "The pagination cursor is invalid.");
      [before_time, before_id] = parts;
    }
    const entries = rpcValue(await client.rpc("list_catalog_entries", { before_time, before_id })) as Array<{ id: string; updated_at: string; kind: string; slug: string }>;
    const release = rpcValue(await client.rpc("public_catalog_snapshot")) as { revision: number; entries: Array<{ kind: string; slug: string; retired: boolean }> };
    const last = entries.at(-1);
    return json({ entries: entries.map(entry => ({ ...entry, hasPublication: release.entries.some(item => item.kind === entry.kind && item.slug === entry.slug && !item.retired) })), deployedRevision: MANAGED_CATALOG.revision, releaseRevision: release.revision, nextCursor: entries.length === 50 && last ? `${last.updated_at}|${last.id}` : null });
  } catch (error) { return failure(error); }
}
export async function POST(request: Request) {
  try {
    const { user, client, role } = await requireStaff();
    const body = await readBody(request, 100000);
    await enforceLimit(request, `catalog:${user.id}`, 50, 600);
    const action = text(body, "action", 1, 30);
    if (action === "save") {
      if (!["owner", "editor"].includes(role)) throw new HttpError(403, "Editing permission is required.");
      const kind = text(body, "kind", 1, 20); const slug = text(body, "slug", 1, 100);
      const payload = validateManagedPayload(kind, slug, body.payload);
      if (kind === "offer") {
        const known = getHistoricOfferToolSlug(slug);
        if (known && known !== payload.toolSlug) throw new HttpError(400, "A published offer URL cannot be reassigned to another brand.");
      }
      const revision = Number(body.revision);
      if (!Number.isInteger(revision) || revision < 0) throw new HttpError(400, "Provide the current revision.");
      return json({ entry: rpcValue(await client.rpc("save_catalog_entry", { entry_kind: kind, entry_slug: slug, entry_payload: payload, expected_revision: revision })) });
    }
    const entryId = text(body, "id", 36, 36);
    const revision = Number(body.revision);
    if (!/^[a-f0-9-]{36}$/i.test(entryId) || !Number.isInteger(revision) || revision < 1) throw new HttpError(400, "Provide a valid entry and revision.");
    if (action === "restore") {
      const target = Number(body.restoreRevision);
      if (!Number.isInteger(target) || target < 1) throw new HttpError(400, "Choose a previous revision.");
      return json({ entry: rpcValue(await client.rpc("restore_catalog_revision", { target_entry: entryId, expected_revision: revision, restore_revision: target })) });
    }
    if (action === "check_source") {
      if (!["owner", "reviewer"].includes(role)) throw new HttpError(403, "Review permission is required.");
      await enforceLimit(request, `source-check:${user.id}`, 5, 600);
      const entry = rpcValue(await client.rpc("catalog_entry_details", { target_entry: entryId })) as Entry | null;
      if (!entry || entry.kind !== "offer" || entry.revision !== revision || entry.state !== "in_review") throw new HttpError(409, "Reload the submitted offer before checking its source.");
      const payload = validateManagedPayload(entry.kind, entry.slug, entry.payload);
      const publications = rpcValue(await client.rpc("public_catalog_snapshot")) as { entries: Array<{ kind: string; slug: string; retired: boolean; payload: { website: string } }> };
      const managedBrand = publications.entries.find(item => item.kind === "brand" && item.slug === payload.toolSlug && !item.retired);
      const brand = managedBrand?.payload || getToolBySlug(payload.toolSlug);
      if (!brand) throw new HttpError(400, "Approve the brand profile before checking its offer.");
      try {
        const result = await checkOfferSource(payload, brand.website);
        rpcValue(await serviceClient().rpc("record_source_observation", { target_entry: entryId, target_revision: revision, checked_url: result.sourceUrl, fingerprint: result.contentHash, outcome: "ok" }));
        return json({ outcome: "ok", message: "The current public source contains the evidence. Checkout acceptance has not been tested." });
      } catch (error) {
        const outcome = error instanceof SourceCheckError ? error.outcome : "unavailable";
        rpcValue(await serviceClient().rpc("record_source_observation", { target_entry: entryId, target_revision: revision, checked_url: payload.sourceUrl, fingerprint: null, outcome }));
        throw new HttpError(422, error instanceof SourceCheckError ? error.message : "The public source could not be checked.", "SOURCE_NOT_CONFIRMED");
      }
    }
    if (!["submit", "reject", "approve", "publish", "retire"].includes(action)) throw new HttpError(400, "Choose a supported publishing action.");
    if (action !== "retire") {
      const entry = rpcValue(await client.rpc("catalog_entry_details", { target_entry: entryId })) as Entry | null;
      if (!entry || entry.revision !== revision) throw new HttpError(409, "Reload the record before continuing.");
      validateManagedPayload(entry.kind, entry.slug, entry.payload);
    }
    return json({ entry: rpcValue(await client.rpc("catalog_transition", { entry_id: entryId, expected_revision: revision, transition: action })) });
  } catch (error) {
    return failure(error instanceof CatalogValidationError ? new HttpError(400, error.message, "INVALID_CATALOG_CONTENT") : error);
  }
}

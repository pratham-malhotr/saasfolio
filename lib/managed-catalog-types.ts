export type ManagedEntry = { kind: "brand" | "guide" | "offer"; slug: string; payload: Record<string, unknown>; revision: number; retired: boolean; publishedAt: string };
export type ManagedCatalog = { schemaVersion: number; revision: number; publishedAt: string | null; entries: ManagedEntry[] };

import "server-only";
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import {
  chmodSync, closeSync, constants, fchmodSync, fstatSync, fsyncSync, lstatSync, mkdirSync,
  openSync, readFileSync, renameSync, unlinkSync, writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";
import { HttpError } from "@/lib/server/http";

interface LocalSession {
  tokenHash: string;
  createdAt: number;
  expiresAt: number;
}

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  passwordVersion?: 2;
  createdAt: string;
  bio?: string;
  isAdmin?: boolean;
  savedItems?: Array<{ kind: "deal" | "article"; slug: string; created_at: string }>;
  sessions?: LocalSession[];
}

export interface LocalInquiry {
  id: string;
  kind: string;
  email: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

const SESSION_TTL = 30 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS = 20;
const MAX_STORE_BYTES = 8 * 1024 * 1024;
const PASSWORD_OPTIONS = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

// Local accounts are an explicitly enabled development facility, never a
// production or failed-provider fallback. No default or rate-limit secret.
export function localAuthConfigured(): boolean {
  return ["development", "test"].includes(process.env.NODE_ENV || "") &&
    process.env.LOCAL_AUTH_ENABLED === "true" &&
    /^[a-f0-9]{64}$/i.test(process.env.LOCAL_AUTH_SECRET || "");
}
export const isLocalAuthEnabled = localAuthConfigured;

function requireLocalAuth() {
  if (!localAuthConfigured()) throw new HttpError(503, "Local account services are disabled. Configure the account provider to continue.");
}

function storageError(): never {
  throw new HttpError(503, "Local storage is unavailable. Your changes could not be confirmed.");
}

function dataDirectory() {
  const defaultDirectory = resolve(process.cwd(), ".local-data");
  const directory = process.env.LOCAL_AUTH_DATA_DIR ? resolve(process.env.LOCAL_AUTH_DATA_DIR) : defaultDirectory;
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const stats = lstatSync(directory);
  if (!stats.isDirectory() || stats.isSymbolicLink() || (process.getuid && stats.uid !== process.getuid())) storageError();
  if ((stats.mode & 0o077) !== 0) {
    // Only harden the dedicated legacy directory. Never chmod an arbitrary
    // configured directory such as /tmp or a user's project root.
    if (directory !== defaultDirectory) storageError();
    chmodSync(directory, 0o700);
  }
  return directory;
}

function readStore(path: string): unknown[] {
  let descriptor: number | undefined;
  try {
    if (lstatSync(path).isSymbolicLink()) storageError();
    descriptor = openSync(path, constants.O_RDONLY | (constants.O_NOFOLLOW || 0));
    const stats = fstatSync(descriptor);
    if (!stats.isFile() || stats.nlink !== 1 || stats.size > MAX_STORE_BYTES || (process.getuid && stats.uid !== process.getuid())) storageError();
    fchmodSync(descriptor, 0o600);
    const parsed: unknown = JSON.parse(readFileSync(descriptor, "utf8"));
    if (!Array.isArray(parsed)) storageError();
    return parsed;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
}

function writeStore(path: string, rows: unknown[]) {
  const serialized = JSON.stringify(rows, null, 2);
  if (Buffer.byteLength(serialized) > MAX_STORE_BYTES) storageError();
  const temporary = `${path}.${randomBytes(12).toString("hex")}.tmp`;
  let descriptor: number | undefined;
  try {
    descriptor = openSync(temporary, "wx", 0o600);
    writeFileSync(descriptor, serialized, "utf8");
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = undefined;
    renameSync(temporary, path);
    const directory = openSync(resolve(path, ".."), constants.O_RDONLY);
    try { fsyncSync(directory); } finally { closeSync(directory); }
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    try { unlinkSync(temporary); } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
  }
}

function transaction<T>(filename: string, operation: (rows: unknown[]) => { value: T; rows?: unknown[] }): T {
  requireLocalAuth();
  let lock: string | undefined;
  let descriptor: number | undefined;
  try {
    const path = join(dataDirectory(), filename);
    lock = `${path}.lock`;
    // A busy or abandoned lock fails closed. Never delete another process's
    // lock or let concurrent read/modify/write requests overwrite each other.
    descriptor = openSync(lock, "wx", 0o600);
    const result = operation(readStore(path));
    if (result.rows) writeStore(path, result.rows);
    return result.value;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    return storageError();
  } finally {
    if (descriptor !== undefined) {
      closeSync(descriptor);
      try { unlinkSync(lock!); } catch { storageError(); }
    }
  }
}

function insecureBuiltin(row: Record<string, unknown>) {
  const email = typeof row.email === "string" ? row.email.toLowerCase() : "";
  return (row.id === "usr-demo-001" && email === "demo@saasfolio.tech") ||
    (row.id === "usr-admin-001" && email === "owner@example.com");
}

function checkedUsers(rows: unknown[]): LocalUser[] {
  const users: LocalUser[] = [];
  const emails = new Set<string>();
  const ids = new Set<string>();
  for (const value of rows) {
    if (!value || typeof value !== "object" || Array.isArray(value)) storageError();
    const row = value as Record<string, unknown>;
    // Retire only the two reserved insecure identities; a genuine account
    // with the same email but a generated ID is retained. Old tokens never
    // satisfy the new opaque session format, regardless of this migration.
    if (insecureBuiltin(row)) continue;
    if (typeof row.id !== "string" || !/^usr-[a-z0-9-]{1,100}$/i.test(row.id) ||
      typeof row.name !== "string" || row.name.length > 100 ||
      typeof row.email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email) || row.email.length > 254 ||
      typeof row.passwordHash !== "string" || !/^[a-f0-9]{128}$/i.test(row.passwordHash) ||
      typeof row.salt !== "string" || !/^[a-f0-9]{32,64}$/i.test(row.salt) ||
      (row.passwordVersion !== undefined && row.passwordVersion !== 2) ||
      typeof row.createdAt !== "string" || !Number.isFinite(Date.parse(row.createdAt))) storageError();
    const email = row.email.toLowerCase();
    if (emails.has(email) || ids.has(row.id)) storageError();
    emails.add(email); ids.add(row.id);
    if (row.bio !== undefined && (typeof row.bio !== "string" || row.bio.length > 1000)) storageError();
    const saved = row.savedItems ?? [];
    if (!Array.isArray(saved) || saved.some(item => !item || !["deal", "article"].includes(item.kind) || typeof item.slug !== "string" || item.slug.length > 200 || typeof item.created_at !== "string")) storageError();
    const sessions = row.sessions ?? [];
    if (!Array.isArray(sessions) || sessions.length > MAX_SESSIONS || sessions.some(session => !session ||
      typeof session.tokenHash !== "string" || !/^[a-f0-9]{64}$/.test(session.tokenHash) ||
      !Number.isFinite(session.createdAt) || !Number.isFinite(session.expiresAt) ||
      session.expiresAt <= session.createdAt || session.expiresAt - session.createdAt > SESSION_TTL)) storageError();
    users.push({ ...(row as unknown as LocalUser), email, isAdmin: false, savedItems: saved, sessions });
  }
  return users;
}

function withUsers<T>(operation: (users: LocalUser[]) => { value: T; changed?: boolean }): T {
  return transaction("accounts.json", raw => {
    const users = checkedUsers(raw);
    const migrated = JSON.stringify(users) !== JSON.stringify(raw);
    const result = operation(users);
    return { value: result.value, ...(migrated || result.changed ? { rows: users } : {}) };
  });
}

export function loadUsers(): LocalUser[] {
  return withUsers(users => ({ value: users }));
}

export function saveUsers(users: LocalUser[]): void {
  transaction("accounts.json", () => ({ value: undefined, rows: checkedUsers(users) }));
}

function normalizedEmail(email: string) {
  const value = typeof email === "string" ? email.trim().toLowerCase() : "";
  if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) throw new HttpError(400, "Enter a valid email address.");
  return value;
}

function checkedPassword(password: string) {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) throw new HttpError(400, "Use a password between 12 and 128 characters.");
  return password;
}

function passwordFields(password: string) {
  const salt = randomBytes(32).toString("hex");
  return { salt, passwordHash: scryptSync(password, salt, 64, PASSWORD_OPTIONS).toString("hex"), passwordVersion: 2 as const };
}

export function createLocalAccount(name: string, email: string, password: string): LocalUser {
  requireLocalAuth();
  const address = normalizedEmail(email);
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 100) throw new HttpError(400, "Enter a name between 2 and 100 characters.");
  const fields = passwordFields(checkedPassword(password));
  return withUsers(users => {
    if (users.some(user => user.email === address)) throw new HttpError(409, "An account with this email address already exists. Please sign in instead.");
    const user: LocalUser = { id: `usr-${randomBytes(16).toString("hex")}`, name: name.trim(), email: address, ...fields,
      createdAt: new Date().toISOString(), bio: "", isAdmin: false, savedItems: [], sessions: [] };
    users.push(user);
    return { value: user, changed: true };
  });
}

export function verifyLocalCredentials(email: string, password: string): LocalUser | null {
  if (!localAuthConfigured() || typeof password !== "string" || password.length < 1 || password.length > 128) return null;
  const address = normalizedEmail(email);
  return withUsers(users => {
    const user = users.find(item => item.email === address);
    if (!user) {
      scryptSync(password, "local-account-timing-only", 64, PASSWORD_OPTIONS);
      return { value: null };
    }
    const computed = user.passwordVersion === 2 ? scryptSync(password, user.salt, 64, PASSWORD_OPTIONS) : scryptSync(password, user.salt, 64);
    if (!timingSafeEqual(computed, Buffer.from(user.passwordHash, "hex"))) return { value: null };
    if (user.passwordVersion !== 2) {
      Object.assign(user, passwordFields(password), { sessions: [] });
      return { value: user, changed: true };
    }
    return { value: user };
  });
}

export function getLocalUserById(id: string): LocalUser | null {
  if (!localAuthConfigured()) return null;
  return withUsers(users => ({ value: users.find(user => user.id === id) || null }));
}

export function updateLocalUser(id: string, updates: { name?: string; bio?: string; password?: string }): LocalUser {
  requireLocalAuth();
  const fields = updates.password === undefined ? undefined : passwordFields(checkedPassword(updates.password));
  if (updates.name !== undefined && (typeof updates.name !== "string" || updates.name.trim().length < 2 || updates.name.trim().length > 100)) throw new HttpError(400, "Enter a valid display name.");
  if (updates.bio !== undefined && (typeof updates.bio !== "string" || updates.bio.length > 1000)) throw new HttpError(400, "Your biography must be 1000 characters or fewer.");
  return withUsers(users => {
    const user = users.find(item => item.id === id);
    if (!user) throw new HttpError(404, "User account not found.");
    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.bio !== undefined) user.bio = updates.bio;
    if (fields) Object.assign(user, fields, { sessions: [] });
    return { value: user, changed: true };
  });
}

export function toggleLocalSavedItem(userId: string, kind: "deal" | "article", slug: string, saved: boolean): void {
  if (!["deal", "article"].includes(kind) || typeof slug !== "string" || !slug || slug.length > 200) throw new HttpError(400, "Choose a valid saved item.");
  withUsers(users => {
    const user = users.find(item => item.id === userId);
    if (!user) throw new HttpError(404, "User account not found.");
    user.savedItems = user.savedItems || [];
    if (saved && !user.savedItems.some(item => item.kind === kind && item.slug === slug)) user.savedItems.unshift({ kind, slug, created_at: new Date().toISOString() });
    if (!saved) user.savedItems = user.savedItems.filter(item => item.kind !== kind || item.slug !== slug);
    return { value: undefined, changed: true };
  });
}

export function getLocalSavedItems(userId: string): Array<{ kind: "deal" | "article"; slug: string; created_at: string }> {
  return getLocalUserById(userId)?.savedItems || [];
}

function tokenHash(token: string) {
  return createHmac("sha256", Buffer.from(process.env.LOCAL_AUTH_SECRET!, "hex")).update(token).digest("hex");
}
const tokenFormat = (token: string) => typeof token === "string" && /^v2\.[a-z0-9_-]{43}$/i.test(token);

// Random bearer tokens have no client-controlled identity or expiry fields.
// Only a digest is persisted; deleting it revokes the session immediately.
export function createSessionToken(userId: string): string {
  return withUsers(users => {
    const user = users.find(item => item.id === userId);
    if (!user) throw new HttpError(401, "Sign in to continue.");
    const token = `v2.${randomBytes(32).toString("base64url")}`;
    const now = Date.now();
    user.sessions = [...(user.sessions || []).filter(session => session.expiresAt > now).slice(-(MAX_SESSIONS - 1)),
      { tokenHash: tokenHash(token), createdAt: now, expiresAt: now + SESSION_TTL }];
    return { value: token, changed: true };
  });
}

export function verifySessionToken(token: string): string | null {
  if (!localAuthConfigured() || !tokenFormat(token)) return null;
  try {
    const digest = Buffer.from(tokenHash(token), "hex");
    return withUsers(users => ({ value: users.find(user => user.sessions?.some(session => session.expiresAt > Date.now() &&
      timingSafeEqual(Buffer.from(session.tokenHash, "hex"), digest)))?.id || null }));
  } catch { return null; }
}

export function revokeSessionToken(token: string): void {
  if (!localAuthConfigured() || !tokenFormat(token)) return;
  const digest = tokenHash(token);
  withUsers(users => {
    let changed = false;
    for (const user of users) {
      const remaining = (user.sessions || []).filter(session => session.tokenHash !== digest);
      if (remaining.length !== user.sessions?.length) { user.sessions = remaining; changed = true; }
    }
    return { value: undefined, changed };
  });
}

export function revokeAllLocalSessions(userId: string): void {
  withUsers(users => {
    const user = users.find(item => item.id === userId);
    if (!user) throw new HttpError(404, "User account not found.");
    user.sessions = [];
    return { value: undefined, changed: true };
  });
}

export function saveLocalInquiry(kind: string, email: string, payload: Record<string, unknown>): { id: string } {
  return transaction("inquiries.json", rows => {
    if (rows.some(row => !row || typeof row !== "object" || Array.isArray(row))) storageError();
    const id = `inq-${randomBytes(16).toString("hex")}`;
    const inquiry: LocalInquiry = { id, kind, email, payload, status: "pending", createdAt: new Date().toISOString() };
    return { value: { id }, rows: [inquiry, ...rows] };
  });
}

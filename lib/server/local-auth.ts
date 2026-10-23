import { scryptSync, randomBytes, timingSafeEqual, createHmac } from "node:crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

export interface LocalUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  bio?: string;
  isAdmin?: boolean;
  savedItems?: Array<{ kind: "deal" | "article"; slug: string; created_at: string }>;
}

export interface LocalInquiry {
  id: string;
  kind: string;
  email: string;
  payload: Record<string, unknown>;
  status: string;
  createdAt: string;
}

const DATA_DIR = resolve(process.cwd(), ".local-data");
const USERS_FILE = resolve(DATA_DIR, "accounts.json");
const INQUIRIES_FILE = resolve(DATA_DIR, "inquiries.json");
const SECRET = process.env.RATE_LIMIT_SECRET || process.env.SESSION_SECRET || "saasfolio-local-session-secret-salt-2026";

function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    try {
      mkdirSync(DATA_DIR, { recursive: true });
    } catch {
      // In read-only or restricted environments, fallback gracefully
    }
  }
}

// In-memory cache to guarantee speed and consistency
let memoryUsers: LocalUser[] | null = null;
let memoryInquiries: LocalInquiry[] | null = null;

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString("hex");
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    const computed = scryptSync(password, salt, 64).toString("hex");
    const a = Buffer.from(computed, "hex");
    const b = Buffer.from(hash, "hex");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

function getSeedUsers(): LocalUser[] {
  const seedSalt1 = "saasfolio-seed-salt-01";
  const seedSalt2 = "saasfolio-seed-salt-02";
  return [
    {
      id: "usr-demo-001",
      name: "Demo Member",
      email: "demo@saasfolio.tech",
      passwordHash: hashPassword("Password1234!", seedSalt1),
      salt: seedSalt1,
      createdAt: new Date().toISOString(),
      bio: "Active SaaS discount hunter and developer.",
      isAdmin: false,
      savedItems: [
        { kind: "deal", slug: "hostinger-couponspage-code", created_at: new Date().toISOString() },
      ],
    },
    {
      id: "usr-admin-001",
      name: "SaaSFolio Staff",
      email: "owner@example.com",
      passwordHash: hashPassword("correct-password", seedSalt2),
      salt: seedSalt2,
      createdAt: new Date().toISOString(),
      bio: "Lead curator and catalog administrator.",
      isAdmin: true,
      savedItems: [],
    },
  ];
}

export function loadUsers(): LocalUser[] {
  ensureDataDir();
  if (existsSync(USERS_FILE)) {
    try {
      const content = readFileSync(USERS_FILE, "utf8");
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed;
        return parsed;
      }
    } catch {
      // If parsing fails, fall back to memory or seed
    }
  }
  if (memoryUsers && memoryUsers.length > 0) return memoryUsers;
  const seed = getSeedUsers();
  memoryUsers = seed;
  saveUsers(seed);
  return seed;
}

export function saveUsers(users: LocalUser[]): void {
  memoryUsers = users;
  ensureDataDir();
  try {
    writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  } catch {
    // If writing fails (e.g. read-only filesystem), in-memory cache remains active
  }
}

export function createLocalAccount(name: string, email: string, password: string): LocalUser {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error("An account with this email address already exists. Please sign in instead.");
  }

  const salt = randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const newUser: LocalUser = {
    id: `usr-${randomBytes(8).toString("hex")}`,
    name: name.trim().slice(0, 100),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
    bio: "",
    isAdmin: (process.env.ADMIN_EMAILS || "").toLowerCase().includes(normalizedEmail),
    savedItems: [],
  };

  users.push(newUser);
  saveUsers(users);
  return newUser;
}

export function verifyLocalCredentials(email: string, password: string): LocalUser | null {
  const users = loadUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (!user) return null;
  if (!verifyPassword(password, user.passwordHash, user.salt)) return null;
  return user;
}

export function getLocalUserById(id: string): LocalUser | null {
  const users = loadUsers();
  return users.find(u => u.id === id) || null;
}

export function updateLocalUser(id: string, updates: { name?: string; bio?: string; password?: string }): LocalUser {
  const users = loadUsers();
  const user = users.find(u => u.id === id);
  if (!user) throw new Error("User account not found.");

  if (updates.name !== undefined) user.name = updates.name.trim().slice(0, 100);
  if (updates.bio !== undefined) user.bio = updates.bio.slice(0, 1000);
  if (updates.password) {
    const salt = randomBytes(16).toString("hex");
    user.salt = salt;
    user.passwordHash = hashPassword(updates.password, salt);
  }

  saveUsers(users);
  return user;
}

export function toggleLocalSavedItem(userId: string, kind: "deal" | "article", slug: string, saved: boolean): void {
  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (!user) return;

  user.savedItems = user.savedItems || [];
  if (saved) {
    if (!user.savedItems.some(i => i.kind === kind && i.slug === slug)) {
      user.savedItems.unshift({ kind, slug, created_at: new Date().toISOString() });
    }
  } else {
    user.savedItems = user.savedItems.filter(i => !(i.kind === kind && i.slug === slug));
  }
  saveUsers(users);
}

export function getLocalSavedItems(userId: string): Array<{ kind: "deal" | "article"; slug: string; created_at: string }> {
  const user = getLocalUserById(userId);
  return user?.savedItems || [];
}

// Session Token Creation & Verification via HMAC
export function createSessionToken(userId: string): string {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
  const data = `${userId}:${expiresAt}`;
  const signature = createHmac("sha256", SECRET).update(data).digest("hex");
  return Buffer.from(`${data}:${signature}`).toString("base64url");
}

export function verifySessionToken(token: string): string | null {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [userId, expiresStr, signature] = decoded.split(":");
    if (!userId || !expiresStr || !signature) return null;

    const expiresAt = Number(expiresStr);
    if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return null;

    const expectedSignature = createHmac("sha256", SECRET).update(`${userId}:${expiresAt}`).digest("hex");
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expectedSignature, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

    return userId;
  } catch {
    return null;
  }
}

// Local Inquiries Storage
export function saveLocalInquiry(kind: string, email: string, payload: Record<string, unknown>): { id: string } {
  ensureDataDir();
  if (!memoryInquiries) {
    if (existsSync(INQUIRIES_FILE)) {
      try {
        memoryInquiries = JSON.parse(readFileSync(INQUIRIES_FILE, "utf8"));
      } catch {
        memoryInquiries = [];
      }
    } else {
      memoryInquiries = [];
    }
  }

  const id = `inq-${randomBytes(8).toString("hex")}`;
  const record: LocalInquiry = {
    id,
    kind,
    email,
    payload,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  memoryInquiries!.unshift(record);
  try {
    writeFileSync(INQUIRIES_FILE, JSON.stringify(memoryInquiries, null, 2), "utf8");
  } catch {
    // Memory cache active
  }
  return { id };
}

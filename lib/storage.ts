/**
 * Enterprise Resilient Storage Adapter
 * 
 * System Design Principle: Graceful Degradation & Fault Tolerance
 * Prevents application crashes in restricted environments (e.g., Safari Private Browsing,
 * iframe sandboxes, disabled cookies, or QuotaExceededError).
 */

class MemoryStorageFallback {
  private store = new Map<string, string>();

  getItem(key: string): string | null {
    return this.store.get(key) || null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

const memoryFallback = new MemoryStorageFallback();

export const SafeStorage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      try {
        const memItem = memoryFallback.getItem(key);
        if (memItem === null) return defaultValue;
        return JSON.parse(memItem) as T;
      } catch {
        return defaultValue;
      }
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") return false;
    try {
      const serialized = JSON.stringify(value);
      window.localStorage.setItem(key, serialized);
      return true;
    } catch {
      try {
        memoryFallback.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      memoryFallback.removeItem(key);
    }
  },
};

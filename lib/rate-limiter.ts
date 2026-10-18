/**
 * Enterprise Sliding Window Rate Limiter
 * 
 * System Design Principle: Defensive Programming, DDoS Mitigation & Resource Protection
 * Enforces per-action sliding window throttling on user interactions and form dispatches.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetSeconds: number;
  message?: string;
}

export function checkRateLimit(
  actionKey: string,
  maxAttempts: number = 5,
  windowSeconds: number = 60
): RateLimitResult {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const cutoff = now - windowMs;

  const record = rateLimitStore.get(actionKey) || { timestamps: [] };

  // Remove timestamps outside current sliding window
  const validTimestamps = record.timestamps.filter((ts) => ts > cutoff);

  if (validTimestamps.length >= maxAttempts) {
    const oldest = validTimestamps[0];
    const resetSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return {
      success: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
      message: `Rate limit exceeded. Please wait ${resetSeconds}s before attempting again.`,
    };
  }

  // Record this attempt
  validTimestamps.push(now);
  rateLimitStore.set(actionKey, { timestamps: validTimestamps });

  return {
    success: true,
    remaining: maxAttempts - validTimestamps.length,
    resetSeconds: windowSeconds,
  };
}

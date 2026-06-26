// In-memory rate limiter. Two guards:
//   1. Per-IP fixed window: MAX_PER_IP requests per WINDOW_MS
//   2. Global daily cap: MAX_GLOBAL_PER_DAY requests total across all users
//
// In-memory is fine for a single-process Nitro server. For multi-instance
// deploys, swap the Maps for Nitro useStorage (Redis/KV).

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 30; // 30 messages per IP per hour
const MAX_GLOBAL_PER_DAY = 500; // hard daily ceiling across all users

type IpRecord = { count: number; windowStart: number };

const ipMap = new Map<string, IpRecord>();

type DailyRecord = { count: number; dayStart: number };
let daily: DailyRecord = { count: 0, dayStart: todayStart() };

function todayStart(): number {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export type RateLimitResult =
  | { allowed: true }
  | { allowed: false; reason: "ip"; retryAfterMs: number }
  | { allowed: false; reason: "global" };

export function checkRateLimit(ip: string): RateLimitResult {
  const now = Date.now();

  // Reset daily counter at midnight.
  const today = todayStart();
  if (daily.dayStart < today) {
    daily = { count: 0, dayStart: today };
  }

  if (daily.count >= MAX_GLOBAL_PER_DAY) {
    return { allowed: false, reason: "global" };
  }

  // Per-IP window.
  const rec = ipMap.get(ip);
  if (!rec || now - rec.windowStart >= WINDOW_MS) {
    ipMap.set(ip, { count: 1, windowStart: now });
  } else {
    if (rec.count >= MAX_PER_IP) {
      const retryAfterMs = WINDOW_MS - (now - rec.windowStart);
      return { allowed: false, reason: "ip", retryAfterMs };
    }
    rec.count += 1;
  }

  daily.count += 1;
  return { allowed: true };
}

// Exposed for tests.
export function _resetForTests() {
  ipMap.clear();
  daily = { count: 0, dayStart: todayStart() };
}

export { MAX_PER_IP, MAX_GLOBAL_PER_DAY, WINDOW_MS };

import { describe, it, expect, beforeEach } from "vitest";
import {
  checkRateLimit,
  _resetForTests,
  MAX_PER_IP,
  MAX_GLOBAL_PER_DAY,
} from "../rate-limit";

beforeEach(() => _resetForTests());

describe("per-IP limit", () => {
  it("allows requests up to MAX_PER_IP", () => {
    for (let i = 0; i < MAX_PER_IP; i++) {
      expect(checkRateLimit("1.2.3.4").allowed).toBe(true);
    }
  });

  it("blocks the (MAX_PER_IP + 1)th request from the same IP", () => {
    for (let i = 0; i < MAX_PER_IP; i++) checkRateLimit("1.2.3.4");
    const result = checkRateLimit("1.2.3.4");
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe("ip");
  });

  it("different IPs have independent windows", () => {
    for (let i = 0; i < MAX_PER_IP; i++) checkRateLimit("1.1.1.1");
    expect(checkRateLimit("2.2.2.2").allowed).toBe(true);
  });

  it("retryAfterMs is positive when IP is blocked", () => {
    for (let i = 0; i < MAX_PER_IP; i++) checkRateLimit("5.5.5.5");
    const result = checkRateLimit("5.5.5.5");
    if (!result.allowed && result.reason === "ip") {
      expect(result.retryAfterMs).toBeGreaterThan(0);
    }
  });
});

describe("global daily cap", () => {
  it("blocks all IPs once global cap is hit", () => {
    // Each IP gets one request; exhaust cap across many IPs.
    for (let i = 0; i < MAX_GLOBAL_PER_DAY; i++) {
      checkRateLimit(`10.0.${Math.floor(i / 255)}.${i % 255}`);
    }
    const result = checkRateLimit("99.99.99.99");
    expect(result.allowed).toBe(false);
    if (!result.allowed) expect(result.reason).toBe("global");
  });
});

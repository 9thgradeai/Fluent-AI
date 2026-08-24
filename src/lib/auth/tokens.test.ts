import { describe, expect, it, beforeAll } from "vitest";
import { generateOpaqueToken, hashToken } from "./tokens";

beforeAll(() => {
  process.env.SESSION_SECRET = "a".repeat(48);
});

describe("session tokens", () => {
  it("generates a random opaque token", () => {
    const t = generateOpaqueToken();
    expect(t).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(generateOpaqueToken()).not.toBe(t);
  });

  it("hashes deterministically and differs from the raw token", () => {
    const raw = generateOpaqueToken();
    const h1 = hashToken(raw);
    const h2 = hashToken(raw);
    expect(h1).toBe(h2);
    expect(h1).not.toBe(raw);
    expect(h1).toMatch(/^[0-9a-f]{64}$/);
  });

  it("binds the hash to the secret", () => {
    const raw = generateOpaqueToken();
    const withA = hashToken(raw, "a".repeat(48));
    const withB = hashToken(raw, "b".repeat(48));
    expect(withA).not.toBe(withB);
  });
});

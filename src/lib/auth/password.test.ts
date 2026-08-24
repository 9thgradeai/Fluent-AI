import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("produces an argon2id hash", async () => {
    const h = await hashPassword("correct horse battery staple");
    expect(h.startsWith("$argon2id$")).toBe(true);
  });

  it("verifies the correct password", async () => {
    const h = await hashPassword("supersecret");
    expect(await verifyPassword(h, "supersecret")).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const h = await hashPassword("supersecret");
    expect(await verifyPassword(h, "wrong")).toBe(false);
  });

  it("produces unique salts", async () => {
    const a = await hashPassword("same");
    const b = await hashPassword("same");
    expect(a).not.toBe(b);
  });
});

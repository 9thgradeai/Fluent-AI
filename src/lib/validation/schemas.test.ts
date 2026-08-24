import { describe, expect, it } from "vitest";
import {
  registerSchema,
  loginSchema,
  sendMessageSchema,
  reviewSchema,
  createConversationSchema,
} from "./schemas";

describe("registerSchema", () => {
  it("accepts valid input", () => {
    const r = registerSchema.safeParse({ email: "A@B.com", password: "password123" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("a@b.com"); // normalized
  });

  it("rejects a short password", () => {
    const r = registerSchema.safeParse({ email: "a@b.com", password: "short" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const r = registerSchema.safeParse({ email: "nope", password: "password123" });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("normalizes email", () => {
    const r = loginSchema.safeParse({ email: "  USER@EXAMPLE.COM ", password: "x" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.email).toBe("user@example.com");
  });
});

describe("sendMessageSchema", () => {
  it("trims and requires content", () => {
    expect(sendMessageSchema.safeParse({ content: "   " }).success).toBe(false);
    expect(sendMessageSchema.safeParse({ content: "hello" }).success).toBe(true);
  });

  it("defaults completion to false", () => {
    const r = sendMessageSchema.safeParse({ content: "hi" });
    if (r.success) expect(r.data.completeConversation).toBe(false);
  });
});

describe("reviewSchema", () => {
  it("accepts 0..5", () => {
    expect(reviewSchema.safeParse({ quality: 0 }).success).toBe(true);
    expect(reviewSchema.safeParse({ quality: 5 }).success).toBe(true);
  });

  it("rejects out-of-range and non-integer", () => {
    expect(reviewSchema.safeParse({ quality: 6 }).success).toBe(false);
    expect(reviewSchema.safeParse({ quality: -1 }).success).toBe(false);
    expect(reviewSchema.safeParse({ quality: 2.5 }).success).toBe(false);
  });
});

describe("createConversationSchema", () => {
  it("applies defaults", () => {
    const r = createConversationSchema.safeParse({});
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.type).toBe("free");
      expect(r.data.accent).toBe("american");
    }
  });
});

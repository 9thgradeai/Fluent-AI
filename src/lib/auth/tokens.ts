// Session tokens (doc §6.3).
// Opaque random tokens; only their HMAC-SHA256 digest is stored at rest, keyed
// by SESSION_SECRET so a DB leak cannot be used to validate or guess tokens.

import { createHmac, randomBytes } from "node:crypto";

export function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a random string of at least 32 characters.",
    );
  }
  return secret;
}

/** Raw opaque token handed to the client (base64url, 256 bits of entropy). */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

/** Digest stored in the DB (HMAC-SHA256 hex keyed by SESSION_SECRET). */
export function hashToken(token: string, secret = getSessionSecret()): string {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export const TOKEN_TTL = {
  sessionMs: 30 * 24 * 60 * 60 * 1000, // 30 days
  refreshMs: 30 * 24 * 60 * 60 * 1000,
} as const;

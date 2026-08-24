// Password hashing — Argon2id (doc §6.2). Prebuilt native binding, no build
// step needed on Vercel Fluid Compute.

import { hash, verify } from "@node-rs/argon2";

const ARGON2 = {
  memoryCost: 19456, // 19 MiB (OWASP minimum recommendation)
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string): Promise<string> {
  return hash(password, ARGON2);
}

export async function verifyPassword(
  hashStr: string,
  password: string,
): Promise<boolean> {
  return verify(hashStr, password, ARGON2);
}

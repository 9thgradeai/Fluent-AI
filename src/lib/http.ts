// HTTP plumbing shared by route handlers.

import { randomUUID } from "node:crypto";
import { badRequest, toProblem, type ProblemDocument } from "./errors";
import { distributedRateLimit, type RateLimitResult } from "./cache";

export function getRequestId(req: Request): string {
  const existing = req.headers.get("x-request-id");
  return existing?.trim() || randomUUID();
}

export function clientIp(req: Request): string | null {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip");
}

/** Parse a JSON body, throwing a 400 problem if invalid. */
export async function readJson<T = Record<string, unknown>>(req: Request): Promise<T> {
  let data: unknown;
  try {
    data = await req.json();
  } catch {
    throw badRequest("Request body must be valid JSON.");
  }
  return data as T;
}

/** Serialize a problem+json error into a Response. */
export function problemResponse(problem: ProblemDocument, init?: ResponseInit): Response {
  return Response.json(problem, {
    status: problem.status,
    headers: { "content-type": "application/problem+json; charset=utf-8" },
    ...init,
  });
}

export function jsonOk(data: unknown, status = 200): Response {
  return Response.json(data, { status });
}

/**
 * Wrap a route handler so every error becomes an RFC 7807 problem response and
 * every response carries a request id. Second arg `ctx.params` is a Promise in
 * Next.js 15 — pass `await ctx.params`.
 */
export function api(
  fn: (req: Request, ctx: { params: Promise<Record<string, string | undefined>> }, requestId: string) => Promise<Response>,
): (req: Request, ctx: { params: Promise<Record<string, string | undefined>> }) => Promise<Response> {
  return async (req, ctx) => {
    const requestId = getRequestId(req);
    try {
      const res = await fn(req, ctx, requestId);
      res.headers.set("x-request-id", requestId);
      return res;
    } catch (err) {
      return problemResponse(toProblem(err, requestId), {
        headers: { "x-request-id": requestId },
      });
    }
  };
}

// ---------------------------------------------------------------------------
// Rate limiting — uses Redis when available, falls back to in-memory.
// ---------------------------------------------------------------------------

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

export async function rateLimit(
  key: string,
  opts: { limit: number; windowMs: number },
): Promise<RateResult> {
  const result: RateLimitResult = await distributedRateLimit(key, {
    limit: opts.limit,
    windowSec: Math.ceil(opts.windowMs / 1000),
  });

  if (result.ok) {
    return { ok: true };
  }
  return { ok: false, retryAfter: result.retryAfter };
}

/**
 * Synchronous rate limit (for backward compatibility).
 * Uses in-memory only. For production, prefer the async version.
 */
export function rateLimitSync(key: string, opts: { limit: number; windowMs: number }, now = Date.now()): RateResult {
  const windows = new Map<string, number[]>();
  const arr = windows.get(key) ?? [];
  const cutoff = now - opts.windowMs;
  const recent = arr.filter((t) => t > cutoff);
  if (recent.length >= opts.limit) {
    windows.set(key, recent);
    const oldest = recent[0] ?? now;
    return { ok: false, retryAfter: Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000)) };
  }
  recent.push(now);
  windows.set(key, recent);
  return { ok: true };
}

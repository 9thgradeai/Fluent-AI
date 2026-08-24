// Server-side session guard for route handlers (doc §6.3, §14.2 A01).

import { cookies } from "next/headers";
import { findLiveSession, touchSession } from "../db/repos/sessions";
import { unauthorized } from "../errors";
import { SESSION_COOKIE } from "./constants";

/** Resolve the live session from the request cookie, or null. */
export async function getSession() {
  const store = await cookies();
  const rawToken = store.get(SESSION_COOKIE)?.value;
  if (!rawToken) return null;
  const session = await findLiveSession(rawToken);
  if (!session) return null;
  return session;
}

/** Require an authenticated user; throws RFC 7807 unauthorized otherwise. */
export async function requireUser() {
  const session = await getSession();
  if (!session) throw unauthorized();
  if (session.user.status !== "active") throw unauthorized("Account is not active.");
  // Best-effort last-activity bump; never fails the request.
  void touchSession(session.id);
  return session.user;
}

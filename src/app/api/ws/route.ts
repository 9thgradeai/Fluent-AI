// WebSocket API route for realtime conversation.
// Handles upgrade, authentication, session management, and message routing.

import { NextRequest } from "next/server";
import { getSession } from "@/lib/auth/guard";
import { countUserSessions } from "@/lib/realtime/session-manager";
import { getEnv } from "@/lib/config/env";

export async function GET(_req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  const env = getEnv();

  // Check concurrent session limit
  const currentSessions = countUserSessions(session.userId);
  if (currentSessions >= env.MAX_CONCURRENT_SESSIONS_PER_USER) {
    return new Response("Too many concurrent sessions", { status: 429 });
  }

  return Response.json({
    success: true,
    data: {
      message: "WebSocket endpoint ready",
      maxConcurrentSessions: env.MAX_CONCURRENT_SESSIONS_PER_USER,
      currentSessions,
    },
  });
}

// Realtime session manager.
// Manages WebSocket connections, session lifecycle, and rate limiting.

import { ConversationStateMachine } from "./state-machine";
import { createLogger } from "../logging/logger";

const log = createLogger({ component: "session-manager" });

export interface RealtimeSession {
  id: string;
  userId: string;
  conversationId: string;
  state: ConversationStateMachine;
  connectedAt: Date;
  lastActivityAt: Date;
  turnCount: number;
  totalAudioMs: number;
  ws: WebSocket | null;
  abortController: AbortController;
}

// Active sessions
const sessions = new Map<string, RealtimeSession>();
const userSessions = new Map<string, Set<string>>(); // userId -> sessionIds

export interface CreateSessionOpts {
  userId: string;
  conversationId: string;
  ws: WebSocket;
}

/**
 * Create a new realtime session.
 */
export function createSession(opts: CreateSessionOpts): RealtimeSession {
  const session: RealtimeSession = {
    id: `rs_${Date.now()}_${Math.random().toString(36).slice(2)}`,
    userId: opts.userId,
    conversationId: opts.conversationId,
    state: new ConversationStateMachine(),
    connectedAt: new Date(),
    lastActivityAt: new Date(),
    turnCount: 0,
    totalAudioMs: 0,
    ws: opts.ws,
    abortController: new AbortController(),
  };

  sessions.set(session.id, session);

  // Track per-user sessions
  const userSessionSet = userSessions.get(opts.userId) ?? new Set();
  userSessionSet.add(session.id);
  userSessions.set(opts.userId, userSessionSet);

  log.info("Session created", { sessionId: session.id, userId: opts.userId });
  return session;
}

/**
 * Get an active session by ID.
 */
export function getSession(sessionId: string): RealtimeSession | null {
  return sessions.get(sessionId) ?? null;
}

/**
 * Get all sessions for a user.
 */
export function getUserSessions(userId: string): RealtimeSession[] {
  const ids = userSessions.get(userId) ?? new Set();
  return Array.from(ids).map((id) => sessions.get(id)).filter(Boolean) as RealtimeSession[];
}

/**
 * Count active sessions for a user.
 */
export function countUserSessions(userId: string): number {
  return getUserSessions(userId).length;
}

/**
 * Close and remove a session.
 */
export function closeSession(sessionId: string, reason?: string) {
  const session = sessions.get(sessionId);
  if (!session) return;

  try {
    session.abortController.abort();
    session.ws?.close(1000, reason ?? "Session closed");
  } catch {
    // Ignore close errors
  }

  sessions.delete(sessionId);

  const userSessionSet = userSessions.get(session.userId);
  if (userSessionSet) {
    userSessionSet.delete(sessionId);
    if (userSessionSet.size === 0) userSessions.delete(session.userId);
  }

  log.info("Session closed", { sessionId, reason });
}

/**
 * Send a message to a session's WebSocket.
 */
export function sendToSession(sessionId: string, message: Record<string, unknown>) {
  const session = sessions.get(sessionId);
  if (!session?.ws || session.ws.readyState !== WebSocket.OPEN) return;

  try {
    session.ws.send(JSON.stringify(message));
    session.lastActivityAt = new Date();
  } catch (err) {
    log.error("Failed to send to session", { sessionId, error: String(err) });
  }
}

/**
 * Sweep stale sessions (call periodically).
 */
export function sweepSessions(maxIdleMs = 30 * 60 * 1000) {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now - session.lastActivityAt.getTime() > maxIdleMs) {
      log.info("Sweeping stale session", { sessionId: id });
      closeSession(id, "Idle timeout");
    }
  }
}

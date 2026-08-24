import { prisma } from "../prisma";
import { hashToken, TOKEN_TTL } from "../../auth/tokens";

export async function createSession(opts: {
  userId: string;
  rawToken: string;
  ip?: string | null;
  userAgent?: string | null;
  kind?: "web" | "mobile" | "sdk";
}) {
  const now = new Date();
  return prisma.userSession.create({
    data: {
      userId: opts.userId,
      tokenHash: hashToken(opts.rawToken),
      // Same token drives rotation; refresh token hashed identically for now.
      refreshTokenHash: hashToken(`${opts.rawToken}:refresh`),
      expiresAt: new Date(now.getTime() + TOKEN_TTL.sessionMs),
      lastActiveAt: now,
      ip: opts.ip ?? null,
      userAgent: opts.userAgent ?? null,
      kind: opts.kind ?? "web",
    },
  });
}

/** Find a live session by raw token, verifying it isn't expired/revoked. */
export async function findLiveSession(rawToken: string) {
  const tokenHash = hashToken(rawToken);
  const session = await prisma.userSession.findUnique({
    where: { tokenHash },
    include: { user: { include: { profile: true } } },
  });
  if (!session) return null;
  if (session.revokedAt || session.expiresAt < new Date()) {
    return null;
  }
  return session;
}

export async function touchSession(id: string) {
  await prisma.userSession.update({
    where: { id },
    data: { lastActiveAt: new Date() },
  });
}

export async function revokeSession(id: string) {
  return prisma.userSession.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
}

export async function revokeAllSessions(userId: string) {
  return prisma.userSession.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function listSessions(userId: string) {
  return prisma.userSession.findMany({
    where: { userId, revokedAt: null },
    orderBy: { lastActiveAt: "desc" },
    take: 20,
  });
}

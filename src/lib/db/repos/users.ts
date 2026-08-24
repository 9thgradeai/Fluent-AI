import { prisma } from "../prisma";
import type { EnglishLevel } from "@prisma/client";

export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();

export async function createUser(opts: {
  email: string;
  passwordHash: string;
  displayName?: string;
  englishLevel?: EnglishLevel;
}) {
  const email = normalizeEmail(opts.email);
  return prisma.user.create({
    data: {
      email,
      passwordHash: opts.passwordHash,
      profile: {
        create: {
          displayName: opts.displayName?.trim() || email.split("@")[0] || "Learner",
          englishLevel: opts.englishLevel ?? "B1",
        },
      },
    },
    include: { profile: true },
  });
}

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email: normalizeEmail(email) },
    include: { profile: true },
  });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: { profile: true },
  });
}

export async function getPublicProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true, streak: true },
  });
  if (!user || !user.profile) return null;
  return {
    id: user.id,
    email: user.email,
    displayName: user.profile.displayName,
    avatarUrl: user.profile.avatarUrl,
    englishLevel: user.profile.englishLevel,
    nativeLanguage: user.profile.nativeLanguage,
    currentXp: user.profile.currentXp,
    level: user.profile.level,
    goals: user.profile.goals,
    timezone: user.profile.timezone,
    emailVerified: Boolean(user.emailVerifiedAt),
    streak: user.streak?.currentStreak ?? 0,
  };
}

export async function patchProfile(
  userId: string,
  data: {
    displayName?: string;
    englishLevel?: EnglishLevel;
    nativeLanguage?: string;
    timezone?: string;
    goals?: unknown;
  },
) {
  return prisma.userProfile.update({
    where: { userId },
    data: {
      ...(data.displayName !== undefined ? { displayName: data.displayName } : {}),
      ...(data.englishLevel !== undefined ? { englishLevel: data.englishLevel } : {}),
      ...(data.nativeLanguage !== undefined ? { nativeLanguage: data.nativeLanguage } : {}),
      ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
      ...(data.goals !== undefined ? { goals: data.goals as object } : {}),
    },
  });
}

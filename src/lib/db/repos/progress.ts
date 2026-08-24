import { prisma } from "../prisma";
import { awardXp, applyStreak, dateKey, type StreakState } from "../../domain/learning";
import type { Skill, XpReason } from "@prisma/client";

/** Sum of XP earned by a user on a given calendar day (from the immutable ledger). */
export async function getDayXp(userId: string, day: Date): Promise<number> {
  const start = new Date(day);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  const agg = await prisma.xpLedger.aggregate({
    where: { userId, occurredAt: { gte: start, lt: end } },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? 0;
}

/**
 * Award XP, honoring the daily cap and appending to the immutable ledger.
 * Returns the amount actually awarded (0 when capped).
 */
export async function awardXpLedger(
  userId: string,
  reason: XpReason,
  opts: { refId?: string; streak?: number },
): Promise<number> {
  const today = new Date();
  const prior = await getDayXp(userId, today);
  const amount = awardXp(reason, { priorDayTotal: prior, streak: opts.streak });
  if (amount <= 0) return 0;

  await prisma.$transaction([
    prisma.xpLedger.create({
      data: { userId, amount, reason, refId: opts.refId, occurredAt: today },
    }),
    prisma.userProfile.update({
      where: { userId },
      data: { currentXp: { increment: amount } },
    }),
  ]);
  return amount;
}

/** Get or create a user's streak row. */
export async function getStreakState(userId: string): Promise<StreakState> {
  const row = await prisma.streak.findUnique({ where: { userId } });
  return {
    current: row?.currentStreak ?? 0,
    best: row?.bestStreak ?? 0,
    lastActiveDate: row?.lastActiveDate ? dateKey(row.lastActiveDate) : null,
    freezeAvailable: row?.freezeAvailable ?? true,
  };
}

/** Apply today's activity to the streak, persist, and return the full result. */
export async function bumpStreak(
  userId: string,
  now = new Date(),
): Promise<import("../../domain/learning").StreakResult> {
  const before = await getStreakState(userId);
  const result = applyStreak(before, now);
  const lastActiveDate = new Date(`${result.lastActiveDate}T00:00:00Z`);
  await prisma.streak.upsert({
    where: { userId },
    create: {
      userId,
      currentStreak: result.current,
      bestStreak: result.best,
      lastActiveDate,
      freezeAvailable: result.freezeAvailable,
    },
    update: {
      currentStreak: result.current,
      bestStreak: result.best,
      lastActiveDate,
      freezeAvailable: result.freezeAvailable,
    },
  });
  return result;
}

export async function upsertLearningProgress(opts: {
  userId: string;
  date: Date;
  skill: Skill;
  xp?: number;
  messages?: number;
  sessions?: number;
  minutes?: number;
  accuracy?: number;
  fluency?: number;
}) {
  const day = new Date(opts.date);
  day.setUTCHours(0, 0, 0, 0);
  const existing = await prisma.learningProgress.findUnique({
    where: { userId_date_skill: { userId: opts.userId, date: day, skill: opts.skill } },
  });
  return prisma.learningProgress.upsert({
    where: {
      userId_date_skill: { userId: opts.userId, date: day, skill: opts.skill },
    },
    create: {
      userId: opts.userId,
      date: day,
      skill: opts.skill,
      xp: opts.xp ?? 0,
      messagesCount: opts.messages ?? 0,
      sessionsCount: opts.sessions ?? 0,
      minutes: opts.minutes ?? 0,
      accuracyAvg: opts.accuracy ?? null,
      fluencyAvg: opts.fluency ?? null,
    },
    update: {
      ...(opts.xp ? { xp: { increment: opts.xp } } : {}),
      ...(opts.messages ? { messagesCount: { increment: opts.messages } } : {}),
      ...(opts.sessions ? { sessionsCount: { increment: opts.sessions } } : {}),
      ...(opts.minutes ? { minutes: { increment: opts.minutes } } : {}),
      ...(existing ? {} : {}),
    },
  });
}

export type DashboardData = {
  currentXp: number;
  level: number;
  streak: number;
  bestStreak: number;
  freezeAvailable: boolean;
  todayXp: number;
  recent: { date: string; skill: Skill; xp: number; minutes: number; messagesCount: number }[];
  totals: { vocab: number; mastered: number; conversations: number };
};

export async function getDashboard(userId: string): Promise<DashboardData> {
  const [profile, streak, todayXp, progressRows, vocab, conversations] =
    await Promise.all([
      prisma.userProfile.findUnique({ where: { userId } }),
      prisma.streak.findUnique({ where: { userId } }),
      getDayXp(userId, new Date()),
      prisma.learningProgress.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 30,
      }),
      prisma.vocabularyItem.findMany({
        where: { userId },
        select: { id: true, status: true },
      }),
      prisma.conversation.count({ where: { userId } }),
    ]);

  return {
    currentXp: profile?.currentXp ?? 0,
    level: profile?.level ?? 1,
    streak: streak?.currentStreak ?? 0,
    bestStreak: streak?.bestStreak ?? 0,
    freezeAvailable: streak?.freezeAvailable ?? true,
    todayXp,
    recent: progressRows.map((r) => ({
      date: dateKey(r.date),
      skill: r.skill,
      xp: r.xp,
      minutes: r.minutes,
      messagesCount: r.messagesCount,
    })),
    totals: {
      vocab: vocab.length,
      mastered: vocab.filter((v) => v.status === "mastered").length,
      conversations,
    },
  };
}

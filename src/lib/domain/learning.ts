// Learning Engine — pure, unit-testable rules.
// See docs/backend-architecture.md §10. No I/O here; callers persist results.

import type { XpReason, VocabStatus } from "@prisma/client";

// ---------------------------------------------------------------------------
// XP
// ---------------------------------------------------------------------------

export const XP = {
  messageTurn: 2,
  conversationCompleted: 20,
  streakBonusBase: 5,
  dailyReviewCompleted: 10,
  /** Max XP any single user can earn in one day (anti-gaming, doc §10.4). */
  dailyCap: 100,
} as const;

/** How much XP a reason is worth, pre-cap. */
export function rawXp(reason: XpReason, streak = 0): number {
  switch (reason) {
    case "message_turn":
      return XP.messageTurn;
    case "conversation_completed":
      return XP.conversationCompleted;
    case "streak_bonus":
      // Bonus scales modestly with streak, capped to keep it sane.
      return Math.min(XP.streakBonusBase * Math.max(streak, 1), XP.streakBonusBase * 5);
    case "daily_review":
      return XP.dailyReviewCompleted;
    case "exercise_attempted":
      return 5;
    case "admin_adjustment":
      return 0;
  }
}

/**
 * Compute the amount actually awarded given what the user has already earned today.
 * Returns 0 once the daily cap is reached. Idempotent-friendly: caller passes the
 * prior day total (before this award).
 */
export function awardXp(
  reason: XpReason,
  opts: { priorDayTotal: number; streak?: number },
): number {
  if (opts.priorDayTotal >= XP.dailyCap) return 0;
  const gross = rawXp(reason, opts.streak);
  return Math.min(gross, Math.max(0, XP.dailyCap - opts.priorDayTotal));
}

/** Level curve: 0-based root growth so early levels come fast, later ones slow. */
export function levelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

// ---------------------------------------------------------------------------
// Streaks (doc §10.4: freeze mechanic)
// ---------------------------------------------------------------------------

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + days);
  return out;
}

export type StreakState = {
  current: number;
  best: number;
  lastActiveDate: string | null;
  freezeAvailable: boolean;
};

export type StreakResult = StreakState & {
  freezeUsed: boolean;
  streakBonus: number;
};

/**
 * Compute the new streak state given today's activity.
 * - Practicing today keeps the streak; practicing yesterday bumps it by one.
 * - Missing a day consumes the freeze (once) instead of resetting.
 * - Missing more than a day, or with no freeze left, resets to 1.
 */
export function applyStreak(
  state: StreakState,
  today: Date,
): StreakResult {
  const todayKey = dateKey(today);
  const yesterdayKey = dateKey(addDays(today, -1));

  // Already counted today — no change.
  if (state.lastActiveDate === todayKey) {
    return { ...state, freezeUsed: false, streakBonus: 0 };
  }

  const isConsecutive = state.lastActiveDate === yesterdayKey;

  // First-ever activity.
  if (state.lastActiveDate === null) {
    return {
      current: 1,
      best: Math.max(state.best, 1),
      lastActiveDate: todayKey,
      freezeAvailable: state.freezeAvailable,
      freezeUsed: false,
      streakBonus: 0,
    };
  }

  if (isConsecutive) {
    const current = state.current + 1;
    return {
      current,
      best: Math.max(state.best, current),
      lastActiveDate: todayKey,
      freezeAvailable: state.freezeAvailable,
      freezeUsed: false,
      streakBonus: XP.streakBonusBase * Math.min(current, 5),
    };
  }

  // Missed exactly one day and a freeze is available: preserve the streak.
  const lastKey = state.lastActiveDate;
  const oneDayGap = dateKey(addDays(new Date(`${lastKey}T00:00:00Z`), 1)) === yesterdayKey;
  if (oneDayGap && state.freezeAvailable) {
    return {
      ...state,
      lastActiveDate: todayKey,
      freezeAvailable: false,
      freezeUsed: true,
      streakBonus: XP.streakBonusBase,
    };
  }

  // Streak broken.
  return {
    current: 1,
    best: state.best,
    lastActiveDate: todayKey,
    freezeAvailable: state.freezeAvailable,
    freezeUsed: false,
    streakBonus: 0,
  };
}

// ---------------------------------------------------------------------------
// SRS — SM-2 (doc §10.2). Quality q ∈ [0,5].
// ---------------------------------------------------------------------------

export type SrsState = { reps: number; easeFactor: number; intervalDays: number };

const EASE_MIN = 1.3;

export function sm2(
  quality: number,
  state: SrsState,
  now: Date,
): SrsState & { nextReviewAt: Date } {
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Any grade below 3 is a fail → repeat today.
  if (q < 3) {
    return { ...state, reps: 0, nextReviewAt: now };
  }

  let { reps, easeFactor, intervalDays } = state;
  reps += 1;
  easeFactor = Math.max(
    EASE_MIN,
    easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  if (reps === 1) intervalDays = 1;
  else if (reps === 2) intervalDays = 6;
  else intervalDays = Math.max(1, Math.round(intervalDays * easeFactor));

  return { reps, easeFactor, intervalDays, nextReviewAt: addDays(now, intervalDays) };
}

/** Suggested next status for a vocabulary item given an SM-2 result. */
export function vocabStatusFromSrs(state: SrsState): VocabStatus {
  if (state.reps === 0) return "learning";
  if (state.reps < 3) return "learning";
  if (state.intervalDays < 21) return "reviewing";
  return "mastered";
}

import { describe, expect, it } from "vitest";
import {
  XP,
  awardXp,
  applyStreak,
  levelFromXp,
  sm2,
  vocabStatusFromSrs,
  dateKey,
  addDays,
} from "./learning";

const T = new Date("2026-08-08T12:00:00Z");

describe("XP rules", () => {
  it("awards the base amount when under the daily cap", () => {
    expect(awardXp("message_turn", { priorDayTotal: 0 })).toBe(XP.messageTurn);
    expect(awardXp("conversation_completed", { priorDayTotal: 0 })).toBe(XP.conversationCompleted);
  });

  it("returns 0 once the daily cap is reached", () => {
    expect(awardXp("message_turn", { priorDayTotal: XP.dailyCap })).toBe(0);
    expect(awardXp("conversation_completed", { priorDayTotal: XP.dailyCap - 5 })).toBe(5);
  });

  it("clips a large award to the cap remainder", () => {
    expect(awardXp("conversation_completed", { priorDayTotal: XP.dailyCap - 10 })).toBe(10);
  });

  it("maps XP to a rising level curve", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(200)).toBe(3);
    expect(levelFromXp(5000)).toBeGreaterThan(1);
  });
});

describe("streaks", () => {
  it("starts a brand-new streak at 1", () => {
    const r = applyStreak(
      { current: 0, best: 0, lastActiveDate: null, freezeAvailable: true },
      T,
    );
    expect(r.current).toBe(1);
    expect(r.best).toBe(1);
    expect(r.freezeUsed).toBe(false);
  });

  it("does not double-count the same day", () => {
    const r = applyStreak(
      { current: 3, best: 5, lastActiveDate: dateKey(T), freezeAvailable: true },
      T,
    );
    expect(r.current).toBe(3);
  });

  it("bumps the streak when practiced yesterday", () => {
    const yesterday = dateKey(addDays(T, -1));
    const r = applyStreak(
      { current: 4, best: 6, lastActiveDate: yesterday, freezeAvailable: true },
      T,
    );
    expect(r.current).toBe(5);
    expect(r.best).toBe(6);
    expect(r.streakBonus).toBeGreaterThan(0);
  });

  it("consumes a freeze after missing exactly one day", () => {
    // Practiced two days ago, missed yesterday → freeze preserves the streak.
    const gap = dateKey(addDays(T, -2));
    const r = applyStreak(
      { current: 7, best: 10, lastActiveDate: gap, freezeAvailable: true },
      T,
    );
    expect(r.current).toBe(7);
    expect(r.freezeUsed).toBe(true);
    expect(r.freezeAvailable).toBe(false);
  });

  it("does not freeze a gap of more than one day", () => {
    const gap = dateKey(addDays(T, -3)); // last activity two days ago
    const r = applyStreak(
      { current: 7, best: 10, lastActiveDate: gap, freezeAvailable: true },
      T,
    );
    expect(r.current).toBe(1);
    expect(r.freezeUsed).toBe(false);
  });

  it("resets the streak when the gap is too long and no freeze", () => {
    const gap = dateKey(addDays(T, -5));
    const r = applyStreak(
      { current: 9, best: 12, lastActiveDate: gap, freezeAvailable: false },
      T,
    );
    expect(r.current).toBe(1);
    expect(r.best).toBe(12);
  });
});

describe("SM-2 spaced repetition", () => {
  it("fails below grade 3 and schedules an immediate review", () => {
    const r = sm2(1, { reps: 2, easeFactor: 2.5, intervalDays: 6 }, T);
    expect(r.reps).toBe(0);
    expect(r.intervalDays).toBe(6);
    expect(r.nextReviewAt.getTime()).toBe(T.getTime());
  });

  it("schedules 1 day then 6 days for the first two passes", () => {
    const first = sm2(4, { reps: 0, easeFactor: 2.5, intervalDays: 0 }, T);
    expect(first.intervalDays).toBe(1);
    const second = sm2(4, { reps: first.reps, easeFactor: first.easeFactor, intervalDays: first.intervalDays }, T);
    expect(second.intervalDays).toBe(6);
  });

  it("grows the interval by the ease factor thereafter", () => {
    const r = sm2(5, { reps: 3, easeFactor: 2.5, intervalDays: 6 }, T);
    expect(r.intervalDays).toBe(Math.round(6 * r.easeFactor));
    expect(r.reps).toBe(4);
  });

  it("never drops the ease factor below the floor", () => {
    const r = sm2(3, { reps: 0, easeFactor: 1.3, intervalDays: 1 }, T);
    expect(r.easeFactor).toBeGreaterThanOrEqual(1.3);
  });
});

describe("vocab status", () => {
  it("tracks learning → reviewing → mastered", () => {
    expect(vocabStatusFromSrs({ reps: 0, easeFactor: 2.5, intervalDays: 0 })).toBe("learning");
    expect(vocabStatusFromSrs({ reps: 2, easeFactor: 2.5, intervalDays: 6 })).toBe("learning");
    expect(vocabStatusFromSrs({ reps: 3, easeFactor: 2.5, intervalDays: 10 })).toBe("reviewing");
    expect(vocabStatusFromSrs({ reps: 5, easeFactor: 2.5, intervalDays: 30 })).toBe("mastered");
  });
});

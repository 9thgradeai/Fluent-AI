import { prisma } from "../prisma";
import { sm2, vocabStatusFromSrs } from "../../domain/learning";
import type { AddedFrom, VocabStatus } from "@prisma/client";

export async function listVocabulary(userId: string, status?: VocabStatus) {
  return prisma.vocabularyItem.findMany({
    where: { userId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
}

export async function createVocabulary(
  userId: string,
  opts: {
    term: string;
    definition?: string;
    example?: string;
    level?: string;
    wordClass?: string;
    addedFrom?: AddedFrom;
  },
) {
  const term = opts.term.trim();
  return prisma.vocabularyItem.upsert({
    where: { userId_term: { userId, term } },
    create: {
      userId,
      term,
      definition: opts.definition,
      example: opts.example,
      level: opts.level,
      wordClass: opts.wordClass,
      addedFrom: opts.addedFrom ?? "manual",
    },
    update: {
      definition: opts.definition,
      example: opts.example,
      level: opts.level,
      wordClass: opts.wordClass,
    },
  });
}

export async function patchVocabulary(
  userId: string,
  id: string,
  data: Partial<{ definition: string; example: string; status: VocabStatus }>,
) {
  return prisma.vocabularyItem.updateMany({
    where: { id, userId },
    data,
  });
}

/** Items due for spaced-repetition review. */
export async function dueVocabulary(userId: string) {
  return prisma.vocabularyItem.findMany({
    where: { userId, status: { not: "mastered" }, dueAt: { lte: new Date() } },
    orderBy: { dueAt: "asc" },
    take: 30,
  });
}

/** Apply an SM-2 grade (quality 0–5) to a vocabulary item. */
export async function reviewVocabulary(
  userId: string,
  id: string,
  quality: number,
) {
  const item = await prisma.vocabularyItem.findFirst({ where: { id, userId } });
  if (!item) return null;

  const srs = sm2(quality, {
    reps: item.reviewCount,
    easeFactor: item.easeFactor,
    intervalDays: item.intervalDays,
  }, new Date());

  return prisma.vocabularyItem.update({
    where: { id },
    data: {
      reviewCount: srs.reps,
      easeFactor: srs.easeFactor,
      intervalDays: srs.intervalDays,
      dueAt: srs.nextReviewAt,
      status: vocabStatusFromSrs(srs),
      streakDays: quality >= 3 ? { increment: 1 } : 0,
    },
  });
}

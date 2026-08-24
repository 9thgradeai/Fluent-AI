// Coaching feedback generation (doc §8.2 Structured Output, §22).
// Real providers use a schema-constrained generateObject call; the mock uses
// deterministic heuristics so the app works offline.

import { generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { feedbackSchema, type Feedback } from "./schemas";
import { modelFor, type ProviderName } from "./provider";
import type { Accent, ConversationType } from "@prisma/client";

export async function gradeMessage(opts: {
  content: string;
  accent: Accent;
  type: ConversationType;
  provider: ProviderName;
}): Promise<Feedback> {
  if (opts.provider === "mock") return heuristicGrade(opts.content);
  try {
    return await llmGrade(opts);
  } catch {
    // Never fail the turn because grading hiccuped.
    return heuristicGrade(opts.content);
  }
}

async function llmGrade(opts: {
  content: string;
  accent: Accent;
  type: ConversationType;
  provider: ProviderName;
}): Promise<Feedback> {
  const model = opts.provider === "anthropic"
    ? anthropic(modelFor("anthropic"))
    : openai(modelFor("openai"));
  const { object } = await generateObject({
    model,
    schema: feedbackSchema,
    system:
      "You are FluentAI, an English communication coach. Grade the learner's message " +
      "for a " + opts.type + " practice, in an " + opts.accent + " accent context. " +
      "Be kind, specific, and concise. Only flag genuine issues.",
    prompt: opts.content,
  });
  return object;
}

// ---------------------------------------------------------------------------
// Deterministic heuristic grader (offline / fallback).
// ---------------------------------------------------------------------------

const FILLERS = ["um", "uh", "like", "you know", "basically", "actually"];

export function heuristicGrade(content: string): Feedback {
  const words = content.trim().split(/\s+/).filter(Boolean);
  const issues = [];
  const tips = [];

  const firstChar = content.trim().charAt(0);
  if (firstChar && firstChar === firstChar.toLowerCase() && /[a-z]/.test(firstChar)) {
    issues.push({
      original: content.trim().slice(0, 24) + (content.trim().length > 24 ? "…" : ""),
      suggestion: "Start your sentence with a capital letter.",
      explanation: "English sentences begin with an uppercase letter.",
      severity: "low" as const,
    });
  }
  if (!/[.!?]$/.test(content.trim()) && content.trim().length > 0) {
    issues.push({
      original: content.trim().slice(-24),
      suggestion: "End with proper punctuation.",
      explanation: "Finishing with a period, question mark, or exclamation keeps your writing clear.",
      severity: "low" as const,
    });
  }
  const repeated = findRepeatedWord(words);
  if (repeated) {
    issues.push({
      original: repeated.word,
      suggestion: `Try a synonym for “${repeated.word}”.`,
      explanation: `“${repeated.word}” appeared ${repeated.count} times — vary your word choice for fluency.`,
      severity: "medium" as const,
    });
    tips.push(`You used “${repeated.word}” several times. Synonyms keep speech natural.`);
  }
  const fillerCount = words.filter((w) => FILLERS.includes(w.toLowerCase())).length;
  if (fillerCount > 0) {
    tips.push(`You used ${fillerCount} filler word${fillerCount > 1 ? "s" : ""} — pausing briefly is a cleaner habit.`);
  }
  if (words.length <= 6 && words.length > 0) {
    tips.push("Try extending your answer with an example or a reason.");
  }
  if (tips.length === 0) {
    tips.push("Great pacing — keep speaking in full, connected sentences.");
  }

  // Simple score: start at 70, adjust for signals.
  let score = 70;
  if (issues.length === 0) score += 20;
  if (repeated) score -= 10;
  if (fillerCount > 2) score -= 5;
  score = Math.max(40, Math.min(98, score));

  return {
    overall: issues.length
      ? "Solid attempt — a few small fixes will make it shine."
      : "Clean message. Strong, natural English.",
    score,
    grammarIssues: issues.slice(0, 5),
    fluencyTips: tips.slice(0, 3),
    vocabSuggestions: [],
  };
}

function findRepeatedWord(words: string[]): { word: string; count: number } | null {
  const counts = new Map<string, number>();
  for (const w of words) {
    const key = w.toLowerCase().replace(/[^a-z]/g, "");
    if (key.length < 4) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  for (const [word, count] of counts) {
    if (count >= 3) return { word, count };
  }
  return null;
}

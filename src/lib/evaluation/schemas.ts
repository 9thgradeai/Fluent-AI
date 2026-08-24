// Evaluation engine schemas and types.
// Covers grammar, vocabulary, fluency, pronunciation, clarity, and professional communication.

import { z } from "zod";

// --- Per-message evaluation ---

export const grammarIssueSchema = z.object({
  original: z.string(),
  suggestion: z.string(),
  explanation: z.string(),
  severity: z.enum(["low", "medium", "high"]),
  category: z.string().optional(),
});

export const vocabularySuggestionSchema = z.object({
  term: z.string(),
  definition: z.string(),
  example: z.string().optional(),
  level: z.string().optional(),
  strongerAlternative: z.string().optional(),
});

export const feedbackSchema = z.object({
  overall: z.string(),
  score: z.number().int().min(0).max(100),
  grammarIssues: z.array(grammarIssueSchema).max(5),
  fluencyTips: z.array(z.string()).max(3),
  vocabSuggestions: z.array(vocabularySuggestionSchema).max(3),
});

export type Feedback = z.infer<typeof feedbackSchema>;
export type GrammarIssue = z.infer<typeof grammarIssueSchema>;
export type VocabularySuggestion = z.infer<typeof vocabularySuggestionSchema>;

// --- Full conversation evaluation ---

export const conversationEvaluationSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  grammarScore: z.number().int().min(0).max(100),
  vocabularyScore: z.number().int().min(0).max(100),
  fluencyScore: z.number().int().min(0).max(100),
  pronunciationScore: z.number().int().min(0).max(100).optional(),
  clarityScore: z.number().int().min(0).max(100),
  professionalCommunicationScore: z.number().int().min(0).max(100).optional(),

  strengths: z.array(z.string()).max(5),
  corrections: z.array(grammarIssueSchema).max(10),
  recommendations: z.array(z.object({
    area: z.string(),
    suggestion: z.string(),
    priority: z.enum(["high", "medium", "low"]),
  })).max(5),
  summary: z.string(),
});

export type ConversationEvaluation = z.infer<typeof conversationEvaluationSchema>;

// --- Scoring weights per scenario type ---

export interface ScoringWeights {
  grammar: number;
  vocabulary: number;
  fluency: number;
  pronunciation: number;
  clarity: number;
  taskPerformance: number;
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  grammar: 0.25,
  vocabulary: 0.20,
  fluency: 0.20,
  pronunciation: 0.10,
  clarity: 0.15,
  taskPerformance: 0.10,
};

export const SCENARIO_SCORING_WEIGHTS: Record<string, Partial<ScoringWeights>> = {
  interview: {
    grammar: 0.15,
    vocabulary: 0.15,
    fluency: 0.15,
    clarity: 0.25,
    taskPerformance: 0.30,
  },
  business: {
    grammar: 0.15,
    vocabulary: 0.20,
    fluency: 0.15,
    clarity: 0.25,
    taskPerformance: 0.25,
  },
  presentation: {
    grammar: 0.10,
    vocabulary: 0.15,
    fluency: 0.20,
    clarity: 0.30,
    taskPerformance: 0.25,
  },
  negotiation: {
    grammar: 0.10,
    vocabulary: 0.20,
    fluency: 0.15,
    clarity: 0.25,
    taskPerformance: 0.30,
  },
};

/**
 * Calculate weighted overall score from component scores.
 */
export function calculateOverallScore(
  scores: {
    grammar: number;
    vocabulary: number;
    fluency: number;
    pronunciation?: number;
    clarity: number;
    taskPerformance?: number;
  },
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
): number {
  const pronunciation = scores.pronunciation ?? 75; // default if not measured
  const taskPerformance = scores.taskPerformance ?? 75;

  const overall =
    scores.grammar * weights.grammar +
    scores.vocabulary * weights.vocabulary +
    scores.fluency * weights.fluency +
    pronunciation * weights.pronunciation +
    scores.clarity * weights.clarity +
    taskPerformance * weights.taskPerformance;

  return Math.round(Math.max(0, Math.min(100, overall)));
}

/**
 * Get scoring weights for a conversation type.
 */
export function getScoringWeights(type: string): ScoringWeights {
  const overrides = SCENARIO_SCORING_WEIGHTS[type] ?? {};
  return { ...DEFAULT_SCORING_WEIGHTS, ...overrides };
}

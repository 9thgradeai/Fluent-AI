// Structured outputs for the coaching feedback (doc §8.2 "Structured Output").
// Used both to validate mock output and as the zod schema for real-provider
// generateObject calls.

import { z } from "zod";

export const grammarIssueSchema = z.object({
  original: z.string(),
  suggestion: z.string(),
  explanation: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

export const vocabularySuggestionSchema = z.object({
  term: z.string(),
  definition: z.string(),
  example: z.string().optional(),
  level: z.string().optional(),
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

// Request validation — zod at every API boundary (doc §3, §7.1).

import { z } from "zod";

export const ACCENTS = [
  "american",
  "british",
  "australian",
  "canadian",
  "irish",
  "indian",
] as const;

export const CONVERSATION_TYPES = [
  "free",
  "roleplay",
  "interview",
  "meeting",
  "ielts",
  "toefl",
  "business",
] as const;

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required."),
  password: z.string().min(8, "Password must be at least 8 characters.").max(128),
  displayName: z.string().trim().min(1).max(80).optional(),
  englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required."),
  password: z.string().min(1, "Password is required."),
});

export const createConversationSchema = z.object({
  type: z.enum(CONVERSATION_TYPES).default("free"),
  accent: z.enum(ACCENTS).default("american"),
  scenarioId: z.string().max(120).optional().nullable(),
  title: z.string().trim().min(1).max(120).optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "Message cannot be empty.").max(8000),
  completeConversation: z.boolean().optional().default(false),
});

export const createVocabularySchema = z.object({
  term: z.string().trim().min(1).max(120),
  definition: z.string().trim().max(2000).optional(),
  example: z.string().trim().max(2000).optional(),
  level: z.string().trim().max(20).optional(),
  wordClass: z.string().trim().max(40).optional(),
});

export const patchVocabularySchema = z.object({
  definition: z.string().trim().max(2000).optional(),
  example: z.string().trim().max(2000).optional(),
  status: z.enum(["new", "learning", "reviewing", "mastered"]).optional(),
});

export const reviewSchema = z.object({
  quality: z.number().int().min(0).max(5),
});

export const patchProfileSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
  englishLevel: z.enum(["A1", "A2", "B1", "B2", "C1", "C2"]).optional(),
  nativeLanguage: z.string().trim().min(2).max(8).optional(),
  timezone: z.string().trim().max(64).optional(),
  goals: z.array(z.string()).max(20).optional(),
});

// Conversation evaluation API route.
// Provides comprehensive evaluation of a completed conversation.

import { requireUser } from "@/lib/auth/guard";
import { api, readJson } from "@/lib/http";
import { badRequest, notFound } from "@/lib/errors";
import { getConversation } from "@/lib/db/repos/conversations";
import {
  conversationEvaluationSchema,
  calculateOverallScore,
  getScoringWeights,
} from "@/lib/evaluation/schemas";
import { getResolvedProvider, getModelForProvider } from "@/lib/config/env";
import { getPrompt } from "@/lib/ai/prompts";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const evaluateSchema = z.object({
  conversationId: z.string(),
});

export const POST = api(async (req, _ctx) => {
  const user = await requireUser();

  const parsed = evaluateSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  const conversation = await getConversation(user.id, parsed.data.conversationId);
  if (!conversation) throw notFound();

  const messages = conversation.messages;
  if (messages.length < 2) {
    throw badRequest("Conversation must have at least 2 messages to evaluate.");
  }

  const provider = getResolvedProvider();

  // Build evaluation prompt
  const transcript = messages
    .map((m) => `${m.role === "user" ? "Learner" : "Coach"}: ${m.content}`)
    .join("\n\n");

  const evalPrompt = getPrompt("conversation-evaluation", "v1");
  const systemPromptRaw = evalPrompt?.system ?? "Evaluate this English conversation.";
  const systemPrompt = typeof systemPromptRaw === "function"
    ? systemPromptRaw({ type: conversation.type })
    : systemPromptRaw;

  // Use the provider for evaluation if available
  let evaluation;
  try {
    if (provider !== "mock") {
      const model = provider === "openai"
        ? (await import("@ai-sdk/openai")).openai(getModelForProvider("openai"))
        : (await import("@ai-sdk/anthropic")).anthropic(getModelForProvider("anthropic"));

      const { generateObject } = await import("ai");
      const { object } = await generateObject({
        model,
        schema: conversationEvaluationSchema,
        system: systemPrompt,
        prompt: `Evaluate this conversation:\n\n${transcript}`,
      });
      evaluation = object;
    }
  } catch {
    // Fall back to heuristic evaluation
  }

  // Fallback heuristic evaluation
  if (!evaluation) {
    evaluation = heuristicEvaluation(messages);
  }

  // Get scoring weights based on conversation type
  const weights = getScoringWeights(conversation.type);

  // Ensure overall score is consistent with weights
  evaluation.overallScore = calculateOverallScore({
    grammar: evaluation.grammarScore,
    vocabulary: evaluation.vocabularyScore,
    fluency: evaluation.fluencyScore,
    clarity: evaluation.clarityScore,
  }, weights);

  return Response.json({
    success: true,
    data: {
      evaluation,
      conversationType: conversation.type,
      messageCount: messages.length,
      durationSec: conversation.durationSec,
    },
  });
});

function heuristicEvaluation(messages: Array<{ role: string; content: string }>) {
  const userMessages = messages.filter((m) => m.role === "user");
  const allText = userMessages.map((m) => m.content).join(" ");
  const words = allText.split(/\s+/).filter(Boolean);
  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z]/g, "")));

  // Grammar score (heuristic)
  let grammarScore = 75;
  if (/[.!?]\s*$/.test(allText)) grammarScore += 5;
  if (/^[A-Z]/.test(allText)) grammarScore += 5;
  grammarScore = Math.min(95, grammarScore);

  // Vocabulary score (based on diversity)
  const vocabDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;
  const vocabularyScore = Math.round(Math.min(95, 50 + vocabDiversity * 50));

  // Fluency score (based on message length and coherence)
  const avgWordsPerMessage = words.length / Math.max(1, userMessages.length);
  const fluencyScore = Math.round(Math.min(95, 60 + avgWordsPerMessage * 2));

  // Clarity score
  const clarityScore = Math.round(Math.min(95, grammarScore * 0.6 + vocabularyScore * 0.4));

  return {
    overallScore: 75,
    grammarScore,
    vocabularyScore,
    fluencyScore,
    clarityScore,
    strengths: [
      "Maintained conversation flow",
      "Used appropriate vocabulary for the context",
    ],
    corrections: [],
    recommendations: [
      { area: "vocabulary", suggestion: "Try using more varied vocabulary", priority: "medium" as const },
      { area: "fluency", suggestion: "Practice speaking in longer, more connected sentences", priority: "low" as const },
    ],
    summary: "Good conversation practice. The learner maintained engagement and communicated their ideas clearly.",
  };
}

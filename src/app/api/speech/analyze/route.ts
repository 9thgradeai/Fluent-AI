// Speech analysis API route.
// Accepts transcript and audio metrics, returns comprehensive analysis.

import { requireUser } from "@/lib/auth/guard";
import { api, readJson } from "@/lib/http";
import { badRequest } from "@/lib/errors";
import { analyzeSpeechMetrics, analyzePronunciation, analyzeDelivery } from "@/lib/speech/analysis";
import { z } from "zod";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyzeSpeechSchema = z.object({
  transcript: z.string().min(1),
  durationMs: z.number().int().positive(),
  conversationId: z.string().optional(),
});

export const POST = api(async (req, _ctx) => {
  await requireUser();

  const parsed = analyzeSpeechSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  const { transcript, durationMs } = parsed.data;

  const speechMetrics = analyzeSpeechMetrics(transcript, durationMs);
  const pronunciation = analyzePronunciation(transcript);
  const delivery = analyzeDelivery(speechMetrics);

  return Response.json({
    success: true,
    data: {
      speechMetrics,
      pronunciation,
      delivery,
      recommendations: generateRecommendations(speechMetrics, delivery),
    },
  });
});

function generateRecommendations(
  speechMetrics: ReturnType<typeof analyzeSpeechMetrics>,
  delivery: ReturnType<typeof analyzeDelivery>,
): string[] {
  const recs: string[] = [];

  if (speechMetrics.fillerWordRate > 5) {
    recs.push("Practice pausing silently instead of using filler words like 'um' and 'uh'.");
  }
  if (speechMetrics.wordsPerMinute < 120) {
    recs.push("Try speaking at a slightly faster pace — aim for 120-160 words per minute.");
  }
  if (speechMetrics.wordsPerMinute > 160) {
    recs.push("Slow down slightly — clear articulation is more important than speed.");
  }
  if (speechMetrics.repetitionCount > 2) {
    recs.push("Practice rephrasing ideas instead of repeating the same words.");
  }
  if (delivery.hasExcessivePauses) {
    recs.push("Work on maintaining flow — brief pauses are natural, but extended silence can lose your listener.");
  }

  if (recs.length === 0) {
    recs.push("Your speech metrics look good — keep practicing to maintain consistency!");
  }

  return recs;
}

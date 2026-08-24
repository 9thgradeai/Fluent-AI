import { requireUser } from "@/lib/auth/guard";
import {
  addMessage,
  completeConversation,
  getConversation,
} from "@/lib/db/repos/conversations";
import {
  awardXpLedger,
  bumpStreak,
  upsertLearningProgress,
} from "@/lib/db/repos/progress";
import { buildChatStream, buildCoachSystemPrompt, type TurnMeta } from "@/lib/ai/gateway";
import { sendMessageSchema } from "@/lib/validation/schemas";
import { api, rateLimit, readJson } from "@/lib/http";
import { badRequest, notFound } from "@/lib/errors";
import { checkCostLimit } from "@/lib/ai/cost-tracker";
import type { MessageRole } from "@prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req, ctx) => {
  const user = await requireUser();
  const { id: conversationId } = await ctx.params;
  if (!conversationId) throw notFound();

  const rl = await rateLimit(`chat:${user.id}`, { limit: 60, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { type: "https://api.fluentai.app/errors/rate_limited", title: "Rate limit exceeded", status: 429, detail: "Too many messages. Try again shortly.", retry_after: rl.retryAfter },
      { status: 429 },
    );
  }

  // Check daily AI cost limit
  await checkCostLimit(user.id);

  const parsed = sendMessageSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  const conversation = await getConversation(user.id, conversationId);
  if (!conversation) throw notFound();
  if (conversation.status !== "active") {
    throw badRequest("This conversation is already completed.");
  }
  const { accent, type } = conversation;
  const level = conversation.user?.profile?.englishLevel ?? "B1";
  const content = parsed.data.content;

  // Persist the learner's turn and award learning progress.
  const userMessage = await addMessage({
    conversationId,
    role: "user",
    content,
    accent,
  });
  const streakResult = await bumpStreak(user.id);
  const turnXp = await awardXpLedger(user.id, "message_turn", {
    refId: userMessage.id,
    streak: streakResult.current,
  });
  if (streakResult.streakBonus > 0) {
    await awardXpLedger(user.id, "streak_bonus", {
      refId: userMessage.id,
      streak: streakResult.current,
    });
  }
  await upsertLearningProgress({
    userId: user.id,
    date: new Date(),
    skill: "speaking",
    messages: 1,
    xp: turnXp,
  });

  // Assemble context for the coach from prior messages.
  const turns = conversation.messages
    .filter((m) => m.role !== "system")
    .map((m) => ({ role: m.role as MessageRole, content: m.content }));

  const system = buildCoachSystemPrompt({ accent, type, level });

  const stream = buildChatStream({
    system,
    turns,
    accent,
    type,
    userContent: content,
    async onAssistantContent(assistantContent, meta: TurnMeta) {
      const assistant = await addMessage({
        conversationId,
        role: "assistant",
        content: assistantContent,
        accent,
        meta: { feedback: meta.feedback, provider: meta.provider, model: meta.model },
      });
      const xp = await awardXpLedger(user.id, "message_turn", { refId: assistant.id });
      if (xp) {
        await upsertLearningProgress({
          userId: user.id,
          date: new Date(),
          skill: "grammar",
          messages: 1,
          xp,
        });
      }
      meta.messageId = assistant.id;

      if (parsed.data.completeConversation) {
        await completeConversation(conversationId);
        const doneStreak = await bumpStreak(user.id);
        const doneXp = await awardXpLedger(user.id, "conversation_completed", {
          refId: conversationId,
          streak: doneStreak.current,
        });
        await upsertLearningProgress({
          userId: user.id,
          date: new Date(),
          skill: "speaking",
          sessions: 1,
          xp: doneXp,
        });
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-accel-buffering": "no",
      "cache-control": "no-store",
    },
  });
});

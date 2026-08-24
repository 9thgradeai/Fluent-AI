// AI conversation gateway — refactored to use provider abstraction.
// Streams the coach's reply, then appends a trailing metadata line with
// structured feedback + message id.

import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { getResolvedProvider, getModelForProvider } from "../config/env";
import { mockCoachReply } from "./mock";
import { gradeMessage } from "./grade";
import type { Feedback } from "./schemas";
import type { Accent, ConversationType } from "@prisma/client";

export const META_MARKER = "__FLUENTAI_META__";

export type ChatTurn = { role: "user" | "assistant" | "system"; content: string };

export type TurnMeta = {
  provider: string;
  model: string;
  feedback: Feedback;
  messageId?: string;
};

export function buildCoachSystemPrompt(opts: {
  accent: Accent;
  type: ConversationType;
  level: string;
}): string {
  return [
    `You are FluentAI, a warm and expert English communication coach.`,
    `Speak in a natural ${opts.accent} English register for ${opts.type} practice.`,
    `Match the learner's level (${opts.level}). Keep responses encouraging, concise, and conversational — 1 to 3 sentences.`,
    `You are having a real, unscripted conversation. Ask a follow-up question or invite elaboration each turn.`,
    `Never break character as the coach.`,
  ].join("\n");
}

export function buildChatStream(opts: {
  system: string;
  turns: ChatTurn[];
  accent: Accent;
  type: ConversationType;
  userContent: string;
  onAssistantContent: (content: string, meta: TurnMeta) => Promise<void> | void;
}): ReadableStream<Uint8Array> {
  const provider = getResolvedProvider();

  // Grade the learner's turn concurrently so it's ready when the stream ends.
  const gradePromise = gradeMessage({
    content: opts.userContent,
    accent: opts.accent,
    type: opts.type,
    provider,
  });

  const source =
    provider === "mock"
      ? mockStream(
          mockCoachReply({
            accent: opts.accent,
            type: opts.type,
            userContent: opts.userContent,
          }),
        )
      : providerStream(provider, opts.system, opts.turns);

  const decoder = new TextDecoder();
  let buffer = "";

  const transform = new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });
      controller.enqueue(chunk);
    },
    async flush(controller) {
      const feedback = await gradePromise;
      const model = getModelForProvider(provider);
      const meta: TurnMeta = { provider, model, feedback };
      const content = buffer.trim();
      if (content) await opts.onAssistantContent(content, meta);
      controller.enqueue(
        new TextEncoder().encode(`\n${META_MARKER}${JSON.stringify(meta)}`),
      );
    },
  });

  return source.pipeThrough(transform);
}

function providerStream(
  provider: "openai" | "anthropic",
  system: string,
  turns: ChatTurn[],
): ReadableStream<Uint8Array> {
  const modelId = getModelForProvider(provider);
  const model =
    provider === "anthropic"
      ? anthropic(modelId)
      : openai(modelId);
  const result = streamText({
    model,
    system,
    messages: turns
      .filter((t) => t.role !== "system")
      .map((t) => ({ role: t.role, content: t.content })),
  });
  return result.toTextStreamResponse().body!;
}

function mockStream(text: string): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const chunks: Uint8Array[] = [];
  for (let i = 0; i < text.length; i += 40) {
    chunks.push(enc.encode(text.slice(i, i + 40)));
  }
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(c);
      controller.close();
    },
  });
}

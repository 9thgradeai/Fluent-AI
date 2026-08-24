// OpenAI provider implementation using Vercel AI SDK v7.

import { streamText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import type {
  ConversationModel,
  ConversationStreamOptions,
  ConversationStreamResult,
  StructuredOutputOptions,
  StructuredOutputResult,
} from "./ConversationProvider";
import { createLogger } from "../../../logging/logger";

const log = createLogger({ provider: "openai" });

export class OpenAIConversationProvider implements ConversationModel {
  readonly provider = "openai";
  readonly modelId: string;

  constructor(modelId?: string) {
    this.modelId = modelId ?? process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  }

  async streamResponse(opts: ConversationStreamOptions): Promise<ConversationStreamResult> {
    const model = openai(this.modelId);
    const startTime = Date.now();

    log.debug("Starting stream", { model: this.modelId, messageCount: opts.messages.length });

    const result = streamText({
      model,
      system: opts.systemPrompt,
      messages: opts.messages
        .filter((m) => m.role !== "system")
        .map((m) => ({ role: m.role, content: m.content })),
      temperature: opts.temperature,
      maxOutputTokens: opts.maxTokens,
    });

    // Collect text and await usage (both are PromiseLike in v7)
    const [text, usage, finishReason] = await Promise.all([
      result.text,
      result.usage,
      result.finishReason,
    ]);

    log.info("Stream completed", {
      model: this.modelId,
      latencyMs: Date.now() - startTime,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
    });

    return {
      text,
      usage: {
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
        estimatedCostUsd: this.estimateCost(
          usage.inputTokens ?? 0,
          usage.outputTokens ?? 0,
        ),
      },
      finishReason: finishReason ?? "stop",
      provider: this.provider,
      model: this.modelId,
    };
  }

  async generateStructured<T>(opts: StructuredOutputOptions<T>): Promise<StructuredOutputResult<T>> {
    const model = openai(this.modelId);
    const startTime = Date.now();

    log.debug("Generating structured output", { model: this.modelId });

    const { object, usage } = await generateObject({
      model,
      schema: opts.schema,
      system: opts.systemPrompt,
      prompt: opts.prompt,
      temperature: opts.temperature,
      maxOutputTokens: opts.maxTokens,
    });

    log.info("Structured output completed", {
      model: this.modelId,
      latencyMs: Date.now() - startTime,
    });

    return {
      object,
      usage: {
        inputTokens: usage.inputTokens ?? 0,
        outputTokens: usage.outputTokens ?? 0,
        totalTokens: usage.totalTokens ?? 0,
        estimatedCostUsd: this.estimateCost(usage.inputTokens ?? 0, usage.outputTokens ?? 0),
      },
      provider: this.provider,
      model: this.modelId,
    };
  }

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY);
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    // gpt-4o-mini pricing: $0.15/1M input, $0.60/1M output
    const inputCost = (inputTokens / 1_000_000) * 0.15;
    const outputCost = (outputTokens / 1_000_000) * 0.60;
    return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
  }
}

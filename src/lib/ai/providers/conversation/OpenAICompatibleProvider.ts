// OpenAI-compatible provider for vLLM, Ollama, Together AI, Groq, etc.
// Uses the same API shape as OpenAI — any endpoint implementing the OpenAI API spec works.

import { streamText, generateObject } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import type {
  ConversationModel,
  ConversationStreamOptions,
  ConversationStreamResult,
  StructuredOutputOptions,
  StructuredOutputResult,
} from "./ConversationProvider";
import { createLogger } from "../../../logging/logger";

const log = createLogger({ provider: "openai-compatible" });

export interface OpenAICompatibleConfig {
  baseURL: string;
  apiKey?: string;
  modelId: string;
  /** Pricing per 1M tokens (optional, for cost tracking). Set to 0 for self-hosted. */
  costPerMillionInput?: number;
  costPerMillionOutput?: number;
}

export class OpenAICompatibleProvider implements ConversationModel {
  readonly provider = "openai-compatible";
  readonly modelId: string;
  private readonly baseURL: string;
  private readonly apiKey?: string;
  private readonly costInput: number;
  private readonly costOutput: number;
  private readonly aiProvider;

  constructor(config?: Partial<OpenAICompatibleConfig>) {
    const baseURL = config?.baseURL ?? process.env.AI_BASE_URL;
    if (!baseURL) throw new Error("AI_BASE_URL is required for openai-compatible provider");

    this.baseURL = baseURL;
    this.apiKey = config?.apiKey ?? process.env.AI_API_KEY ?? process.env.OPENAI_API_KEY;
    this.modelId = config?.modelId ?? process.env.AI_MODEL ?? "qwen/qwen-2.5-72b-instruct";

    // Default to $0 cost for self-hosted models (user can override)
    this.costInput = config?.costPerMillionInput ?? 0;
    this.costOutput = config?.costPerMillionOutput ?? 0;

    // Create the OpenAI-compatible provider instance
    this.aiProvider = createOpenAI({
      baseURL: this.baseURL,
      ...(this.apiKey ? { apiKey: this.apiKey } : {}),
    });

    log.info("Initialized", { baseURL: this.baseURL, model: this.modelId });
  }

  private getModel() {
    return this.aiProvider.chat(this.modelId);
  }

  async streamResponse(opts: ConversationStreamOptions): Promise<ConversationStreamResult> {
    const model = this.getModel();
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
    const model = this.getModel();
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
    try {
      // For self-hosted endpoints, just check if the base URL responds
      const healthUrl = this.baseURL.replace(/\/$/, "") + "/models";
      const res = await fetch(healthUrl, {
        method: "GET",
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        signal: AbortSignal.timeout(5_000),
      });
      return res.ok;
    } catch {
      // Fallback: if we have a base URL configured, assume it's available
      return Boolean(this.baseURL);
    }
  }

  private estimateCost(inputTokens: number, outputTokens: number): number {
    if (this.costInput === 0 && this.costOutput === 0) return 0; // self-hosted
    const inputCost = (inputTokens / 1_000_000) * this.costInput;
    const outputCost = (outputTokens / 1_000_000) * this.costOutput;
    return Math.round((inputCost + outputCost) * 1_000_000) / 1_000_000;
  }
}

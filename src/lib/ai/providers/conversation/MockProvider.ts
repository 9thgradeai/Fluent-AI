// Deterministic mock provider for development and testing.
// Works fully offline without API keys.

import type {
  ConversationModel,
  ConversationStreamOptions,
  ConversationStreamResult,
  StructuredOutputOptions,
  StructuredOutputResult,
  TokenUsage,
} from "./ConversationProvider";
import { createLogger } from "../../../logging/logger";

const log = createLogger({ provider: "mock" });

const MOCK_RESPONSES: Record<string, string[]> = {
  interview: [
    "That's a solid answer. Can you give me a specific example from your experience where you applied that skill?",
    "Interesting approach. How would you handle a situation where the requirements changed mid-project?",
    "Good point about communication. Tell me about a time you had to explain a complex technical concept to a non-technical stakeholder.",
  ],
  business: [
    "I understand your concern. What specific metrics would you use to measure the success of this initiative?",
    "That's a compelling proposal. How does this align with our current quarterly objectives?",
    "Let me push back on that — what happens if we don't see results in the first 90 days?",
  ],
  free: [
    "That's interesting! Tell me more about that. What made you interested in this topic?",
    "Great point. How do you think that compares to other approaches you've seen?",
    "I appreciate you sharing that. Could you elaborate on the most challenging part?",
  ],
};

function pickResponse(type: string): string {
  const pool = MOCK_RESPONSES[type] ?? MOCK_RESPONSES.free;
  return pool[Math.floor(Math.random() * pool.length)]!;
}

export class MockConversationProvider implements ConversationModel {
  readonly provider = "mock";
  readonly modelId = "fluentai-mock";

  async streamResponse(opts: ConversationStreamOptions): Promise<ConversationStreamResult> {
    log.debug("Mock stream response");

    // Extract the conversation type from the system prompt
    const typeMatch = opts.systemPrompt.match(/for (\w+) practice/i);
    const type = typeMatch?.[1] ?? "free";

    const response = pickResponse(type);

    // Simulate streaming by splitting into chunks
    const tokens = response.split(/(?<=\s)/);
    for (const token of tokens) {
      opts.onToken?.(token);
    }

    const usage: TokenUsage = {
      inputTokens: opts.messages.reduce((acc, m) => acc + m.content.split(/\s+/).length, 0),
      outputTokens: response.split(/\s+/).length,
      totalTokens: 0,
      estimatedCostUsd: 0,
    };
    usage.totalTokens = usage.inputTokens + usage.outputTokens;

    return {
      text: response,
      usage,
      finishReason: "stop",
      provider: this.provider,
      model: this.modelId,
    };
  }

  async generateStructured<T>(_opts: StructuredOutputOptions<T>): Promise<StructuredOutputResult<T>> {
    log.debug("Mock structured output");

    // For mock, we can't generate valid structured output without the actual schema
    // Throw to trigger fallback in the calling code
    throw new Error("Mock provider does not support structured output. Use heuristic fallback.");
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

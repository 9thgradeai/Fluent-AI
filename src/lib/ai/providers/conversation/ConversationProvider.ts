// Provider-agnostic conversation model interface.
// All AI providers implement this contract. Business logic depends only on this.

export interface ConversationMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConversationStreamOptions {
  systemPrompt: string;
  messages: ConversationMessage[];
  temperature?: number;
  maxTokens?: number;
  onToken?: (token: string) => void;
  signal?: AbortSignal;
}

export interface ConversationStreamResult {
  text: string;
  usage: TokenUsage;
  finishReason: string;
  provider: string;
  model: string;
}

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd?: number;
}

export interface StructuredOutputOptions<T> {
  systemPrompt: string;
  prompt: string;
  schema: import("zod").ZodType<T>;
  temperature?: number;
  maxTokens?: number;
  signal?: AbortSignal;
}

export interface StructuredOutputResult<T> {
  object: T;
  usage: TokenUsage;
  provider: string;
  model: string;
}

export interface ConversationModel {
  readonly provider: string;
  readonly modelId: string;

  /** Stream a conversation response */
  streamResponse(opts: ConversationStreamOptions): Promise<ConversationStreamResult>;

  /** Generate a structured output (for evaluation, grading, etc.) */
  generateStructured<T>(opts: StructuredOutputOptions<T>): Promise<StructuredOutputResult<T>>;

  /** Health check */
  isAvailable(): Promise<boolean>;
}

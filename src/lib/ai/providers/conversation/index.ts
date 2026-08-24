// Provider factory and registry.
// Resolves the correct provider based on configuration.

import type { ConversationModel } from "./ConversationProvider";
import { OpenAIConversationProvider } from "./OpenAIProvider";
import { AnthropicConversationProvider } from "./AnthropicProvider";
import { MockConversationProvider } from "./MockProvider";
import { getResolvedProvider, getModelForProvider } from "../../../config/env";

let cachedProvider: ConversationModel | null = null;

export async function getConversationModel(): Promise<ConversationModel> {
  if (cachedProvider) return cachedProvider;

  const providerName = getResolvedProvider();
  const modelId = getModelForProvider(providerName);

  switch (providerName) {
    case "openai":
      cachedProvider = new OpenAIConversationProvider(modelId);
      break;
    case "anthropic":
      cachedProvider = new AnthropicConversationProvider(modelId);
      break;
    default:
      cachedProvider = new MockConversationProvider();
  }

  return cachedProvider;
}

// Allow explicit provider override (useful for testing)
export function setConversationModel(model: ConversationModel) {
  cachedProvider = model;
}

// Reset to allow re-resolution
export function resetConversationModel() {
  cachedProvider = null;
}

export type { ConversationModel } from "./ConversationProvider";
export type {
  ConversationMessage,
  ConversationStreamOptions,
  ConversationStreamResult,
  StructuredOutputOptions,
  StructuredOutputResult,
  TokenUsage,
} from "./ConversationProvider";

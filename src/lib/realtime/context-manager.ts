// Context manager for conversations.
// Manages token budgets, context windows, and conversation memory.

import type { ConversationMessage } from "../ai/providers/conversation";
import { createLogger } from "../logging/logger";

const log = createLogger({ component: "context-manager" });

export interface ConversationContext {
  /** Recent conversation turns (within token budget) */
  recentTurns: ConversationMessage[];
  /** Summary of earlier conversation */
  summary?: string;
  /** Important facts extracted from the conversation */
  facts: string[];
  /** Current scenario state */
  scenarioState?: ScenarioState;
  /** User profile relevant to this conversation */
  userProfile?: UserContextProfile;
  /** RAG-retrieved knowledge */
  retrievedKnowledge?: string[];
  /** Total estimated tokens */
  estimatedTokens: number;
}

export interface ScenarioState {
  scenarioId: string;
  currentTurn: number;
  maxTurns?: number;
  objectivesCompleted: string[];
  objectivesRemaining: string[];
  difficulty: string;
  personaContext: string;
}

export interface UserContextProfile {
  englishLevel: string;
  nativeLanguage: string;
  goals: string[];
  recentWeaknesses: string[];
  recentStrengths: string[];
  vocabularyTargets: string[];
}

export interface TokenBudget {
  maxTokens: number;
  systemPromptTokens: number;
  scenarioTokens: number;
  profileTokens: number;
  ragTokens: number;
  availableForHistory: number;
}

/**
 * Build an optimized conversation context within a token budget.
 */
export function buildContext(opts: {
  messages: ConversationMessage[];
  summary?: string;
  facts?: string[];
  scenarioState?: ScenarioState;
  userProfile?: UserContextProfile;
  retrievedKnowledge?: string[];
  tokenBudget: TokenBudget;
}): ConversationContext {
  const { messages, summary, facts, scenarioState, userProfile, retrievedKnowledge, tokenBudget } = opts;

  // Estimate tokens for each component (rough: 1 token ≈ 4 chars)
  const estimateTokens = (text: string) => Math.ceil(text.length / 4);

  let usedTokens = tokenBudget.systemPromptTokens + tokenBudget.scenarioTokens +
    tokenBudget.profileTokens + tokenBudget.ragTokens;

  // Add summary if provided
  const summaryText = summary;
  if (summaryText) {
    usedTokens += estimateTokens(summaryText);
  }

  // Add facts
  const factsList = facts ?? [];
  usedTokens += factsList.reduce((acc, f) => acc + estimateTokens(f), 0);

  // Add recent turns, fitting within remaining budget
  const availableForHistory = Math.max(0, tokenBudget.availableForHistory - usedTokens + tokenBudget.systemPromptTokens);
  const recentTurns: ConversationMessage[] = [];
  let historyTokens = 0;

  // Walk backwards through messages, adding as many as fit
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i]!;
    const msgTokens = estimateTokens(msg.content);
    if (historyTokens + msgTokens > availableForHistory) break;
    recentTurns.unshift(msg);
    historyTokens += msgTokens;
  }

  const totalEstimated = usedTokens + historyTokens;

  log.debug("Context built", {
    turnCount: recentTurns.length,
    totalMessages: messages.length,
    estimatedTokens: totalEstimated,
    budgetUsed: Math.round((totalEstimated / tokenBudget.maxTokens) * 100) + "%",
  });

  return {
    recentTurns,
    summary: summaryText,
    facts: factsList,
    scenarioState,
    userProfile,
    retrievedKnowledge,
    estimatedTokens: totalEstimated,
  };
}

/**
 * Convert context to messages array for the AI model.
 */
export function contextToMessages(context: ConversationContext): ConversationMessage[] {
  const messages: ConversationMessage[] = [];

  // Add summary as system context if available
  if (context.summary) {
    messages.push({
      role: "system",
      content: `Previous conversation summary: ${context.summary}`,
    });
  }

  // Add important facts
  if (context.facts.length > 0) {
    messages.push({
      role: "system",
      content: `Important context: ${context.facts.join("; ")}`,
    });
  }

  // Add RAG knowledge
  if (context.retrievedKnowledge && context.retrievedKnowledge.length > 0) {
    messages.push({
      role: "system",
      content: `Relevant information: ${context.retrievedKnowledge.join("; ")}`,
    });
  }

  // Add recent turns
  messages.push(...context.recentTurns);

  return messages;
}

/**
 * Extract important facts from a conversation.
 */
export function extractFacts(messages: ConversationMessage[]): string[] {
  const facts: string[] = [];
  const seen = new Set<string>();

  for (const msg of messages) {
    // Look for factual statements (heuristic)
    const sentences = msg.content.split(/[.!?]+/).filter((s) => s.trim().length > 10);
    for (const sentence of sentences) {
      const trimmed = sentence.trim();
      // Heuristic: sentences with years, numbers, or proper nouns likely contain facts
      if (/\d{4}|\$[\d,]+|\d+%/.test(trimmed) && !seen.has(trimmed.toLowerCase())) {
        facts.push(trimmed);
        seen.add(trimmed.toLowerCase());
      }
    }
  }

  return facts.slice(0, 10); // Limit facts
}

/**
 * Generate a conversation summary using the AI model.
 */
export async function generateSummary(
  messages: ConversationMessage[],
): Promise<string> {
  // This would use the AI provider in production
  // For now, return a simple heuristic summary
  const userMessages = messages.filter((m) => m.role === "user");
  const assistantMessages = messages.filter((m) => m.role === "assistant");

  if (userMessages.length === 0) return "Empty conversation.";

  const topics = userMessages
    .map((m) => m.content.slice(0, 50))
    .join("; ");

  return `Conversation with ${userMessages.length} user messages and ${assistantMessages.length} assistant responses. Topics discussed: ${topics}`;
}

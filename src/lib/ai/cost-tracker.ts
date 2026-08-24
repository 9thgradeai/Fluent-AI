// AI usage cost tracking and limits.

import { prisma } from "../db/prisma";
import { getEnv } from "../config/env";
import { createLogger } from "../logging/logger";
import { CostLimitError } from "../errors";
import { cacheGet, cacheSet } from "../cache";

const log = createLogger({ component: "cost-tracker" });

export interface AIUsageRecord {
  userId: string;
  sessionId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  audioSeconds?: number;
  estimatedCostUsd: number;
  requestId?: string;
}

// Daily cost tracking key
function dailyCostKey(userId: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `ai:cost:${userId}:${date}`;
}

/**
 * Check if user has exceeded their daily AI cost limit.
 * Throws CostLimitError if exceeded.
 */
export async function checkCostLimit(userId: string): Promise<void> {
  const env = getEnv();
  const key = dailyCostKey(userId);

  const cached = await cacheGet<number>(key);
  const currentCost = cached.value ?? 0;

  if (currentCost >= env.AI_MAX_DAILY_COST_USD) {
    log.warn("Daily cost limit reached", { userId, currentCost, limit: env.AI_MAX_DAILY_COST_USD });
    throw new CostLimitError(
      `Daily AI usage limit of $${env.AI_MAX_DAILY_COST_USD} reached. Please try again tomorrow.`
    );
  }
}

/**
 * Record AI usage and update daily cost tracker.
 */
export async function recordAIUsage(record: AIUsageRecord): Promise<void> {
  // Persist to database
  try {
    await prisma.$executeRaw`
      INSERT INTO ai_usage (id, "userId", "sessionId", provider, model, "inputTokens", "outputTokens", "audioSeconds", "estimatedCostUsd", "requestId", "createdAt")
      VALUES (gen_random_uuid(), ${record.userId}, ${record.sessionId ?? null}, ${record.provider}, ${record.model}, ${record.inputTokens}, ${record.outputTokens}, ${record.audioSeconds ?? null}, ${record.estimatedCostUsd}, ${record.requestId ?? null}, NOW())
    `;
  } catch (err) {
    log.error("Failed to persist AI usage record", { error: String(err) });
    // Non-fatal: continue with in-memory tracking
  }

  // Update daily cost cache
  const key = dailyCostKey(record.userId);
  const cached = await cacheGet<number>(key);
  const currentCost = (cached.value ?? 0) + record.estimatedCostUsd;
  await cacheSet(key, currentCost, 86400); // 24 hour TTL

  log.info("AI usage recorded", {
    userId: record.userId,
    provider: record.provider,
    model: record.model,
    inputTokens: record.inputTokens,
    outputTokens: record.outputTokens,
    cost: record.estimatedCostUsd,
    dailyTotal: currentCost,
  });
}

/**
 * Get user's current daily cost.
 */
export async function getDailyCost(userId: string): Promise<number> {
  const key = dailyCostKey(userId);
  const cached = await cacheGet<number>(key);
  return cached.value ?? 0;
}

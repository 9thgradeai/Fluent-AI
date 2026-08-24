// Feature flag system for gradual rollout.
// Flags can be toggled at runtime without deployment.

import { cacheSet } from "../cache";
import { createLogger } from "../logging/logger";

const log = createLogger({ component: "feature-flags" });

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description: string;
  /** Percentage of users who see this flag (0-100). 100 = everyone. */
  rolloutPercentage: number;
  /** Specific user IDs that always see this flag */
  allowedUsers?: string[];
  /** Minimum user level required */
  minLevel?: number;
  /** Allowed English levels */
  allowedLevels?: string[];
  createdAt: string;
  updatedAt: string;
}

// Default flags
const DEFAULT_FLAGS: Record<string, FeatureFlag> = {
  "realtime-conversation": {
    key: "realtime-conversation",
    enabled: false,
    description: "Enable WebSocket-based realtime conversation",
    rolloutPercentage: 0,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  "speech-intelligence": {
    key: "speech-intelligence",
    enabled: false,
    description: "Enable ASR, pronunciation analysis, and fluency scoring",
    rolloutPercentage: 0,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  "scenario-engine": {
    key: "scenario-engine",
    enabled: true,
    description: "Enable scenario-based conversations",
    rolloutPercentage: 100,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  "evaluation-engine": {
    key: "evaluation-engine",
    enabled: true,
    description: "Enable post-conversation evaluation and scoring",
    rolloutPercentage: 100,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  "rag-context": {
    key: "rag-context",
    enabled: false,
    description: "Enable RAG-based context injection from user documents",
    rolloutPercentage: 0,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
  "new-evaluation-model": {
    key: "new-evaluation-model",
    enabled: false,
    description: "Use the new evaluation scoring model",
    rolloutPercentage: 0,
    createdAt: "2025-01-01",
    updatedAt: "2025-01-01",
  },
};

const CACHE_KEY = "feature-flags";
const CACHE_TTL = 300; // 5 minutes

// In-memory flag store (loaded from cache or defaults)
const flagStore: Record<string, FeatureFlag> = { ...DEFAULT_FLAGS };

/**
 * Check if a feature flag is enabled for a given user context.
 */
export async function isFeatureEnabled(
  flagKey: string,
  context?: {
    userId?: string;
    level?: number;
    englishLevel?: string;
  },
): Promise<boolean> {
  const flag = await getFlag(flagKey);
  if (!flag) return false;
  if (!flag.enabled) return false;

  // Check rollout percentage
  if (flag.rolloutPercentage < 100) {
    if (context?.userId) {
      // Deterministic: hash userId + flagKey to get 0-99
      const hash = await simpleHash(`${context.userId}:${flagKey}`);
      if (hash >= flag.rolloutPercentage) return false;
    } else {
      // No user context: check percentage randomly
      if (Math.random() * 100 >= flag.rolloutPercentage) return false;
    }
  }

  // Check allowed users
  if (flag.allowedUsers && context?.userId) {
    if (!flag.allowedUsers.includes(context.userId)) return false;
  }

  // Check min level
  if (flag.minLevel !== undefined && context?.level !== undefined) {
    if (context.level < flag.minLevel) return false;
  }

  // Check allowed English levels
  if (flag.allowedLevels && context?.englishLevel) {
    if (!flag.allowedLevels.includes(context.englishLevel)) return false;
  }

  return true;
}

/**
 * Get a feature flag definition.
 */
export async function getFlag(key: string): Promise<FeatureFlag | null> {
  return flagStore[key] ?? null;
}

/**
 * Get all feature flags.
 */
export async function getAllFlags(): Promise<FeatureFlag[]> {
  return Object.values(flagStore);
}

/**
 * Update a feature flag (admin operation).
 */
export async function setFlag(key: string, updates: Partial<Omit<FeatureFlag, "key" | "createdAt">>): Promise<FeatureFlag> {
  const existing = flagStore[key] ?? {
    key,
    enabled: false,
    description: "",
    rolloutPercentage: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const updated: FeatureFlag = {
    ...existing,
    ...updates,
    key,
    updatedAt: new Date().toISOString(),
  };

  flagStore[key] = updated;
  await cacheSet(CACHE_KEY, flagStore, CACHE_TTL);

  log.info("Feature flag updated", { key, enabled: updated.enabled, rolloutPercentage: updated.rolloutPercentage });
  return updated;
}

/**
 * Simple hash function for deterministic rollout.
 */
async function simpleHash(input: string): Promise<number> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  // Use first 4 bytes for a number 0-4294967295, then mod 100
  const value = (hashArray[0]! << 24) | (hashArray[1]! << 16) | (hashArray[2]! << 8) | hashArray[3]!;
  return Math.abs(value) % 100;
}

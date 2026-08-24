// Typed, validated environment configuration.
// Fails fast at startup if required variables are missing.

import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required."),
  SESSION_SECRET: z.string().min(32, "SESSION_SECRET must be at least 32 characters."),
  APP_URL: z.string().url().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().optional(),

  // AI providers
  AI_PROVIDER: z.enum(["openai", "anthropic", "openai-compatible", "mock"]).optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().optional(),

  // OpenAI-compatible providers (vLLM, Ollama, Together AI, Groq, etc.)
  AI_BASE_URL: z.string().url().optional(),
  AI_API_KEY: z.string().optional(),
  AI_MODEL: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),

  // Rate limiting defaults
  RATE_LIMIT_DEFAULT_LIMIT: z.coerce.number().int().positive().default(60),
  RATE_LIMIT_DEFAULT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  // AI cost controls
  AI_MAX_INPUT_TOKENS: z.coerce.number().int().positive().default(4096),
  AI_MAX_OUTPUT_TOKENS: z.coerce.number().int().positive().default(2048),
  AI_MAX_SESSION_DURATION_MS: z.coerce.number().int().positive().default(30 * 60 * 1000),
  AI_MAX_TURNS_PER_SESSION: z.coerce.number().int().positive().default(100),
  AI_MAX_DAILY_COST_USD: z.coerce.number().positive().default(10.0),

  // Audio limits
  MAX_AUDIO_DURATION_SEC: z.coerce.number().int().positive().default(300),
  MAX_CONCURRENT_SESSIONS_PER_USER: z.coerce.number().int().positive().default(3),
  MAX_CONCURRENT_SESSIONS_PER_IP: z.coerce.number().int().positive().default(5),

  // Logging
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let _cached: ServerEnv | null = null;

export function getEnv(): ServerEnv {
  if (_cached) return _cached;
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const missing = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`).join("\n");
    throw new Error(`Invalid environment configuration:\n${missing}`);
  }
  _cached = parsed.data;
  return _cached;
}

export function getResolvedProvider(): "openai" | "anthropic" | "openai-compatible" | "mock" {
  const env = getEnv();

  // Explicit provider selection
  if (env.AI_PROVIDER === "openai-compatible" && env.AI_BASE_URL) return "openai-compatible";
  if (env.AI_PROVIDER === "anthropic" && env.ANTHROPIC_API_KEY) return "anthropic";
  if (env.AI_PROVIDER === "openai" && env.OPENAI_API_KEY) return "openai";

  // Auto-detect from available keys (prefer openai-compatible if base URL set)
  if (env.AI_BASE_URL) return "openai-compatible";
  if (env.OPENAI_API_KEY) return "openai";
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  return "mock";
}

export function getModelForProvider(provider: "openai" | "anthropic" | "openai-compatible" | "mock"): string {
  const env = getEnv();
  switch (provider) {
    case "openai":
      return env.OPENAI_MODEL || "gpt-4o-mini";
    case "anthropic":
      return env.ANTHROPIC_MODEL || "claude-sonnet-5";
    case "openai-compatible":
      return env.AI_MODEL || "qwen/qwen-2.5-72b-instruct";
    default:
      return "fluentai-mock";
  }
}

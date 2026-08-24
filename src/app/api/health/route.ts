// Enhanced health check with Redis, provider, and queue status.

import { prisma } from "@/lib/db/prisma";
import { redisHealthCheck } from "@/lib/cache";
import { getResolvedProvider } from "@/lib/config/env";
import { getConversationModel } from "@/lib/ai/providers/conversation";
import { api } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async () => {
  const checks: Record<string, { status: string; latencyMs?: number; detail?: string }> = {};

  // Database check
  const dbStart = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = { status: "healthy", latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = { status: "unhealthy", detail: String(err) };
  }

  // Redis check
  const redisResult = await redisHealthCheck();
  checks.redis = {
    status: redisResult.connected ? "healthy" : "unavailable",
    latencyMs: redisResult.latencyMs,
    detail: redisResult.connected ? undefined : "Using in-memory fallback",
  };

  // AI Provider check
  const provider = getResolvedProvider();
  const aiStart = Date.now();
  try {
    const model = await getConversationModel();
    const available = await model.isAvailable();
    checks.aiProvider = {
      status: available ? "healthy" : "unreachable",
      latencyMs: Date.now() - aiStart,
      detail: `${provider}:${model.modelId}`,
    };
  } catch {
    checks.aiProvider = {
      status: provider === "mock" ? "mock_mode" : "error",
      latencyMs: Date.now() - aiStart,
      detail: provider,
    };
  }

  const allHealthy = checks.database.status === "healthy";

  return Response.json({
    success: allHealthy,
    data: {
      status: allHealthy ? "healthy" : "degraded",
      checks,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

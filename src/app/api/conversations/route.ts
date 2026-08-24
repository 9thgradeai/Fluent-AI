import { requireUser } from "@/lib/auth/guard";
import { createConversation, listConversations } from "@/lib/db/repos/conversations";
import { writeAudit } from "@/lib/db/repos/audit";
import { createConversationSchema } from "@/lib/validation/schemas";
import { prisma } from "@/lib/db/prisma";
import { api, clientIp, jsonOk, readJson } from "@/lib/http";
import { badRequest } from "@/lib/errors";
import { getScenario } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req, _ctx) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const cursor = url.searchParams.get("cursor") ?? undefined;
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit")) || 20));
  const { items, nextCursor } = await listConversations(user.id, cursor, limit);
  return jsonOk({ items, nextCursor });
});

export const POST = api(async (req, _ctx, requestId) => {
  const user = await requireUser();
  const parsed = createConversationSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  // Idempotency (doc §7.1): same key → same conversation.
  const idemKey = req.headers.get("idempotency-key");
  if (idemKey) {
    const existing = await prisma.idempotencyKey.findUnique({ where: { key: idemKey } });
    if (existing) {
      return jsonOk(existing.responseBody, existing.responseStatus);
    }
  }

  // Validate scenario if provided
  const scenarioId = parsed.data.scenarioId;
  if (scenarioId) {
    const scenario = getScenario(scenarioId);
    if (!scenario) {
      throw badRequest(`Scenario "${scenarioId}" not found.`);
    }
  }

  const conversation = await createConversation({
    userId: user.id,
    type: parsed.data.type,
    accent: parsed.data.accent,
    scenarioId: scenarioId ?? null,
    title: parsed.data.title,
  });

  await writeAudit({
    actorUserId: user.id,
    actorType: "user",
    action: "conversation.create",
    resourceType: "conversation",
    resourceId: conversation.id,
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent"),
    requestId,
  });

  const body = {
    id: conversation.id,
    type: conversation.type,
    accent: conversation.accent,
    status: conversation.status,
    title: conversation.title,
    startedAt: conversation.startedAt,
    scenarioId: scenarioId ?? null,
  };

  if (idemKey) {
    await prisma.idempotencyKey.create({
      data: {
        key: idemKey,
        userId: user.id,
        method: "POST",
        path: "/api/conversations",
        requestHash: await sha256(JSON.stringify(parsed.data)),
        responseStatus: 201,
        responseBody: body as object,
      },
    });
  }

  return jsonOk(body, 201);
});

async function sha256(input: string): Promise<string> {
  const { createHash } = await import("node:crypto");
  return createHash("sha256").update(input).digest("hex");
}

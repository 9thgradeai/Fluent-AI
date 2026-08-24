import { prisma } from "../prisma";
import type { Accent, ConversationType } from "@prisma/client";

const conversationInclude = {
  messages: { orderBy: { createdAt: "asc" as const }, take: 100 },
  user: { include: { profile: true } },
} as const;

export async function createConversation(opts: {
  userId: string;
  type: ConversationType;
  accent: Accent;
  scenarioId?: string | null;
  title?: string;
}) {
  return prisma.conversation.create({
    data: {
      userId: opts.userId,
      type: opts.type,
      accent: opts.accent,
      scenarioId: opts.scenarioId ?? null,
      title: opts.title ?? titleForType(opts.type),
      status: "active",
    },
  });
}

export async function listConversations(userId: string, cursor?: string, limit = 20) {
  const rows = await prisma.conversation.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { _count: { select: { messages: true } } },
  });
  const hasMore = rows.length > limit;
  const items = hasMore ? rows.slice(0, limit) : rows;
  return {
    items,
    nextCursor: hasMore ? items[items.length - 1].id : null,
  };
}

export async function getConversation(userId: string, id: string) {
  const conv = await prisma.conversation.findFirst({
    where: { id, userId },
    include: conversationInclude,
  });
  return conv;
}

export async function addMessage(opts: {
  conversationId: string;
  role: "user" | "assistant" | "system";
  content: string;
  accent?: Accent;
  meta?: unknown;
}) {
  return prisma.message.create({
    data: {
      conversationId: opts.conversationId,
      role: opts.role,
      content: opts.content,
      accent: opts.accent,
      meta: opts.meta as object | undefined,
    },
  });
}

export async function completeConversation(id: string, summary?: string) {
  const endedAt = new Date();
  const conv = await prisma.conversation.findUnique({ where: { id } });
  const durationSec = conv?.startedAt
    ? Math.max(1, Math.round((endedAt.getTime() - conv.startedAt.getTime()) / 1000))
    : null;
  return prisma.conversation.update({
    where: { id },
    data: {
      status: "completed",
      endedAt,
      durationSec,
      ...(summary !== undefined ? { summary } : {}),
    },
  });
}

function titleForType(type: ConversationType): string {
  const map: Record<ConversationType, string> = {
    free: "Free practice",
    roleplay: "Roleplay scenario",
    interview: "Interview practice",
    meeting: "Meeting rehearsal",
    ielts: "IELTS speaking",
    toefl: "TOEFL speaking",
    business: "Business conversation",
  };
  return map[type];
}

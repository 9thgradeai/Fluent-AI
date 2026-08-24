import { prisma } from "../prisma";

/** Append an immutable audit-log entry (doc §5.27, §14.2 A09). */
export async function writeAudit(opts: {
  actorUserId?: string | null;
  actorType: string;
  action: string;
  resourceType?: string | null;
  resourceId?: string | null;
  before?: unknown;
  after?: unknown;
  ip?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: opts.actorUserId ?? null,
      actorType: opts.actorType,
      action: opts.action,
      resourceType: opts.resourceType ?? null,
      resourceId: opts.resourceId ?? null,
      before: opts.before === undefined ? undefined : (opts.before as object),
      after: opts.after === undefined ? undefined : (opts.after as object),
      ip: opts.ip ?? null,
      userAgent: opts.userAgent ?? null,
      requestId: opts.requestId ?? null,
    },
  });
}

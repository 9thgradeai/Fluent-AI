import { getSession } from "@/lib/auth/guard";
import { revokeSession } from "@/lib/db/repos/sessions";
import { writeAudit } from "@/lib/db/repos/audit";
import { clearSessionCookie } from "@/lib/auth/cookies";
import { api, clientIp, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req, _ctx, requestId) => {
  const session = await getSession();
  if (session) {
    await revokeSession(session.id);
    await writeAudit({
      actorUserId: session.userId,
      actorType: "user",
      action: "auth.logout",
      resourceType: "user_session",
      resourceId: session.id,
      ip: clientIp(req),
      userAgent: req.headers.get("user-agent"),
      requestId,
    });
  }
  await clearSessionCookie();
  return jsonOk({ ok: true });
});

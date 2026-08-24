import { requireUser } from "@/lib/auth/guard";
import { getPublicProfile, patchProfile } from "@/lib/db/repos/users";
import { writeAudit } from "@/lib/db/repos/audit";
import { patchProfileSchema } from "@/lib/validation/schemas";
import { api, clientIp, jsonOk, readJson } from "@/lib/http";
import { badRequest } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, _ctx) => {
  const user = await requireUser();
  return jsonOk({ user: await getPublicProfile(user.id) });
});

export const PATCH = api(async (req, _ctx, requestId) => {
  const user = await requireUser();
  const parsed = patchProfileSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  await patchProfile(user.id, parsed.data);
  await writeAudit({
    actorUserId: user.id,
    actorType: "user",
    action: "profile.update",
    resourceType: "user_profile",
    resourceId: user.id,
    ip: clientIp(req),
    userAgent: req.headers.get("user-agent"),
    requestId,
  });
  return jsonOk({ user: await getPublicProfile(user.id) });
});

import { registerSchema } from "@/lib/validation/schemas";
import { hashPassword } from "@/lib/auth/password";
import { generateOpaqueToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/db/repos/sessions";
import { createUser, findUserByEmail, getPublicProfile } from "@/lib/db/repos/users";
import { writeAudit } from "@/lib/db/repos/audit";
import { setSessionCookie } from "@/lib/auth/cookies";
import { api, clientIp, jsonOk, rateLimit, readJson } from "@/lib/http";
import { conflict, badRequest } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req, _ctx, requestId) => {
  const ip = clientIp(req);
  const rl = await rateLimit(`register:${ip}`, { limit: 5, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { type: "https://api.fluentai.app/errors/rate_limited", title: "Rate limit exceeded", status: 429, detail: "Too many attempts. Try again shortly.", retry_after: rl.retryAfter, request_id: requestId },
      { status: 429 },
    );
  }

  const parsed = registerSchema.safeParse(await readJson(req));
  if (!parsed.success) {
    throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");
  }
  const { email, password, displayName, englishLevel } = parsed.data;

  if (await findUserByEmail(email)) {
    throw conflict("An account with that email already exists.");
  }

  const passwordHash = await hashPassword(password);
  const user = await createUser({ email, passwordHash, displayName, englishLevel });
  const rawToken = generateOpaqueToken();
  const session = await createSession({ userId: user.id, rawToken, ip, userAgent: req.headers.get("user-agent") });
  await setSessionCookie(rawToken);

  await writeAudit({
    actorUserId: user.id,
    actorType: "user",
    action: "auth.register",
    resourceType: "user",
    resourceId: user.id,
    ip,
    userAgent: req.headers.get("user-agent"),
    requestId,
  });

  return jsonOk(
    { user: await getPublicProfile(user.id), sessionId: session.id },
    201,
  );
});

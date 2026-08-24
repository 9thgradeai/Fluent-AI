import { loginSchema } from "@/lib/validation/schemas";
import { verifyPassword } from "@/lib/auth/password";
import { generateOpaqueToken } from "@/lib/auth/tokens";
import { createSession } from "@/lib/db/repos/sessions";
import { findUserByEmail, getPublicProfile } from "@/lib/db/repos/users";
import { writeAudit } from "@/lib/db/repos/audit";
import { setSessionCookie } from "@/lib/auth/cookies";
import { api, clientIp, jsonOk, rateLimit, readJson } from "@/lib/http";
import { unauthorized } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req, _ctx, requestId) => {
  const ip = clientIp(req);
  const rl = await rateLimit(`login:${ip}`, { limit: 10, windowMs: 60_000 });
  if (!rl.ok) {
    return Response.json(
      { type: "https://api.fluentai.app/errors/rate_limited", title: "Rate limit exceeded", status: 429, detail: "Too many attempts. Try again shortly.", retry_after: rl.retryAfter, request_id: requestId },
      { status: 429 },
    );
  }

  const parsed = loginSchema.safeParse(await readJson(req));
  if (!parsed.success) throw unauthorized("Invalid email or password.");

  const user = await findUserByEmail(parsed.data.email);
  // Same error whether the user or password is wrong (no user enumeration).
  if (!user || !user.passwordHash || !(await verifyPassword(user.passwordHash, parsed.data.password))) {
    throw unauthorized("Invalid email or password.");
  }
  if (user.status !== "active") {
    throw unauthorized("This account is not active.");
  }

  const rawToken = generateOpaqueToken();
  const session = await createSession({ userId: user.id, rawToken, ip, userAgent: req.headers.get("user-agent") });
  await setSessionCookie(rawToken);

  await writeAudit({
    actorUserId: user.id,
    actorType: "user",
    action: "auth.login",
    resourceType: "user",
    resourceId: user.id,
    ip,
    userAgent: req.headers.get("user-agent"),
    requestId,
  });

  return jsonOk({ user: await getPublicProfile(user.id), sessionId: session.id });
});

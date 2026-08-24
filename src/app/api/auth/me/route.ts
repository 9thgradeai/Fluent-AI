import { requireUser } from "@/lib/auth/guard";
import { getPublicProfile } from "@/lib/db/repos/users";
import { api, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, _ctx) => {
  const user = await requireUser();
  return jsonOk({ user: await getPublicProfile(user.id) });
});

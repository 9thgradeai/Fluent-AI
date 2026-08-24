import { requireUser } from "@/lib/auth/guard";
import { getDashboard } from "@/lib/db/repos/progress";
import { api, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, _ctx) => {
  const user = await requireUser();
  return jsonOk({ dashboard: await getDashboard(user.id) });
});

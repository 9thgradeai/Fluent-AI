import { requireUser } from "@/lib/auth/guard";
import { dueVocabulary } from "@/lib/db/repos/vocabulary";
import { api, jsonOk } from "@/lib/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, _ctx) => {
  const user = await requireUser();
  const items = await dueVocabulary(user.id);
  return jsonOk({ items });
});

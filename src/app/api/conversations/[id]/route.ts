import { requireUser } from "@/lib/auth/guard";
import { getConversation } from "@/lib/db/repos/conversations";
import { api, jsonOk } from "@/lib/http";
import { notFound } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (_req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!id) throw notFound();
  const conversation = await getConversation(user.id, id);
  if (!conversation) throw notFound();
  return jsonOk({ conversation });
});

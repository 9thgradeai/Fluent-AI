import { requireUser } from "@/lib/auth/guard";
import { patchVocabulary } from "@/lib/db/repos/vocabulary";
import { patchVocabularySchema } from "@/lib/validation/schemas";
import { api, jsonOk, readJson } from "@/lib/http";
import { badRequest, notFound } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const PATCH = api(async (req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!id) throw notFound();
  const parsed = patchVocabularySchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");
  const result = await patchVocabulary(user.id, id, parsed.data);
  if (result.count === 0) throw notFound();
  return jsonOk({ ok: true });
});

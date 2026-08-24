import { requireUser } from "@/lib/auth/guard";
import { createVocabulary, listVocabulary } from "@/lib/db/repos/vocabulary";
import { createVocabularySchema } from "@/lib/validation/schemas";
import { api, jsonOk, readJson } from "@/lib/http";
import { badRequest } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req, _ctx) => {
  const user = await requireUser();
  const status = new URL(req.url).searchParams.get("status") ?? undefined;
  const items = await listVocabulary(user.id, status as never);
  return jsonOk({ items });
});

export const POST = api(async (req, _ctx) => {
  const user = await requireUser();
  const parsed = createVocabularySchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");
  const item = await createVocabulary(user.id, parsed.data);
  return jsonOk({ item }, 201);
});

import { requireUser } from "@/lib/auth/guard";
import { reviewVocabulary } from "@/lib/db/repos/vocabulary";
import { awardXpLedger, upsertLearningProgress } from "@/lib/db/repos/progress";
import { reviewSchema } from "@/lib/validation/schemas";
import { api, jsonOk, readJson } from "@/lib/http";
import { badRequest, notFound } from "@/lib/errors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = api(async (req, ctx) => {
  const user = await requireUser();
  const { id } = await ctx.params;
  if (!id) throw notFound();
  const parsed = reviewSchema.safeParse(await readJson(req));
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? "Invalid input.");

  const item = await reviewVocabulary(user.id, id, parsed.data.quality);
  if (!item) throw notFound();

  if (parsed.data.quality >= 3) {
    const xp = await awardXpLedger(user.id, "daily_review", { refId: id });
    await upsertLearningProgress({
      userId: user.id,
      date: new Date(),
      skill: "vocabulary",
      xp,
    });
  }

  return jsonOk({
    item: {
      id: item.id,
      status: item.status,
      intervalDays: item.intervalDays,
      dueAt: item.dueAt,
      reviewCount: item.reviewCount,
    },
  });
});

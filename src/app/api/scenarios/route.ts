// Scenarios API route.
// Returns available conversation scenarios with filtering.

import { requireUser } from "@/lib/auth/guard";
import { api } from "@/lib/http";
import { SCENARIOS, listScenarios, type ScenarioCategory, type DifficultyLevel } from "@/lib/scenarios";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = api(async (req, _ctx) => {
  await requireUser();

  const url = new URL(req.url);
  const category = url.searchParams.get("category") as ScenarioCategory | null;
  const difficulty = url.searchParams.get("difficulty") as DifficultyLevel | null;
  const tags = url.searchParams.get("tags")?.split(",");

  const scenarios = listScenarios({
    category: category ?? undefined,
    difficulty: difficulty ?? undefined,
    tags: tags ?? undefined,
  });

  return Response.json({
    success: true,
    data: {
      scenarios,
      total: scenarios.length,
      categories: [...new Set(SCENARIOS.map((s) => s.category))],
      difficulties: ["beginner", "intermediate", "advanced", "expert"],
    },
  });
});

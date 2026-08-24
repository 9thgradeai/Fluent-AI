import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/auth/password";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://fluentai:fluentai@localhost:5432/fluentai?schema=public";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

type SeedAchievement = {
  code: string;
  title: string;
  description: string;
  criteria: Record<string, number>;
};

const ACHIEVEMENTS: SeedAchievement[] = [
  { code: "first_conversation", title: "First Conversation", description: "Complete your first conversation.", criteria: { conversations: 1 } },
  { code: "streak_3", title: "On a Roll", description: "Reach a 3-day streak.", criteria: { streak: 3 } },
  { code: "streak_7", title: "Weekly Warrior", description: "Reach a 7-day streak.", criteria: { streak: 7 } },
  { code: "vocab_25", title: "Word Collector", description: "Save 25 vocabulary items.", criteria: { vocab: 25 } },
  { code: "xp_1000", title: "Centurion", description: "Earn 1,000 total XP.", criteria: { xp: 1000 } },
];

async function main() {
  await prisma.achievement.createMany({ data: ACHIEVEMENTS, skipDuplicates: true });

  const email = process.env.SEED_EMAIL ?? "demo@fluentai.app";
  const password = process.env.SEED_PASSWORD ?? "password123";
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      emailVerifiedAt: new Date(),
      profile: { create: { displayName: "Demo Learner", englishLevel: "B2" } },
      streak: { create: { currentStreak: 1, bestStreak: 1, lastActiveDate: new Date() } },
    },
  });

  await prisma.vocabularyItem.createMany({
    data: [
      { userId: user.id, term: "fluent", definition: "able to speak easily and smoothly", level: "B1", wordClass: "adjective", addedFrom: "manual" },
      { userId: user.id, term: "articulate", definition: "able to express thoughts clearly", level: "B2", wordClass: "adjective", addedFrom: "manual" },
      { userId: user.id, term: "nuance", definition: "a subtle difference in meaning", level: "C1", wordClass: "noun", addedFrom: "manual" },
    ],
    skipDuplicates: true,
  });

  console.log(`Seeded. Demo user: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { fileURLToPath } from "node:url";
import path from "node:path";
import {
  createDatabaseContext,
  closeDatabaseConnections,
  type DatabaseContext,
} from "./client";
import { runMigrations } from "./migrate";
import {
  tenants,
  users,
  subjects,
  chapters,
  topics,
  questions,
} from "./schema/index";

/**
 * Seeds the database with:
 * 1. Default tenant 'DIRECT_B2C'
 * 2. SUPER_ADMIN user
 * 3. Physics and Chemistry taxonomy (Subjects, Chapters, Topics)
 * 4. 10 realistic Admission MCQ questions with LaTeX formulas and university tags
 */
export async function seed(ctx?: DatabaseContext): Promise<void> {
  const context = ctx || createDatabaseContext();
  const db = context.db;

  console.log("🌱 Starting database seeding...");
  await runMigrations(context);

  // 1. Seed Tenant: 'DIRECT_B2C'
  console.log("  → Seeding default tenant: DIRECT_B2C");
  await db
    .insert(tenants)
    .values({
      id: "DIRECT_B2C",
      name: "Direct B2C Admission Students",
      slug: "direct-b2c",
      status: "ACTIVE",
      settings: {
        allowSelfRegistration: true,
        defaultCurrency: "BDT",
        region: "BD",
      },
    })
    .onConflictDoUpdate({
      target: tenants.id,
      set: { name: "Direct B2C Admission Students", status: "ACTIVE" },
    });

  // 2. Seed SUPER_ADMIN Profile
  console.log("  → Seeding SUPER_ADMIN user");
  const adminId = "00000000-0000-0000-0000-000000000001";
  await db
    .insert(users)
    .values({
      id: adminId,
      tenantId: "DIRECT_B2C",
      role: "SUPER_ADMIN",
      email: "superadmin@admissionengine.com",
      fullName: "Admission Engine Lead Administrator",
      phone: "+8801700000000",
    })
    .onConflictDoUpdate({
      target: users.email,
      set: { role: "SUPER_ADMIN", fullName: "Admission Engine Lead Administrator" },
    });

  // 3. Seed Taxonomy: Physics, Chemistry, Higher Math & Biology
  console.log("  → Seeding 4 Admission Subjects Taxonomy (PHY, CHEM, MATH, BIO)");

  const subjectDefs = [
    { name: "Physics", code: "PHY", slug: "physics", iconUrl: "https://assets.platform.com/icons/physics.svg" },
    { name: "Chemistry", code: "CHEM", slug: "chemistry", iconUrl: "https://assets.platform.com/icons/chemistry.svg" },
    { name: "Higher Mathematics", code: "MATH", slug: "mathematics", iconUrl: "https://assets.platform.com/icons/math.svg" },
    { name: "Biology", code: "BIO", slug: "biology", iconUrl: "https://assets.platform.com/icons/biology.svg" },
  ];

  const subjectMap = new Map<string, number>();

  for (const s of subjectDefs) {
    const [sub] = await db
      .insert(subjects)
      .values(s)
      .onConflictDoUpdate({
        target: subjects.code,
        set: { name: s.name },
      })
      .returning();
    if (sub) subjectMap.set(s.code, sub.id);
  }

  // Import question templates
  const { getAllSeedQuestions } = await import("./seed-questions");
  const allSeedQuestions = getAllSeedQuestions();

  // Distinct chapters and topics mapping
  const chapterMap = new Map<string, number>(); // "subjectCode:chapterNumber" -> chapterId
  const topicMap = new Map<string, number>();   // "chapterId:topicName" -> topicId

  console.log(`  → Seeding chapters, topics and ${allSeedQuestions.length} admission questions...`);

  // Insert chapters & topics dynamically
  for (const q of allSeedQuestions) {
    const subjectId = subjectMap.get(q.subjectCode);
    if (!subjectId) continue;

    const chapterKey = `${q.subjectCode}:${q.chapterNumber}`;
    let chapterId = chapterMap.get(chapterKey);

    if (!chapterId) {
      const [ch] = await db
        .insert(chapters)
        .values({
          subjectId,
          name: q.chapterName,
          chapterNumber: q.chapterNumber,
          slug: `${q.subjectCode.toLowerCase()}-ch${q.chapterNumber}`,
        })
        .onConflictDoNothing()
        .returning();

      if (ch) {
        chapterId = ch.id;
        chapterMap.set(chapterKey, chapterId);
      } else {
        // Retrieve if already exists
        const { eq, and } = await import("drizzle-orm");
        const existing = await db
          .select()
          .from(chapters)
          .where(and(eq(chapters.subjectId, subjectId), eq(chapters.chapterNumber, q.chapterNumber)))
          .limit(1);
        if (existing[0]) {
          chapterId = existing[0].id;
          chapterMap.set(chapterKey, chapterId);
        }
      }
    }

    if (!chapterId) continue;

    const topicKey = `${chapterId}:${q.topicName}`;
    let topicId = topicMap.get(topicKey);

    if (!topicId) {
      const [tp] = await db
        .insert(topics)
        .values({
          chapterId,
          name: q.topicName,
          slug: q.topicName.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50),
        })
        .onConflictDoNothing()
        .returning();

      if (tp) {
        topicId = tp.id;
        topicMap.set(topicKey, topicId);
      } else {
        const { eq, and } = await import("drizzle-orm");
        const existingTopic = await db
          .select()
          .from(topics)
          .where(and(eq(topics.chapterId, chapterId), eq(topics.name, q.topicName)))
          .limit(1);
        if (existingTopic[0]) {
          topicId = existingTopic[0].id;
          topicMap.set(topicKey, topicId);
        }
      }
    }

    // Insert Question
    await db.insert(questions).values({
      tenantId: "DIRECT_B2C",
      subjectId,
      chapterId,
      topicId: topicId || null,
      questionText: q.questionText,
      questionType: "MCQ",
      options: q.options,
      correctOptionId: q.correctOptionId,
      explanation: q.explanation,
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: q.difficulty,
      universityTags: q.universityTags,
      isActive: true,
    });
  }

  console.log(`✓ Database seeding completed successfully (${allSeedQuestions.length} MCQ questions across 4 subjects seeded).`);
}

// If executed directly from CLI: tsx src/seed.ts
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  seed()
    .then(async () => {
      await closeDatabaseConnections();
      process.exit(0);
    })
    .catch(async (err: unknown) => {
      console.error("✗ Seeding failed:", err);
      await closeDatabaseConnections();
      process.exit(1);
    });
}

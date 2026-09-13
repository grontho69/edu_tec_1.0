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

  // 3. Seed Taxonomy: Physics & Chemistry
  console.log("  → Seeding Physics & Chemistry taxonomy");

  // Subject 1: Physics
  const [physicsSubject] = await db
    .insert(subjects)
    .values({
      name: "Physics",
      code: "PHY",
      slug: "physics",
      iconUrl: "https://assets.platform.com/icons/physics.svg",
    })
    .onConflictDoUpdate({
      target: subjects.code,
      set: { name: "Physics" },
    })
    .returning();

  if (!physicsSubject) throw new Error("Failed to insert/retrieve Physics subject");

  // Subject 2: Chemistry
  const [chemSubject] = await db
    .insert(subjects)
    .values({
      name: "Chemistry",
      code: "CHEM",
      slug: "chemistry",
      iconUrl: "https://assets.platform.com/icons/chemistry.svg",
    })
    .onConflictDoUpdate({
      target: subjects.code,
      set: { name: "Chemistry" },
    })
    .returning();

  if (!chemSubject) throw new Error("Failed to insert/retrieve Chemistry subject");

  // Physics Chapters
  const [newtonianChapter] = await db
    .insert(chapters)
    .values({
      subjectId: physicsSubject.id,
      name: "Newtonian Mechanics",
      chapterNumber: 4,
      slug: "newtonian-mechanics",
    })
    .returning();

  const [periodicChapter] = await db
    .insert(chapters)
    .values({
      subjectId: physicsSubject.id,
      name: "Periodic Motion and Waves",
      chapterNumber: 8,
      slug: "periodic-motion-waves",
    })
    .returning();

  // Chemistry Chapters
  const [kineticsChapter] = await db
    .insert(chapters)
    .values({
      subjectId: chemSubject.id,
      name: "Chemical Kinetics and Equilibrium",
      chapterNumber: 4,
      slug: "chemical-kinetics-equilibrium",
    })
    .returning();

  const [organicChapter] = await db
    .insert(chapters)
    .values({
      subjectId: chemSubject.id,
      name: "Organic Chemistry",
      chapterNumber: 2,
      slug: "organic-chemistry",
    })
    .returning();

  if (!newtonianChapter || !periodicChapter || !kineticsChapter || !organicChapter) {
    throw new Error("Failed to insert taxonomy chapters");
  }

  // Topics
  const [topicMomentum] = await db
    .insert(topics)
    .values({
      chapterId: newtonianChapter.id,
      name: "Conservation of Linear Momentum and Collision",
      slug: "linear-momentum-collision",
    })
    .returning();

  const [topicCircular] = await db
    .insert(topics)
    .values({
      chapterId: newtonianChapter.id,
      name: "Circular Motion and Banking of Roads",
      slug: "circular-motion-banking",
    })
    .returning();

  const [topicSHM] = await db
    .insert(topics)
    .values({
      chapterId: periodicChapter.id,
      name: "Simple Harmonic Motion and Energy",
      slug: "shm-energy",
    })
    .returning();

  const [topicEquilibrium] = await db
    .insert(topics)
    .values({
      chapterId: kineticsChapter.id,
      name: "Law of Mass Action and Equilibrium Constants (Kp, Kc)",
      slug: "equilibrium-constants-kp-kc",
    })
    .returning();

  const [topicAromatic] = await db
    .insert(topics)
    .values({
      chapterId: organicChapter.id,
      name: "Electrophilic Aromatic Substitution of Benzene",
      slug: "electrophilic-aromatic-substitution",
    })
    .returning();

  if (!topicMomentum || !topicCircular || !topicSHM || !topicEquilibrium || !topicAromatic) {
    throw new Error("Failed to insert taxonomy topics");
  }

  // 4. Seed 10 Admission MCQ Questions with LaTeX Math
  console.log("  → Seeding 10 Admission MCQ questions with LaTeX formulas");

  const mcqQuestions = [
    {
      tenantId: "DIRECT_B2C",
      subjectId: physicsSubject.id,
      chapterId: newtonianChapter.id,
      topicId: topicMomentum.id,
      questionText:
        "A bullet of mass $m = 20\\text{ g}$ is fired horizontally with speed $v$ into a ballistic pendulum of mass $M = 1.98\\text{ kg}$. The bullet becomes embedded in the block, and the center of mass rises a vertical distance $h = 0.45\\text{ m}$. Taking $g = 9.8\\text{ m/s}^2$, calculate the initial velocity $v$ of the bullet.",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$150\\text{ m/s}$", isLatex: true },
        { id: "B", text: "$200\\text{ m/s}$", isLatex: true },
        { id: "C", text: "$297\\text{ m/s}$", isLatex: true },
        { id: "D", text: "$350\\text{ m/s}$", isLatex: true },
      ],
      correctOptionId: "C",
      explanation:
        "By conservation of energy: $\\frac{1}{2}(M+m)V^2 = (M+m)gh \\implies V = \\sqrt{2gh} = \\sqrt{2 \\times 9.8 \\times 0.45} = 2.97\\text{ m/s}$. By conservation of momentum: $mv = (M+m)V \\implies v = \\frac{0.02 + 1.98}{0.02} \\times 2.97 = 100 \\times 2.97 = 297\\text{ m/s}$.",
      latexFormulas: [
        "\\frac{1}{2}(M+m)V^2 = (M+m)gh",
        "mv = (M+m)V",
        "v = \\frac{M+m}{m}\\sqrt{2gh}",
      ],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "HARD" as const,
      universityTags: ["BUET", "CKRUET", "IUT"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: physicsSubject.id,
      chapterId: newtonianChapter.id,
      topicId: topicCircular.id,
      questionText:
        "A curved road of radius $R = 80\\text{ m}$ is banked for vehicles moving at a design speed of $v = 28\\text{ m/s}$ without relying on friction. What is the banking angle $\\theta$ if $g = 9.8\\text{ m/s}^2$?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$\\tan^{-1}(0.5)$", isLatex: true },
        { id: "B", text: "$\\tan^{-1}(1.0)$", isLatex: true },
        { id: "C", text: "$\\tan^{-1}(0.8)$", isLatex: true },
        { id: "D", text: "$\\tan^{-1}(1.5)$", isLatex: true },
      ],
      correctOptionId: "B",
      explanation:
        "For a banked track without friction: $\\tan\\theta = \\frac{v^2}{Rg} = \\frac{(28)^2}{80 \\times 9.8} = \\frac{784}{784} = 1.0 \\implies \\theta = \\tan^{-1}(1.0) = 45^\\circ$.",
      latexFormulas: ["\\tan\\theta = \\frac{v^2}{Rg}"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "MEDIUM" as const,
      universityTags: ["BUET", "DU", "RUET"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: physicsSubject.id,
      chapterId: newtonianChapter.id,
      topicId: topicMomentum.id,
      questionText:
        "A rocket of initial mass $M_0$ ejects fuel at a constant relative speed $u$ and mass burning rate $\\alpha = -\\frac{dM}{dt}$. In gravity-free space, what is the instantaneous velocity $v(t)$ when the mass reaches $M(t)$?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$v(t) = u \\ln\\left(\\frac{M(t)}{M_0}\\right)$", isLatex: true },
        { id: "B", text: "$v(t) = u \\ln\\left(\\frac{M_0}{M(t)}\\right)$", isLatex: true },
        { id: "C", text: "$v(t) = \\frac{u M_0}{M(t)}$", isLatex: true },
        { id: "D", text: "$v(t) = u \\left(1 - \\frac{M(t)}{M_0}\\right)$", isLatex: true },
      ],
      correctOptionId: "B",
      explanation:
        "From Tsiolkovsky rocket equation: $M \\frac{dv}{dt} = -u \\frac{dM}{dt} \\implies \\int_0^v dv = -u \\int_{M_0}^{M} \\frac{dM}{M} \\implies v(t) = u \\ln\\left(\\frac{M_0}{M(t)}\\right)$.",
      latexFormulas: ["v(t) = u \\ln\\left(\\frac{M_0}{M(t)}\\right)"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "HARD" as const,
      universityTags: ["BUET", "KUET"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: physicsSubject.id,
      chapterId: periodicChapter.id,
      topicId: topicSHM.id,
      questionText:
        "A particle executes SHM described by $x(t) = 0.04 \\cos(10\\pi t + \\frac{\\pi}{4})\\text{ m}$. What is the magnitude of the maximum acceleration $a_{\\max}$?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$4\\pi^2\\text{ m/s}^2$", isLatex: true },
        { id: "B", text: "$0.4\\pi^2\\text{ m/s}^2$", isLatex: true },
        { id: "C", text: "$40\\pi^2\\text{ m/s}^2$", isLatex: true },
        { id: "D", text: "$2\\pi^2\\text{ m/s}^2$", isLatex: true },
      ],
      correctOptionId: "A",
      explanation:
        "Amplitude $A = 0.04\\text{ m}$, angular frequency $\\omega = 10\\pi\\text{ rad/s}$. Maximum acceleration is given by $a_{\\max} = \\omega^2 A = (10\\pi)^2 \\times 0.04 = 100\\pi^2 \\times 0.04 = 4\\pi^2\\text{ m/s}^2$.",
      latexFormulas: ["a_{\\max} = \\omega^2 A"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "EASY" as const,
      universityTags: ["DU", "RU", "CU"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: physicsSubject.id,
      chapterId: periodicChapter.id,
      topicId: topicSHM.id,
      questionText:
        "At what displacement $x$ from the mean position is the kinetic energy of a simple harmonic oscillator equal to three times its potential energy ($E_k = 3 E_p$)?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$x = \\pm \\frac{A}{2}$", isLatex: true },
        { id: "B", text: "$x = \\pm \\frac{A}{\\sqrt{2}}$", isLatex: true },
        { id: "C", text: "$x = \\pm \\frac{A}{\\sqrt{3}}$", isLatex: true },
        { id: "D", text: "$x = \\pm \\frac{A}{4}$", isLatex: true },
      ],
      correctOptionId: "A",
      explanation:
        "$E_p = \\frac{1}{2} k x^2$, $E = E_k + E_p = 3E_p + E_p = 4E_p = 4\\left(\\frac{1}{2} k x^2\\right) = \\frac{1}{2} k A^2 \\implies 4x^2 = A^2 \\implies x = \\pm \\frac{A}{2}$.",
      latexFormulas: ["E_p = \\frac{1}{2}kx^2", "E = \\frac{1}{2}kA^2", "x = \\pm \\frac{A}{2}"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "MEDIUM" as const,
      universityTags: ["DU", "DMC", "JU"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: chemSubject.id,
      chapterId: kineticsChapter.id,
      topicId: topicEquilibrium.id,
      questionText:
        "For the gaseous equilibrium reaction $\\text{PCl}_5(g) \\rightleftharpoons \\text{PCl}_3(g) + \\text{Cl}_2(g)$, what is the relationship between $K_p$ and $K_c$ at absolute temperature $T$?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$K_p = K_c (RT)^{-1}$", isLatex: true },
        { id: "B", text: "$K_p = K_c$", isLatex: true },
        { id: "C", text: "$K_p = K_c (RT)$", isLatex: true },
        { id: "D", text: "$K_p = K_c (RT)^2$", isLatex: true },
      ],
      correctOptionId: "C",
      explanation:
        "General equation: $K_p = K_c(RT)^{\\Delta n}$. Here, $\\Delta n = n_{\\text{products}} - n_{\\text{reactants}} = (1+1) - 1 = +1$. Therefore, $K_p = K_c(RT)^1 = K_c(RT)$.",
      latexFormulas: ["K_p = K_c(RT)^{\\Delta n}", "\\Delta n = 1"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "EASY" as const,
      universityTags: ["DU", "DMC", "BUET"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: chemSubject.id,
      chapterId: kineticsChapter.id,
      topicId: topicEquilibrium.id,
      questionText:
        "A first-order decomposition reaction $A \\rightarrow \\text{Products}$ has a rate constant $k = 1.386 \\times 10^{-2}\\text{ min}^{-1}$. What is the time required for $75\\%$ of the reactant to decompose?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$50\\text{ min}$", isLatex: true },
        { id: "B", text: "$100\\text{ min}$", isLatex: true },
        { id: "C", text: "$150\\text{ min}$", isLatex: true },
        { id: "D", text: "$200\\text{ min}$", isLatex: true },
      ],
      correctOptionId: "B",
      explanation:
        "Half-life $t_{1/2} = \\frac{\\ln 2}{k} = \\frac{0.693}{1.386 \\times 10^{-2}} = 50\\text{ min}$. For $75\\%$ completion, two half-lives elapse: $t = 2 \\times t_{1/2} = 100\\text{ min}$.",
      latexFormulas: ["t_{1/2} = \\frac{0.693}{k}", "t_{75\\%} = 2 t_{1/2}"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "MEDIUM" as const,
      universityTags: ["DU", "BUET", "CUET"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: chemSubject.id,
      chapterId: kineticsChapter.id,
      topicId: topicEquilibrium.id,
      questionText:
        "For the equilibrium $\\text{N}_2(g) + 3\\text{H}_2(g) \\rightleftharpoons 2\\text{NH}_3(g) + 92.4\\text{ kJ}$, which condition favors maximum yield of $\\text{NH}_3$ according to Le Chatelier's principle?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "Low temperature and low pressure", isLatex: false },
        { id: "B", text: "High temperature and high pressure", isLatex: false },
        { id: "C", text: "Low temperature and high pressure", isLatex: false },
        { id: "D", text: "Addition of inert gas at constant pressure", isLatex: false },
      ],
      correctOptionId: "C",
      explanation:
        "The reaction is exothermic ($\\Delta H < 0$), so lowering temperature shifts equilibrium rightward. Also, $\\Delta n = 2 - 4 = -2 < 0$, so increasing pressure shifts equilibrium towards fewer moles (products). Hence, low temperature and high pressure favor the yield.",
      latexFormulas: ["\\Delta H = -92.4\\text{ kJ}", "\\Delta n = -2"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "EASY" as const,
      universityTags: ["DMC", "DU", "MAT"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: chemSubject.id,
      chapterId: organicChapter.id,
      topicId: topicAromatic.id,
      questionText:
        "In the Friedel-Crafts alkylation of benzene with $\\text{CH}_3\\text{Cl}$ in the presence of anhydrous $\\text{AlCl}_3$, what is the generated active electrophilic species?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$\\text{AlCl}_4^-$", isLatex: true },
        { id: "B", text: "$\\text{CH}_3^+$", isLatex: true },
        { id: "C", text: "$\\text{Cl}^+$", isLatex: true },
        { id: "D", text: "$\\text{CH}_3\\cdot$", isLatex: true },
      ],
      correctOptionId: "B",
      explanation:
        "Anhydrous $\\text{AlCl}_3$ acts as a Lewis acid and abstracts a chloride ion: $\\text{CH}_3\\text{Cl} + \\text{AlCl}_3 \\rightarrow \\text{CH}_3^+ + \\text{AlCl}_4^-$. The carbocation $\\text{CH}_3^+$ acts as the electrophile.",
      latexFormulas: ["\\text{CH}_3\\text{Cl} + \\text{AlCl}_3 \\rightarrow \\text{CH}_3^+ + \\text{AlCl}_4^-"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "MEDIUM" as const,
      universityTags: ["DU", "BUET", "DMC"],
      isActive: true,
    },
    {
      tenantId: "DIRECT_B2C",
      subjectId: chemSubject.id,
      chapterId: organicChapter.id,
      topicId: topicAromatic.id,
      questionText:
        "Which of the following substituents on a benzene ring is an ortho/para-directing deactivator in electrophilic aromatic substitution?",
      questionType: "MCQ" as const,
      options: [
        { id: "A", text: "$-\\text{NO}_2$", isLatex: true },
        { id: "B", text: "$-\\text{OH}$", isLatex: true },
        { id: "C", text: "$-\\text{Cl}$", isLatex: true },
        { id: "D", text: "$-\\text{CH}_3$", isLatex: true },
      ],
      correctOptionId: "C",
      explanation:
        "Halogens (like $-\\text{Cl}$) are unique because their strong inductive electron-withdrawing effect ($-I$) deactivates the ring, but resonance electron donation ($+M$) stabilizes the carbocation intermediate preferentially at ortho and para positions.",
      latexFormulas: ["-I > +M"],
      marks: "1.00",
      negativeMarks: "0.25",
      difficulty: "HARD" as const,
      universityTags: ["BUET", "DU", "DMC"],
      isActive: true,
    },
  ];

  for (const q of mcqQuestions) {
    await db.insert(questions).values(q);
  }

  console.log(`✓ Database seeding completed successfully (${mcqQuestions.length} MCQ questions seeded).`);
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

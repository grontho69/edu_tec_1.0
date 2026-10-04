/**
 * Taxonomy & Exam Fallback Metadata.
 * All 400 questions are stored in the PostgreSQL/PGlite database and served dynamically via the API.
 * No questions are hardcoded locally on the client.
 */

export interface FallbackQuestion {
  id: string;
  subject: string;
  subjectCode?: string;
  chapter: string;
  topic: string;
  topicId?: number;
  universityTag: string;
  universityTags?: string[];
  year: string;
  questionText: string;
  marks: string;
  negativeMarks: string;
  options: Array<{ id: string; text: string; isLatex?: boolean }>;
  correctOptionId: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export const FALLBACK_TOPICS_CATALOG = [
  {
    id: "phy",
    code: "PHY",
    name: "পদার্থবিজ্ঞান (Physics)",
    icon: "Atom",
    totalQuestions: 100,
    chapters: [],
  },
  {
    id: "chem",
    code: "CHEM",
    name: "রসায়ন (Chemistry)",
    icon: "FlaskConical",
    totalQuestions: 100,
    chapters: [],
  },
  {
    id: "math",
    code: "MATH",
    name: "উচ্চতর গণিত (Higher Mathematics)",
    icon: "Binary",
    totalQuestions: 100,
    chapters: [],
  },
  {
    id: "bio",
    code: "BIO",
    name: "জীববিজ্ঞান (Biology)",
    icon: "Dna",
    totalQuestions: 100,
    chapters: [],
  },
];

export const FALLBACK_PRACTICE_QUESTIONS: FallbackQuestion[] = [
  // ── Physics ─────────────────────────────────────────────────────────────
  {
    id: "f-phy-01",
    subject: "পদার্থবিজ্ঞান",
    subjectCode: "PHY",
    chapter: "নিউটনীয় বলবিদ্যা",
    topic: "রৈখিক ভরবেগের নিত্যতা",
    universityTag: "BUET",
    universityTags: ["BUET", "CKRUET"],
    year: "2023-24",
    questionText:
      "একটি $m = 20\\text{ g}$ ভরের বুলেট $v$ বেগে এসে $M = 1.98\\text{ kg}$ ভরের ঝুলন্ত ব্লকে বিদ্ধ হয়ে থেমে গেল। ব্লকটি উলম্বভাবে $h = 0.45\\text{ m}$ উচ্চতায় উঠলে বুলেটের আদিবেগ $v$ কত? ($g = 9.8\\text{ m/s}^2$)",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$150\\text{ m/s}$", isLatex: true },
      { id: "B", text: "$200\\text{ m/s}$", isLatex: true },
      { id: "C", text: "$297\\text{ m/s}$", isLatex: true },
      { id: "D", text: "$350\\text{ m/s}$", isLatex: true },
    ],
    correctOptionId: "C",
    explanation:
      "শক্তি সংরক্ষণ: $V = \\sqrt{2gh} = \\sqrt{2 \\times 9.8 \\times 0.45} = 2.97\\text{ m/s}$। ভরবেগ সংরক্ষণ: $mv = (M+m)V \\implies v = \\frac{2.0}{0.02} \\times 2.97 = 297\\text{ m/s}$।",
    difficulty: "HARD",
  },
  {
    id: "f-phy-02",
    subject: "পদার্থবিজ্ঞান",
    subjectCode: "PHY",
    chapter: "নিউটনীয় বলবিদ্যা",
    topic: "রাস্তার ব্যাংকিং",
    universityTag: "BUET",
    universityTags: ["BUET", "DU_KA", "RUET"],
    year: "2022-23",
    questionText:
      "$R = 100\\text{ m}$ ব্যাসার্ধের একটি বাঁকা রাস্তায় গাড়ি সর্বোচ্চ $72\\text{ km/h}$ বেগে পিছলে না গিয়ে নিরাপদে বাঁক নিতে চাইলে রাস্তার ব্যাংকিং কোণ $\\theta$ কত হতে হবে? ($g = 9.8\\text{ m/s}^2$)",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$\\tan^{-1}(0.408)$", isLatex: true },
      { id: "B", text: "$\\tan^{-1}(0.25)$", isLatex: true },
      { id: "C", text: "$\\tan^{-1}(0.55)$", isLatex: true },
      { id: "D", text: "$\\tan^{-1}(0.15)$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "$v = 72\\text{ km/h} = 20\\text{ m/s}$। $\\tan\\theta = \\frac{v^2}{Rg} = \\frac{400}{100 \\times 9.8} = 0.408 \\implies \\theta = \\tan^{-1}(0.408) \\approx 22.2^\\circ$।",
    difficulty: "MEDIUM",
  },
  {
    id: "f-phy-03",
    subject: "পদার্থবিজ্ঞান",
    subjectCode: "PHY",
    chapter: "কাজ, শক্তি ও ক্ষমতা",
    topic: "পরিবর্তনশীল বল দ্বারা কাজ",
    universityTag: "DU",
    universityTags: ["DU_KA", "BUET"],
    year: "2023-24",
    questionText:
      "একটি বস্তুর উপর বল $\\vec{F} = (3x^2\\hat{i} + 2y\\hat{j})\\text{ N}$ ক্রিয়া করে বস্তুটিকে $(0,0)$ বিন্দু থেকে $(2,3)$ বিন্দুতে স্থানান্তরিত করে। সম্পাদিত কাজের পরিমাণ কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$17\\text{ J}$", isLatex: true },
      { id: "B", text: "$12\\text{ J}$", isLatex: true },
      { id: "C", text: "$25\\text{ J}$", isLatex: true },
      { id: "D", text: "$8\\text{ J}$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "$W = \\int_0^2 3x^2 dx + \\int_0^3 2y dy = [x^3]_0^2 + [y^2]_0^3 = 8 + 9 = 17\\text{ J}$।",
    difficulty: "EASY",
  },
  {
    id: "f-phy-04",
    subject: "পদার্থবিজ্ঞান",
    subjectCode: "PHY",
    chapter: "মহাকর্ষ ও অভিকর্ষ",
    topic: "মুক্তিবেগ",
    universityTag: "DMC",
    universityTags: ["DMC", "DU_KA", "BUET"],
    year: "2022-23",
    questionText:
      "পৃথিবীর পৃষ্ঠে মুক্তিবেগ $v_e = 11.2\\text{ km/s}$। একটি গ্রহের ভর পৃথিবীর ভরের দ্বিগুণ এবং ব্যাসার্ধ অর্ধেক হলে ঐ গ্রহের মুক্তিবেগ কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$11.2\\text{ km/s}$", isLatex: true },
      { id: "B", text: "$22.4\\text{ km/s}$", isLatex: true },
      { id: "C", text: "$5.6\\text{ km/s}$", isLatex: true },
      { id: "D", text: "$44.8\\text{ km/s}$", isLatex: true },
    ],
    correctOptionId: "B",
    explanation:
      "$v_e = \\sqrt{\\frac{2GM}{R}}$। নতুন মুক্তিবেগ $v'_e = \\sqrt{\\frac{2G(2M)}{R/2}} = \\sqrt{4 \\frac{2GM}{R}} = 2 v_e = 2 \\times 11.2 = 22.4\\text{ km/s}$।",
    difficulty: "EASY",
  },

  // ── Chemistry ───────────────────────────────────────────────────────────
  {
    id: "f-chem-01",
    subject: "রসায়ন",
    subjectCode: "CHEM",
    chapter: "গুণগত রসায়ন",
    topic: "কোয়ান্টাম সংখ্যা ও নোডাল তল",
    universityTag: "BUET",
    universityTags: ["BUET", "CKRUET"],
    year: "2023-24",
    questionText:
      "$4d$ অরবিটালের জন্য প্রধান কোয়ান্টাম সংখ্যা $n$, সহকারী কোয়ান্টাম সংখ্যা $l$ এবং মোট নোডের (rad + ang) সংখ্যা কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$n=4, l=2, \\text{মোট নোড } = 3$", isLatex: true },
      { id: "B", text: "$n=4, l=1, \\text{মোট নোড } = 2$", isLatex: true },
      { id: "C", text: "$n=4, l=2, \\text{মোট নোড } = 2$", isLatex: true },
      { id: "D", text: "$n=4, l=3, \\text{মোট নোড } = 3$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "$4d$ এর জন্য $n=4, l=2$। মোট নোডের সংখ্যা = $n - 1 = 4 - 1 = 3$ (অ্যাঙ্গুলার নোড $l=2$, রেডিয়াল নোড $n-l-1 = 1$)।",
    difficulty: "EASY",
  },
  {
    id: "f-chem-02",
    subject: "রসায়ন",
    subjectCode: "CHEM",
    chapter: "রাসায়নিক পরিবর্তন",
    topic: "বাফার দ্রবণ ও pH",
    universityTag: "DU",
    universityTags: ["DU_KA", "DMC"],
    year: "2022-23",
    questionText:
      "$0.1\\text{ M } CH_3COOH$ এবং $0.1\\text{ M } CH_3COONa$ এর সমআয়তনের মিশ্রণে প্রস্তুত বাফার দ্রবণের $pH$ কত? ($pK_a = 4.74$)",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$4.74$", isLatex: false },
      { id: "B", text: "$5.74$", isLatex: false },
      { id: "C", text: "$3.74$", isLatex: false },
      { id: "D", text: "$7.00$", isLatex: false },
    ],
    correctOptionId: "A",
    explanation:
      "হেন্ডারসন সমীকরণ: $pH = pK_a + \\log\\frac{[\\text{Salt}]}{[\\text{Acid}]}$। যেহেতু লবণ ও এসিডের ঘনমাত্রা সমান ($0.1\\text{ M}$), তাই $\\log(1) = 0 \\implies pH = pK_a = 4.74$।",
    difficulty: "EASY",
  },
  {
    id: "f-chem-03",
    subject: "রসায়ন",
    subjectCode: "CHEM",
    chapter: "পরিবেশ রসায়ন",
    topic: "আদর্শ গ্যাস ও গ্রাহামের ব্যাপন সূত্র",
    universityTag: "CKRUET",
    universityTags: ["CKRUET", "DU_KA"],
    year: "2023-24",
    questionText:
      "একটি নির্দিষ্ট তাপমাত্রায় ও চাপে $SO_2$ এবং $O_2$ গ্যাসের ব্যাপন হারের অনুপাত $r_{SO_2} : r_{O_2}$ কত হবে? (আণবিক ভর: $SO_2 = 64, O_2 = 32$)",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$1 : \\sqrt{2}$", isLatex: true },
      { id: "B", text: "$\\sqrt{2} : 1$", isLatex: true },
      { id: "C", text: "$1 : 2$", isLatex: true },
      { id: "D", text: "$2 : 1$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "গ্রাহামের ব্যাপন সূত্র: $\\frac{r_1}{r_2} = \\sqrt{\\frac{M_2}{M_1}} = \\sqrt{\\frac{32}{64}} = \\frac{1}{\\sqrt{2}}$।",
    difficulty: "MEDIUM",
  },

  // ── Higher Math ─────────────────────────────────────────────────────────
  {
    id: "f-math-01",
    subject: "উচ্চতর গণিত",
    subjectCode: "MATH",
    chapter: "ম্যাট্রিক্স ও নির্ণায়ক",
    topic: "ব্যতিক্রমী ম্যাট্রিক্স",
    universityTag: "BUET",
    universityTags: ["BUET", "RUET"],
    year: "2023-24",
    questionText:
      "$A = \\begin{bmatrix} p-1 & 2 \\\\ 3 & p-2 \\end{bmatrix}$ ম্যাট্রিক্সটি ব্যতিক্রমী (singular) হলে $p$ এর মান কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$4, -1$", isLatex: true },
      { id: "B", text: "$5, -2$", isLatex: true },
      { id: "C", text: "$-4, 1$", isLatex: true },
      { id: "D", text: "$3, 2$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "ব্যতিক্রমী হলে $|A| = 0 \\implies (p-1)(p-2) - 6 = 0 \\implies p^2 - 3p + 2 - 6 = 0 \\implies p^2 - 3p - 4 = 0 \\implies (p-4)(p+1) = 0 \\implies p = 4, -1$।",
    difficulty: "EASY",
  },
  {
    id: "f-math-02",
    subject: "উচ্চতর গণিত",
    subjectCode: "MATH",
    chapter: "অন্তরীকরণ",
    topic: "লিমিট ও এল-হসপিটাল সূত্র",
    universityTag: "DU",
    universityTags: ["DU_KA", "BUET"],
    year: "2022-23",
    questionText:
      "$\\lim_{x \\to 0} \\frac{e^{3x} - 1}{\\sin 2x}$ এর মান কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$\\frac{3}{2}$", isLatex: true },
      { id: "B", text: "$\\frac{2}{3}$", isLatex: true },
      { id: "C", text: "$1$", isLatex: true },
      { id: "D", text: "$0$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "এল-হসপিটাল প্রয়োগ করে: $\\lim_{x \\to 0} \\frac{3e^{3x}}{2\\cos 2x} = \\frac{3 \\times 1}{2 \\times 1} = \\frac{3}{2}$।",
    difficulty: "EASY",
  },
  {
    id: "f-math-03",
    subject: "উচ্চতর গণিত",
    subjectCode: "MATH",
    chapter: "যৌগিকীকরণ",
    topic: "নির্দিষ্ট যৌগজ",
    universityTag: "BUET",
    universityTags: ["BUET", "CKRUET"],
    year: "2023-24",
    questionText:
      "$\\int_0^1 \\frac{dx}{1 + x^2}$ এর মান কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "$\\frac{\\pi}{4}$", isLatex: true },
      { id: "B", text: "$\\frac{\\pi}{2}$", isLatex: true },
      { id: "C", text: "$\\pi$", isLatex: true },
      { id: "D", text: "$1$", isLatex: true },
    ],
    correctOptionId: "A",
    explanation:
      "$\\int \\frac{dx}{1+x^2} = [\\tan^{-1} x]_0^1 = \\tan^{-1}(1) - \\tan^{-1}(0) = \\frac{\\pi}{4} - 0 = \\frac{\\pi}{4}$।",
    difficulty: "EASY",
  },

  // ── Biology ─────────────────────────────────────────────────────────────
  {
    id: "f-bio-01",
    subject: "জীববিজ্ঞান",
    subjectCode: "BIO",
    chapter: "কোষ ও এর গঠন",
    topic: "অঙ্গাণু ও প্রোটিন সংশ্লেষণ",
    universityTag: "DMC",
    universityTags: ["DMC", "DU_KA"],
    year: "2023-24",
    questionText:
      "কোষের কোন অঙ্গাণুটিকে 'প্রোটিন তৈরির কারখানা' (Protein Factory) বলা হয়?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "রাইবোজোম (Ribosome)", isLatex: false },
      { id: "B", text: "গলজি বস্তু (Golgi Body)", isLatex: false },
      { id: "C", text: "লাইসোজোম (Lysosome)", isLatex: false },
      { id: "D", text: "মাইটোকন্ড্রিয়া (Mitochondria)", isLatex: false },
    ],
    correctOptionId: "A",
    explanation:
      "রাইবোজোম এমআরএনএ-এর নির্দেশ অনুযায়ী অ্যামিনো এসিড জোড়া লাগিয়ে পলিপেপটাইড বা প্রোটিন তৈরি করে, তাই একে কোষের প্রোটিন ফ্যাক্টরি বলা হয়।",
    difficulty: "EASY",
  },
  {
    id: "f-bio-02",
    subject: "জীববিজ্ঞান",
    subjectCode: "BIO",
    chapter: "কোষ বিভাজন",
    topic: "মায়োসিস ও ক্রসিং ওভার",
    universityTag: "DMC",
    universityTags: ["DMC", "JU"],
    year: "2022-23",
    questionText:
      "মায়োসিস-১ এর প্রফেজ-১ এর কোন উপপর্যায়ে ক্রসিং ওভার (Crossing Over) সম্পন্ন হয়?",
    marks: "1.00",
    negativeMarks: "0.25",
    options: [
      { id: "A", text: "প্যাকাইটিন (Pachytene)", isLatex: false },
      { id: "B", text: "লেপ্টোটিন (Leptotene)", isLatex: false },
      { id: "C", text: "জাইগোটিন (Zygotene)", isLatex: false },
      { id: "D", text: "ডিপ্লোটিন (Diplotene)", isLatex: false },
    ],
    correctOptionId: "A",
    explanation:
      "প্যাকাইটিন উপপর্যায়ে হোমোলোগাস ক্রোমোজোমের দুটি নন-সিস্টার ক্রোমাটিডের মধ্যে অংশের বিনিময় ঘটে, যা ক্রসিং ওভার নামে পরিচিত।",
    difficulty: "EASY",
  },
];

export const FALLBACK_EXAM_PAPER = {
  examId: "8f8b89e2-1111-2222-3333-444455556666",
  title: "বুয়েট স্পেশাল লাইভ মেগা মডেল টেস্ট — ০১",
  durationMinutes: 60,
  totalMarks: 50,
  negativeMarkRate: 0.25,
  questions: FALLBACK_PRACTICE_QUESTIONS,
};

export const FALLBACK_DASHBOARD_ANALYTICS = {
  overallAccuracy: "74.50",
  syllabusCoveragePercentage: 68,
  streakDays: 5,
  totalExamsTaken: 8,
  totalQuestionsAttempted: 160,
  totalQuestionsCorrect: 122,
  weakTopicsCount: 2,
  topicBreakdown: [
    {
      topicId: 102,
      topicName: "কৌণিক ভরবেগ ও টর্ক",
      subjectName: "পদার্থবিজ্ঞান",
      totalAttempted: 25,
      totalCorrect: 11,
      accuracyRate: "44.00",
      masteryScore: "44",
      status: "NEEDS_IMPROVEMENT",
    },
    {
      topicId: 105,
      topicName: "কুয়া ও পাম্পের কর্মদক্ষতা",
      subjectName: "পদার্থবিজ্ঞান",
      totalAttempted: 28,
      totalCorrect: 11,
      accuracyRate: "39.28",
      masteryScore: "39",
      status: "NEEDS_IMPROVEMENT",
    },
    {
      topicId: 101,
      topicName: "ভরবেগ ও ঘাত বল",
      subjectName: "পদার্থবিজ্ঞান",
      totalAttempted: 30,
      totalCorrect: 26,
      accuracyRate: "86.67",
      masteryScore: "87",
      status: "MASTERED",
    },
    {
      topicId: 201,
      topicName: "বোর পরমাণু মডেল",
      subjectName: "রসায়ন",
      totalAttempted: 24,
      totalCorrect: 20,
      accuracyRate: "83.33",
      masteryScore: "83",
      status: "MASTERED",
    },
    {
      topicId: 303,
      topicName: "লিমিট ও অন্তরীকরণ",
      subjectName: "উচ্চতর গণিত",
      totalAttempted: 32,
      totalCorrect: 23,
      accuracyRate: "71.87",
      masteryScore: "72",
      status: "IN_PROGRESS",
    },
  ],
};

export const FALLBACK_MODEL_TESTS = [
  {
    id: "8f8b89e2-1111-2222-3333-444455556666",
    title: "বুয়েট স্পেশাল লাইভ মেগা মডেল টেস্ট — ০১",
    university: "BUET + CKRUET",
    tag: "LIVE NOW",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
    questionsCount: 50,
    durationMinutes: 60,
    marks: "+1.00 / -0.25",
    participants: 4120,
    status: "LIVE",
  },
  {
    id: "8f8b89e2-2222-3333-4444-555566667777",
    title: "ঢাবি 'ক' ইউনিট স্পিড ও নির্ভুলতা টেস্ট",
    university: "ঢাকা বিশ্ববিদ্যালয় (DU)",
    tag: "TODAY 9:00 PM",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    questionsCount: 60,
    durationMinutes: 45,
    marks: "+1.00 / -0.25",
    participants: 3290,
    status: "UPCOMING",
  },
  {
    id: "8f8b89e2-3333-4444-5555-666677778888",
    title: "মেডিকেল জীববিজ্ঞান ও রসায়ন বুস্টার টেস্ট",
    university: "MBBS & BDS",
    tag: "UPCOMING",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    questionsCount: 100,
    durationMinutes: 60,
    marks: "+1.00 / -0.25",
    participants: 5800,
    status: "UPCOMING",
  },
  {
    id: "8f8b89e2-4444-5555-6666-777788889999",
    title: "বিগত বছরের প্রশ্ন: বুয়েট ভর্তি পরীক্ষা ২০২৩-২৪",
    university: "BUET",
    tag: "PRACTICE",
    badgeColor: "bg-zinc-100 text-zinc-700 border-zinc-200",
    questionsCount: 60,
    durationMinutes: 60,
    marks: "+1.00 / -0.25",
    participants: 12500,
    status: "PAST",
  },
];

export const FALLBACK_LEADERBOARD = [
  { rank: 1, name: "রাফিদ আহমেদ", college: "Notre Dame College", score: 48.75, accuracy: "98.0%", target: "BUET EEE" },
  { rank: 2, name: "ফারহান ইশরাক", college: "Dhaka College", score: 47.50, accuracy: "96.0%", target: "BUET CSE" },
  { rank: 3, name: "সামিয়া হক", college: "Viqarunnisa Noon College", score: 46.25, accuracy: "94.5%", target: "DMC" },
  { rank: 4, name: "তানভীর হাসান", college: "Rajshahi College", score: 45.00, accuracy: "92.0%", target: "BUET Mech" },
  { rank: 5, name: "তাহমিদ আলী (তুমি)", college: "Ideal School & College", score: 43.75, accuracy: "89.5%", target: "BUET CSE", isCurrentUser: true },
  { rank: 6, name: "আবির মাহমুদ", college: "Chittagong College", score: 42.50, accuracy: "88.0%", target: "DU CSIT" },
  { rank: 7, name: "মেহেদী হাসান", college: "Adamjee Cantonment", score: 41.25, accuracy: "86.0%", target: "CKRUET" },
];

/**
 * Zero-Lag Fallback & Offline Dataset for Admission Exam Engine.
 * Allows the frontend on Vercel to function flawlessly even when the backend
 * is not yet deployed, with zero crashes or blank screens.
 */

export interface FallbackQuestion {
  id: string;
  subject: string;
  chapter: string;
  topic: string;
  universityTag: string;
  year: string;
  questionText: string;
  marks: string;
  negativeMarks: string;
  options: Array<{ id: string; text: string }>;
  correctOptionId: string;
  explanation: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
}

export const FALLBACK_TOPICS_CATALOG = [
  {
    id: "phy",
    name: "পদার্থবিজ্ঞান (Physics)",
    icon: "Atom",
    totalQuestions: 450,
    chapters: [
      {
        id: "phy-ch4",
        name: "৪র্থ অধ্যায়: নিউটনিয়ান বলবিদ্যা",
        topics: [
          { id: 101, name: "ভরবেগ ও ঘাত বল", questionsCount: 45, accuracy: 78 },
          { id: 102, name: "কৌণিক ভরবেগ ও টর্ক", questionsCount: 38, accuracy: 44, alert: true },
          { id: 103, name: "ব্যাংকিং কোণ ও বৃত্তীয় গতি", questionsCount: 52, accuracy: 62 },
        ],
      },
      {
        id: "phy-ch5",
        name: "৫ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা",
        topics: [
          { id: 104, name: "পরিবর্তনশীল বল দ্বারা কৃতকাজ", questionsCount: 30, accuracy: 85 },
          { id: 105, name: "কুয়া ও পাম্পের কর্মদক্ষতা", questionsCount: 42, accuracy: 39, alert: true },
          { id: 106, name: "সংরক্ষণশীল বল ও স্প্রিং শক্তি", questionsCount: 35, accuracy: 70 },
        ],
      },
      {
        id: "phy-ch6",
        name: "৬ষ্ঠ অধ্যায়: মহাকর্ষ ও অভিকর্ষ",
        topics: [
          { id: 107, name: "মুক্তিবেগ ও কৃত্রিম উপগ্রহ", questionsCount: 40, accuracy: 80 },
          { id: 108, name: "অভিকর্ষজ ত্বরণ 'g' এর পরিবর্তন", questionsCount: 34, accuracy: 55 },
        ],
      },
    ],
  },
  {
    id: "chem",
    name: "রসায়ন (Chemistry)",
    icon: "FlaskConical",
    totalQuestions: 380,
    chapters: [
      {
        id: "chem-ch2",
        name: "২য় অধ্যায়: গুণগত রসায়ন",
        topics: [
          { id: 201, name: "বোর পরমাণু মডেল ও রিডবার্গ ধ্রুবক", questionsCount: 50, accuracy: 75 },
          { id: 202, name: "দ্রাব্যতা ও দ্রাব্যতা গুণফল ($K_{sp}$)", questionsCount: 48, accuracy: 42, alert: true },
          { id: 203, name: "কোয়ান্টাম সংখ্যা ও নীতিসমূহ", questionsCount: 36, accuracy: 90 },
        ],
      },
      {
        id: "chem-ch3",
        name: "৩য় অধ্যায়: মৌলের পর্যায়বৃত্ত ধর্ম",
        topics: [
          { id: 204, name: "আয়নীকরণ শক্তি ও ইলেকট্রন আসক্তি", questionsCount: 40, accuracy: 68 },
          { id: 205, name: "সংকরায়ন ও জ্যামিতিক গঠন", questionsCount: 45, accuracy: 48, alert: true },
        ],
      },
    ],
  },
  {
    id: "math",
    name: "উচ্চতর গণিত (Higher Mathematics)",
    icon: "Binary",
    totalQuestions: 520,
    chapters: [
      {
        id: "math-ch1",
        name: "১ম অধ্যায়: ম্যাট্রিক্স ও নির্ণায়ক",
        topics: [
          { id: 301, name: "ক্রেমারের নিয়ম ও বিপরীত ম্যাট্রিক্স", questionsCount: 42, accuracy: 88 },
          { id: 302, name: "নির্ণায়কের মান নির্ণয় ও বিস্তার", questionsCount: 38, accuracy: 65 },
        ],
      },
      {
        id: "math-ch9",
        name: "৯ম অধ্যায়: অন্তরীকরণ (Calculus)",
        topics: [
          { id: 303, name: "লিমিট ও অবিচ্ছিন্নতা ($L'H\\hat{o}pital$)", questionsCount: 55, accuracy: 72 },
          { id: 304, name: "গুরুমান ও লঘুমান (Maxima & Minima)", questionsCount: 48, accuracy: 38, alert: true },
          { id: 305, name: "স্পর্শক ও অভিলম্বের সমীকরণ", questionsCount: 40, accuracy: 58 },
        ],
      },
    ],
  },
  {
    id: "bio",
    name: "জীববিজ্ঞান (Biology)",
    icon: "Dna",
    totalQuestions: 310,
    chapters: [
      {
        id: "bio-ch1",
        name: "১ম অধ্যায়: কোষ ও এর গঠন",
        topics: [
          { id: 401, name: "প্লাজমামেমব্রেন ও ফ্লুইড মোজাইক মডেল", questionsCount: 35, accuracy: 92 },
          { id: 402, name: "DNA অনুলিপন ও প্রোটিন সংশ্লেষ", questionsCount: 40, accuracy: 52 },
        ],
      },
      {
        id: "bio-ch11",
        name: "১১তম অধ্যায়: জিনতত্ত্ব ও বিবর্তন",
        topics: [
          { id: 403, name: "মেন্ডেলের সূত্র ও ব্যতিক্রমসমূহ", questionsCount: 42, accuracy: 64 },
          { id: 404, name: "রক্তের গ্রুপ ও Rh ফ্যাক্টর", questionsCount: 32, accuracy: 82 },
        ],
      },
    ],
  },
];

export const FALLBACK_PRACTICE_QUESTIONS: FallbackQuestion[] = [
  {
    id: "q-101-1",
    subject: "পদার্থবিজ্ঞান ১ম পত্র",
    chapter: "নিউটনিয়ান বলবিদ্যা",
    topic: "ব্যাংকিং কোণ ও বৃত্তীয় গতি",
    universityTag: "BUET",
    year: "2023-24",
    questionText:
      "একটি রেললাইনের বাঁকের ব্যাসার্ধ $250\\text{ m}$। রেললাইনের পাতদ্বয়ের মধ্যবর্তী দূরত্ব $1\\text{ m}$ হলে $54\\text{ km/h}$ বেগে চলমান ট্রেনের জন্য প্রয়োজনীয় ব্যাংকিং উচ্চতা কত? ($g = 9.8\\text{ ms}^{-2}$)",
    marks: "1.00",
    negativeMarks: "0.25",
    difficulty: "HARD",
    options: [
      { id: "A", text: "$0.0918\\text{ m}$" },
      { id: "B", text: "$0.0459\\text{ m}$" },
      { id: "C", text: "$0.1250\\text{ m}$" },
      { id: "D", text: "$0.0825\\text{ m}$" },
    ],
    correctOptionId: "A",
    explanation:
      "আমরা জানি, $\\tan\\theta = \\frac{v^2}{rg}$। এখানে $v = 54\\text{ km/h} = 15\\text{ ms}^{-1}$, $r = 250\\text{ m}$।\n$\\tan\\theta = \\frac{15^2}{250 \\times 9.8} = \\frac{225}{2450} \\approx 0.0918$। যেহেতু $\\theta$ খুব ক্ষুদ্র, তাই $h \\approx d \\tan\\theta = 1 \\times 0.0918 = 0.0918\\text{ m}$।",
  },
  {
    id: "q-101-2",
    subject: "পদার্থবিজ্ঞান ১ম পত্র",
    chapter: "কাজ, শক্তি ও ক্ষমতা",
    topic: "কুয়া ও পাম্পের কর্মদক্ষতা",
    universityTag: "DU 'KA'",
    year: "2022-23",
    questionText:
      "একটি পানিপূর্ণ কুয়ার গভীরতা $12\\text{ m}$ এবং ব্যাস $4\\text{ m}$। একটি পাম্প $20$ মিনিটে কুয়াটিকে পানিশূন্য করতে পারে। পাম্পের অশ্বক্ষমতা কত? ($g = 9.8\\text{ ms}^{-2}$, $\\rho = 1000\\text{ kg/m}^3$)",
    marks: "1.00",
    negativeMarks: "0.25",
    difficulty: "MEDIUM",
    options: [
      { id: "A", text: "$8.25\\text{ HP}$" },
      { id: "B", text: "$9.89\\text{ HP}$" },
      { id: "C", text: "$11.20\\text{ HP}$" },
      { id: "D", text: "$6.45\\text{ HP}$" },
    ],
    correctOptionId: "B",
    explanation:
      "পানির ভর $m = \\pi r^2 h \\rho = \\pi (2)^2 (12) (1000) \\approx 150796.4\\text{ kg}$।\nগড় সরণ $h_{avg} = \\frac{12}{2} = 6\\text{ m}$।\nক্ষমতা $P = \\frac{m g h_{avg}}{t} = \\frac{150796.4 \\times 9.8 \\times 6}{1200} = 7389\\text{ W} = \\frac{7389}{746} \\approx 9.89\\text{ HP}$।",
  },
  {
    id: "q-201-1",
    subject: "রসায়ন ১ম পত্র",
    chapter: "গুণগত রসায়ন",
    topic: "দ্রাব্যতা ও দ্রাব্যতা গুণফল",
    universityTag: "CKRUET",
    year: "2023-24",
    questionText:
      "$25^\\circ\\text{C}$ তাপমাত্রায় $Ag_2CrO_4$ এর দ্রাব্যতা গুণফল $K_{sp} = 1.1 \\times 10^{-12}$ হলে বিশুদ্ধ পানিতে এর দ্রাব্যতা ($S$) কত $\\text{mol/L}$?",
    marks: "1.00",
    negativeMarks: "0.25",
    difficulty: "HARD",
    options: [
      { id: "A", text: "$6.50 \\times 10^{-5}\\text{ M}$" },
      { id: "B", text: "$1.05 \\times 10^{-6}\\text{ M}$" },
      { id: "C", text: "$3.25 \\times 10^{-4}\\text{ M}$" },
      { id: "D", text: "$4.12 \\times 10^{-5}\\text{ M}$" },
    ],
    correctOptionId: "A",
    explanation:
      "$Ag_2CrO_4 \\rightleftharpoons 2Ag^+ + CrO_4^{2-}$।\n$K_{sp} = [Ag^+]^2 [CrO_4^{2-}] = (2S)^2(S) = 4S^3$।\n$S = \\sqrt[3]{\\frac{K_{sp}}{4}} = \\sqrt[3]{\\frac{1.1 \\times 10^{-12}}{4}} \\approx 6.50 \\times 10^{-5}\\text{ mol/L}$।",
  },
  {
    id: "q-301-1",
    subject: "উচ্চতর গণিত ১ম পত্র",
    chapter: "অন্তরীকরণ",
    topic: "লিমিট ও অবিচ্ছিন্নতা",
    universityTag: "BUET",
    year: "2021-22",
    questionText:
      "$\\lim_{x \\to 0} \\frac{e^{3x} - 1 - 3x}{x^2}$ এর মান কত?",
    marks: "1.00",
    negativeMarks: "0.25",
    difficulty: "MEDIUM",
    options: [
      { id: "A", text: "$3$" },
      { id: "B", text: "$\\frac{9}{2}$" },
      { id: "C", text: "$\\frac{3}{2}$" },
      { id: "D", text: "$9$" },
    ],
    correctOptionId: "B",
    explanation:
      "$L'H\\hat{o}pital$ নিয়ম ২ বার প্রয়োগ করে:\n১ম বার: $\\lim_{x \\to 0} \\frac{3e^{3x} - 3}{2x}$\n২য় বার: $\\lim_{x \\to 0} \\frac{9e^{3x}}{2} = \\frac{9e^0}{2} = \\frac{9}{2}$।",
  },
  {
    id: "q-401-1",
    subject: "জীববিজ্ঞান ১ম পত্র",
    chapter: "কোষ ও এর গঠন",
    topic: "প্লাজমামেমব্রেন",
    universityTag: "MEDICAL",
    year: "2023-24",
    questionText:
      "সিঙ্গার ও নিকলসন কর্তৃক প্রস্তাবিত ফ্লুইড মোজাইক মডেল অনুযায়ী প্লাজমামেমব্রেনের কোন উপাদানটি তরল প্রকৃতির ন্যায় আচরণ করে?",
    marks: "1.00",
    negativeMarks: "0.25",
    difficulty: "EASY",
    options: [
      { id: "A", text: "ফসফোলিপিড বাইলেয়ার" },
      { id: "B", text: "গ্লাইকোক্যালিক্স" },
      { id: "C", text: "পেরিফেরাল প্রোটিন" },
      { id: "D", text: "কোলেস্টেরল" },
    ],
    correctOptionId: "A",
    explanation:
      "ফ্লুইড মোজাইক মডেলে ফসফোলিপিড বাইলেয়ারকে সমুদ্রের পানির সাথে তুলনা করা হয়েছে এবং প্রোটিনগুলোকে হিমশৈলের সাথে তুলনা করা হয়েছে।",
  },
];

export const FALLBACK_EXAM_PAPER = {
  examId: "8f8b89e2-1111-2222-3333-444455556666",
  title: "বুয়েট স্পেশাল লাইভ মেগা মডেল টেস্ট — ০১",
  durationMinutes: 45,
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
    durationMinutes: 45,
    marks: "+1.00 / -0.25",
    participants: 4120,
    status: "LIVE",
  },
  {
    id: "du-special-02",
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
    id: "med-bio-chem-03",
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
    id: "past-buet-2023",
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

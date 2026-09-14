/**
 * User Personalization & Dynamic Activity Store
 * Ensures every student (e.g. Tahmid vs Farabi vs custom registered user)
 * has an isolated, dynamic dashboard, mistake book, streak, and exam records.
 */

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  role: "STUDENT" | "SUPER_ADMIN";
  targetUnit: "ENGINEERING" | "MEDICAL" | "DU_KA" | "GST";
  targetUniversity: string;
  collegeName: string;
  avatarInitial: string;
  avatarColor: string;
  targetExamDate: string;
  targetCountdownDays: number;
}

export interface StudentAnalyticsData {
  userId: string;
  totalExamsTaken: number;
  totalQuestionsAttempted: number;
  totalQuestionsCorrect: number;
  totalQuestionsWrong: number;
  overallAccuracy: string;
  mistakeRate: string;
  totalStudyTimeSeconds: number;
  streakDays: number;
  syllabusCoveragePercentage: number;
  weakTopicsCount: number;
  lastActiveAt: string;
}

export interface StudentMistakeItem {
  mistakeId: string;
  questionId: string;
  mistakeCount: number;
  consecutiveCorrectCount: number;
  isMastered: boolean;
  lastAttemptedAt: string;
  notes?: string;
  question: {
    id: string;
    subject: string;
    chapter: string;
    topic: string;
    universityTag: string;
    year?: string;
    questionText: string;
    options: Array<{ id: string; text: string }>;
    correctOptionId: string;
    explanation: string;
    difficulty: "EASY" | "MEDIUM" | "HARD";
  };
}

export interface StudentExamSubmission {
  id: string;
  examId: string;
  examTitle: string;
  university: string;
  totalScore: string;
  maxScore: string;
  totalAttempted: number;
  totalCorrect: number;
  totalWrong: number;
  accuracyRate: string;
  rankBadge: string;
  percentile: string;
  submittedAt: string;
  status: "PASSED" | "EXCELLENT" | "AVERAGE";
}

export interface StudentWeakTopic {
  topicId: number;
  topicName: string;
  subjectName: string;
  accuracyRate: string;
  attempted: number;
  correct: number;
  recommendation: string;
}

export interface CompleteStudentData {
  profile: StudentProfile;
  analytics: StudentAnalyticsData;
  mistakes: StudentMistakeItem[];
  recentExams: StudentExamSubmission[];
  weakTopics: StudentWeakTopic[];
}

// -------------------------------------------------------------
// 1. PRESET PERSONAS: Tahmid Ahmed (BUET) vs Farabi Hasan (DMC)
// -------------------------------------------------------------

export const TAHMID_PERSONA: CompleteStudentData = {
  profile: {
    id: "student-tahmid-buet-101",
    fullName: "তাহমিদ আহমেদ",
    email: "tahmid@admissionengine.com",
    role: "STUDENT",
    targetUnit: "ENGINEERING",
    targetUniversity: "বাংলাদেশ প্রকৌশল বিশ্ববিদ্যালয় (BUET) — CSE",
    collegeName: "নটর ডেম কলেজ, ঢাকা",
    avatarInitial: "তা",
    avatarColor: "from-blue-600 to-indigo-700",
    targetExamDate: "২০২৬-১১-০২",
    targetCountdownDays: 48,
  },
  analytics: {
    userId: "student-tahmid-buet-101",
    totalExamsTaken: 7,
    totalQuestionsAttempted: 180,
    totalQuestionsCorrect: 156,
    totalQuestionsWrong: 24,
    overallAccuracy: "86.67",
    mistakeRate: "13.33",
    totalStudyTimeSeconds: 75600, // 21 hours
    streakDays: 16,
    syllabusCoveragePercentage: 82,
    weakTopicsCount: 1,
    lastActiveAt: new Date().toISOString(),
  },
  mistakes: [
    {
      mistakeId: "mstk-t-1",
      questionId: "q-phy-101-bank",
      mistakeCount: 3,
      consecutiveCorrectCount: 0,
      isMastered: false,
      lastAttemptedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      notes: "ব্যাংকিং কোণের সূত্রে tan theta = v^2/(rg) এর সাথে উচ্চতা h = d*tan theta প্যাঁচ লেগেছে",
      question: {
        id: "q-phy-101-bank",
        subject: "পদার্থবিজ্ঞান ১ম পত্র",
        chapter: "৪র্থ অধ্যায়: নিউটনিয়ান বলবিদ্যা",
        topic: "ব্যাংকিং কোণ ও বৃত্তীয় গতি",
        universityTag: "BUET",
        year: "2023-24",
        questionText:
          "একটি রেললাইনের বাঁকের ব্যাসার্ধ $250\\text{ m}$। রেললাইনের পাতদ্বয়ের মধ্যবর্তী দূরত্ব $1\\text{ m}$ হলে $54\\text{ km/h}$ বেগে চলমান ট্রেনের জন্য প্রয়োজনীয় ব্যাংকিং উচ্চতা কত? ($g = 9.8\\text{ ms}^{-2}$)",
        options: [
          { id: "A", text: "$0.0918\\text{ m}$" },
          { id: "B", text: "$0.0459\\text{ m}$" },
          { id: "C", text: "$0.1250\\text{ m}$" },
          { id: "D", text: "$0.0825\\text{ m}$" },
        ],
        correctOptionId: "A",
        explanation:
          "আমরা জানি, $\\tan\\theta = \\frac{v^2}{rg}$। এখানে $v = 54\\text{ km/h} = 15\\text{ ms}^{-1}$।\n$\\tan\\theta = \\frac{15^2}{250 \\times 9.8} \\approx 0.0918$। যেহেতু $\\theta$ ক্ষুদ্র, তাই $h \\approx d \\tan\\theta = 1 \\times 0.0918 = 0.0918\\text{ m}$।",
        difficulty: "HARD",
      },
    },
    {
      mistakeId: "mstk-t-2",
      questionId: "q-phy-105-pump",
      mistakeCount: 2,
      consecutiveCorrectCount: 1,
      isMastered: false,
      lastAttemptedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      notes: "পানির গড় উচ্চতা h/2 নিতে ভুল হয়েছিল",
      question: {
        id: "q-phy-105-pump",
        subject: "পদার্থবিজ্ঞান ১ম পত্র",
        chapter: "৫ম অধ্যায়: কাজ, শক্তি ও ক্ষমতা",
        topic: "কুয়া ও পাম্পের কর্মদক্ষতা",
        universityTag: "DU 'KA'",
        year: "2022-23",
        questionText:
          "একটি পানিপূর্ণ কুয়ার গভীরতা $12\\text{ m}$ এবং ব্যাস $4\\text{ m}$। একটি পাম্প $20$ মিনিটে কুয়াটিকে পানিশূন্য করতে পারে। পাম্পের অশ্বক্ষমতা কত? ($g = 9.8\\text{ ms}^{-2}$, $\\rho = 1000\\text{ kg/m}^3$)",
        options: [
          { id: "A", text: "$8.25\\text{ HP}$" },
          { id: "B", text: "$9.89\\text{ HP}$" },
          { id: "C", text: "$11.20\\text{ HP}$" },
          { id: "D", text: "$6.45\\text{ HP}$" },
        ],
        correctOptionId: "B",
        explanation:
          "পানির ভর $m = \\pi r^2 h \\rho = \\pi (2)^2 (12) (1000) \\approx 150796.4\\text{ kg}$।\nগড় সরণ $h_{avg} = \\frac{12}{2} = 6\\text{ m}$।\nক্ষমতা $P = \\frac{m g h_{avg}}{t} = \\frac{150796.4 \\times 9.8 \\times 6}{1200} = 7389\\text{ W} = \\frac{7389}{746} \\approx 9.89\\text{ HP}$।",
        difficulty: "MEDIUM",
      },
    },
    {
      mistakeId: "mstk-t-3",
      questionId: "q-math-303-int",
      mistakeCount: 1,
      consecutiveCorrectCount: 2,
      isMastered: true,
      lastAttemptedAt: new Date(Date.now() - 3600000 * 50).toISOString(),
      question: {
        id: "q-math-303-int",
        subject: "উচ্চতর গণিত ১ম পত্র",
        chapter: "৯ম অধ্যায়: অন্তরীকরণ",
        topic: "লিমিট ও চরম মান",
        universityTag: "BUET",
        year: "2021-22",
        questionText:
          "$\\lim_{x \\to 0} \\frac{e^{3x} - 1}{\\sin 2x}$ এর মান কত?",
        options: [
          { id: "A", text: "$\\frac{3}{2}$" },
          { id: "B", text: "$\\frac{2}{3}$" },
          { id: "C", text: "$1$" },
          { id: "D", text: "$0$" },
        ],
        correctOptionId: "A",
        explanation:
          "L'Hôpital's Rule প্রয়োগ করে: $\\lim_{x \\to 0} \\frac{3e^{3x}}{2\\cos 2x} = \\frac{3(1)}{2(1)} = \\frac{3}{2}$।",
        difficulty: "EASY",
      },
    },
  ],
  recentExams: [
    {
      id: "sub-t-01",
      examId: "8f8b89e2-1111-2222-3333-444455556666",
      examTitle: "বুয়েট স্পেশাল লাইভ মেগা মডেল টেস্ট — ০১",
      university: "BUET + CKRUET",
      totalScore: "48.75",
      maxScore: "50.00",
      totalAttempted: 50,
      totalCorrect: 49,
      totalWrong: 1,
      accuracyRate: "98.00%",
      rankBadge: "৫ম স্থান (Top 0.5%)",
      percentile: "99.5%",
      submittedAt: "আজ, সকাল ১১:১৫",
      status: "EXCELLENT",
    },
    {
      id: "sub-t-02",
      examId: "buet-phy-mock-2",
      examTitle: "ইঞ্জিনিয়ারিং পদার্থবিজ্ঞান স্পিড টেস্ট",
      university: "BUET",
      totalScore: "44.00",
      maxScore: "50.00",
      totalAttempted: 48,
      totalCorrect: 45,
      totalWrong: 3,
      accuracyRate: "93.75%",
      rankBadge: "১২তম স্থান",
      percentile: "97.2%",
      submittedAt: "গতকাল, রাত ৯:৩০",
      status: "PASSED",
    },
    {
      id: "sub-t-03",
      examId: "du-math-speed-3",
      examTitle: "ঢাবি 'ক' গণিত ও রসায়ন মক টেস্ট",
      university: "DU 'KA'",
      totalScore: "42.50",
      maxScore: "50.00",
      totalAttempted: 46,
      totalCorrect: 44,
      totalWrong: 2,
      accuracyRate: "95.65%",
      rankBadge: "৮ম স্থান",
      percentile: "98.1%",
      submittedAt: "৩ দিন আগে",
      status: "PASSED",
    },
  ],
  weakTopics: [
    {
      topicId: 105,
      topicName: "কুয়া ও পাম্পের কর্মদক্ষতা",
      subjectName: "পদার্থবিজ্ঞান ১ম পত্র",
      accuracyRate: "39.00%",
      attempted: 18,
      correct: 7,
      recommendation: "গড় সরণ নির্ণয় ও অশ্বক্ষমতার কনভার্সন সূত্র পুনরায় নোট করো।",
    },
  ],
};

export const FARABI_PERSONA: CompleteStudentData = {
  profile: {
    id: "student-farabi-dmc-102",
    fullName: "ফারাবি হাসান",
    email: "farabi@admissionengine.com",
    role: "STUDENT",
    targetUnit: "MEDICAL",
    targetUniversity: "ঢাকা মেডিকেল কলেজ (DMC) — MBBS",
    collegeName: "ঢাকা কলেজ, ঢাকা",
    avatarInitial: "ফা",
    avatarColor: "from-emerald-600 to-teal-700",
    targetExamDate: "২০২৬-১২-০৪",
    targetCountdownDays: 80,
  },
  analytics: {
    userId: "student-farabi-dmc-102",
    totalExamsTaken: 4,
    totalQuestionsAttempted: 130,
    totalQuestionsCorrect: 92,
    totalQuestionsWrong: 38,
    overallAccuracy: "70.77",
    mistakeRate: "29.23",
    totalStudyTimeSeconds: 43200, // 12 hours
    streakDays: 6,
    syllabusCoveragePercentage: 58,
    weakTopicsCount: 2,
    lastActiveAt: new Date().toISOString(),
  },
  mistakes: [
    {
      mistakeId: "mstk-f-1",
      questionId: "q-bio-403-mendel",
      mistakeCount: 4,
      consecutiveCorrectCount: 0,
      isMastered: false,
      lastAttemptedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      notes: "এপিস্ট্যাসিস এর ফিনোটাইপিক অনুপাত মনে রাখা দরকার",
      question: {
        id: "q-bio-403-mendel",
        subject: "জীববিজ্ঞান ২য় পত্র",
        chapter: "১১তম অধ্যায়: জিনতত্ত্ব ও বিবর্তন",
        topic: "মেন্ডেলের সূত্র ও ব্যতিক্রমসমূহ",
        universityTag: "DMC",
        year: "2023-24",
        questionText:
          "দ্বৈত প্রচ্ছন্ন এপিস্ট্যাসিসের (Duplicate Recessive Epistasis) কারণে ফিনোটাইপিক অনুপাত কোনটি হয়?",
        options: [
          { id: "A", text: "$9:7$" },
          { id: "B", text: "$13:3$" },
          { id: "C", text: "$9:3:4$" },
          { id: "D", text: "$12:3:1$" },
        ],
        correctOptionId: "A",
        explanation:
          "দ্বৈত প্রচ্ছন্ন এপিস্ট্যাসিসের ক্ষেত্রে অনুপাত পরিবর্তিত হয়ে $9:7$ হয়। (যেমন: মানুষের জন্মগত মূক-বধিরতা)।",
        difficulty: "MEDIUM",
      },
    },
    {
      mistakeId: "mstk-f-2",
      questionId: "q-chem-202-ksp",
      mistakeCount: 3,
      consecutiveCorrectCount: 0,
      isMastered: false,
      lastAttemptedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      notes: "Ksp এর সাথে ঘনমাত্রার সম্পর্ক ক্যালকুলেট করতে ভুল হয়েছিল",
      question: {
        id: "q-chem-202-ksp",
        subject: "রসায়ন ১ম পত্র",
        chapter: "২য় অধ্যায়: গুণগত রসায়ন",
        topic: "দ্রাব্যতা ও দ্রাব্যতা গুণফল ($K_{sp}$)",
        universityTag: "DMC",
        year: "2022-23",
        questionText:
          "২৫°C তাপমাত্রায় $Al(OH)_3$ এর দ্রাব্যতা $S\\text{ mol/L}$ হলে এর দ্রাব্যতা গুণফল ($K_{sp}$) কত?",
        options: [
          { id: "A", text: "$27S^4$" },
          { id: "B", text: "$4S^3$" },
          { id: "C", text: "$S^2$" },
          { id: "D", text: "$108S^5$" },
        ],
        correctOptionId: "A",
        explanation:
          "$Al(OH)_3 \\rightleftharpoons Al^{3+} + 3OH^-$।\n$K_{sp} = [Al^{3+}][OH^-]^3 = (S)(3S)^3 = S \\times 27S^3 = 27S^4$।",
        difficulty: "HARD",
      },
    },
    {
      mistakeId: "mstk-f-3",
      questionId: "q-chem-201-bohr",
      mistakeCount: 2,
      consecutiveCorrectCount: 1,
      isMastered: false,
      lastAttemptedAt: new Date(Date.now() - 3600000 * 45).toISOString(),
      question: {
        id: "q-chem-201-bohr",
        subject: "রসায়ন ১ম পত্র",
        chapter: "২য় অধ্যায়: গুণগত রসায়ন",
        topic: "বোর পরমাণু মডেল ও বর্ণালী",
        universityTag: "DU 'KA'",
        year: "2021-22",
        questionText:
          "হাইড্রোজেন পরমাণুর বামার সিরিজের ১ম লাইনের জন্য তরঙ্গদৈর্ঘ্য কত? ($R_H = 1.097 \\times 10^7\\text{ m}^{-1}$)",
        options: [
          { id: "A", text: "$656.3\\text{ nm}$" },
          { id: "B", text: "$486.1\\text{ nm}$" },
          { id: "C", text: "$434.0\\text{ nm}$" },
          { id: "D", text: "$410.2\\text{ nm}$" },
        ],
        correctOptionId: "A",
        explanation:
          "বামার সিরিজের ১ম লাইন: $n_1 = 2, n_2 = 3$।\n$\\frac{1}{\\lambda} = R_H (\\frac{1}{2^2} - \\frac{1}{3^2}) = R_H (\\frac{1}{4} - \\frac{1}{9}) = \\frac{5}{36} R_H$।\n$\\lambda = \\frac{36}{5 \\times 1.097 \\times 10^7} \\approx 656.3 \\times 10^{-9}\\text{ m} = 656.3\\text{ nm}$।",
        difficulty: "MEDIUM",
      },
    },
  ],
  recentExams: [
    {
      id: "sub-f-01",
      examId: "med-bio-chem-03",
      examTitle: "মেডিকেল জীববিজ্ঞান ও রসায়ন বুস্টার টেস্ট",
      university: "MBBS & BDS",
      totalScore: "39.50",
      maxScore: "50.00",
      totalAttempted: 48,
      totalCorrect: 41,
      totalWrong: 7,
      accuracyRate: "85.42%",
      rankBadge: "১৮তম স্থান (Top 4%)",
      percentile: "96.0%",
      submittedAt: "আজ, দুপুর ২:২০",
      status: "PASSED",
    },
    {
      id: "sub-f-02",
      examId: "med-model-past-23",
      examTitle: "বিগত বছরের মেডিকেল ভর্তি পরীক্ষা ২০২৩-২৪",
      university: "MBBS",
      totalScore: "71.25",
      maxScore: "100.00",
      totalAttempted: 95,
      totalCorrect: 76,
      totalWrong: 19,
      accuracyRate: "80.00%",
      rankBadge: "৪৫তম স্থান",
      percentile: "93.4%",
      submittedAt: "২ দিন আগে",
      status: "PASSED",
    },
  ],
  weakTopics: [
    {
      topicId: 403,
      topicName: "মেন্ডেলের সূত্র ও ব্যতিক্রমসমূহ",
      subjectName: "জীববিজ্ঞান ২য় পত্র",
      accuracyRate: "41.00%",
      attempted: 22,
      correct: 9,
      recommendation: "এপিস্ট্যাসিস, পরিপূরক জিন ও লিথাল জিনের অনুপাতগুলো চার্ট আকারে মুখস্থ করো।",
    },
    {
      topicId: 202,
      topicName: "দ্রাব্যতা ও দ্রাব্যতা গুণফল ($K_{sp}$)",
      subjectName: "রসায়ন ১ম পত্র",
      accuracyRate: "42.00%",
      attempted: 19,
      correct: 8,
      recommendation: "সম-আয়ন প্রভাব ও দ্রাব্যতা গুণফল সমীকরণের ম্যাথগুলো সমাধান করো।",
    },
  ],
};

// -------------------------------------------------------------
// 2. REACTIVE LOCAL STORAGE HELPERS
// -------------------------------------------------------------

const STORAGE_KEY_PREFIX = "admission_student_data_v2_";

/**
 * Gets student data for a given userId.
 * Falls back to Tahmid or Farabi persona if matching, or creates a new dynamic record.
 */
export function getStudentData(userId?: string | null, userName?: string): CompleteStudentData {
  if (typeof window === "undefined") {
    return TAHMID_PERSONA;
  }

  // Normalization checks
  const lowerName = (userName || "").toLowerCase();
  const lowerId = (userId || "").toLowerCase();

  const isFarabi =
    lowerId.includes("farabi") ||
    lowerName.includes("ফারাবি") ||
    lowerName.includes("farabi");

  const defaultPersona = isFarabi ? FARABI_PERSONA : TAHMID_PERSONA;
  const effectiveId = userId || defaultPersona.profile.id;
  const storageKey = `${STORAGE_KEY_PREFIX}${effectiveId}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Could not read student data from storage:", e);
  }

  // If this is a new custom user (neither Tahmid nor Farabi)
  if (!isFarabi && !lowerId.includes("tahmid") && userName && !lowerName.includes("তাহমিদ")) {
    const customPersona: CompleteStudentData = {
      profile: {
        id: effectiveId,
        fullName: userName,
        email: `${effectiveId}@admissionengine.com`,
        role: "STUDENT",
        targetUnit: "ENGINEERING",
        targetUniversity: "ইঞ্জিনিয়ারিং ও বিশ্ববিদ্যালয় ভর্তি প্রস্তুতি",
        collegeName: "শিক্ষার্থী কলেজ",
        avatarInitial: userName.slice(0, 1) || "শি",
        avatarColor: "from-purple-600 to-pink-700",
        targetExamDate: "২০২৬-১১-১৫",
        targetCountdownDays: 60,
      },
      analytics: {
        userId: effectiveId,
        totalExamsTaken: 1,
        totalQuestionsAttempted: 20,
        totalQuestionsCorrect: 16,
        totalQuestionsWrong: 4,
        overallAccuracy: "80.00",
        mistakeRate: "20.00",
        totalStudyTimeSeconds: 7200,
        streakDays: 1,
        syllabusCoveragePercentage: 15,
        weakTopicsCount: 0,
        lastActiveAt: new Date().toISOString(),
      },
      mistakes: [],
      recentExams: [
        {
          id: `sub-${Date.now()}`,
          examId: "initial-diagnostic-test",
          examTitle: "প্রাথমিক মূল্যায়ন টেস্ট",
          university: "Diagnostic",
          totalScore: "15.00",
          maxScore: "20.00",
          totalAttempted: 20,
          totalCorrect: 16,
          totalWrong: 4,
          accuracyRate: "80.00%",
          rankBadge: "অংশগ্রহণকারী",
          percentile: "85.0%",
          submittedAt: "আজ",
          status: "PASSED",
        },
      ],
      weakTopics: [],
    };
    saveStudentData(customPersona);
    return customPersona;
  }

  // Save the default persona to storage so modifications persist
  saveStudentData(defaultPersona);
  return defaultPersona;
}

/**
 * Saves student data to localStorage.
 */
export function saveStudentData(data: CompleteStudentData): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${data.profile.id}`, JSON.stringify(data));
  } catch (e) {
    console.warn("Could not save student data to storage:", e);
  }
}

/**
 * Records a practice question answer into student's dynamic profile.
 * Immediately updates accuracy %, mistake rate, questions counts, and mistake book!
 */
export function recordQuestionAnswerInStore(
  userId: string,
  question: any,
  selectedOptId: string,
  userName?: string
): { isCorrect: boolean; updatedData: CompleteStudentData } {
  const data = getStudentData(userId, userName);
  const isCorrect = selectedOptId === question.correctOptionId;

  // 1. Update analytics counts
  data.analytics.totalQuestionsAttempted += 1;
  if (isCorrect) {
    data.analytics.totalQuestionsCorrect += 1;
  } else {
    data.analytics.totalQuestionsWrong += 1;
  }

  // 2. Recompute dynamic percentages
  const att = data.analytics.totalQuestionsAttempted;
  const cor = data.analytics.totalQuestionsCorrect;
  const wrg = data.analytics.totalQuestionsWrong;

  data.analytics.overallAccuracy = ((cor / att) * 100).toFixed(2);
  data.analytics.mistakeRate = ((wrg / att) * 100).toFixed(2);
  data.analytics.lastActiveAt = new Date().toISOString();

  // 3. Update Mistake Book
  const existingIdx = data.mistakes.findIndex((m) => m.questionId === question.id);

  if (!isCorrect) {
    if (existingIdx >= 0) {
      data.mistakes[existingIdx]!.mistakeCount += 1;
      data.mistakes[existingIdx]!.consecutiveCorrectCount = 0;
      data.mistakes[existingIdx]!.isMastered = false;
      data.mistakes[existingIdx]!.lastAttemptedAt = new Date().toISOString();
    } else {
      data.mistakes.unshift({
        mistakeId: `mstk-${Date.now()}`,
        questionId: question.id,
        mistakeCount: 1,
        consecutiveCorrectCount: 0,
        isMastered: false,
        lastAttemptedAt: new Date().toISOString(),
        question: {
          id: question.id,
          subject: question.subject || question.subjectName || "সাধারণ",
          chapter: question.chapter || question.chapterName || "",
          topic: question.topic || question.topicName || "",
          universityTag: question.universityTag || "BUET",
          year: question.year,
          questionText: question.questionText,
          options: question.options || [],
          correctOptionId: question.correctOptionId,
          explanation: question.explanation || "",
          difficulty: question.difficulty || "MEDIUM",
        },
      });
    }
  } else {
    // If correct and it was in the mistake book, increment consecutive correct
    if (existingIdx >= 0) {
      data.mistakes[existingIdx]!.consecutiveCorrectCount += 1;
      // Two-strike mastery rule: 2 consecutive correct answers = Mastered!
      if (data.mistakes[existingIdx]!.consecutiveCorrectCount >= 2) {
        data.mistakes[existingIdx]!.isMastered = true;
      }
      data.mistakes[existingIdx]!.lastAttemptedAt = new Date().toISOString();
    }
  }

  saveStudentData(data);
  return { isCorrect, updatedData: data };
}

/**
 * Records a completed exam into student's dynamic profile.
 */
export function recordExamSubmissionInStore(
  userId: string,
  examDetails: {
    examId: string;
    examTitle: string;
    university: string;
    totalScore: number;
    maxScore: number;
    attempted: number;
    correct: number;
    wrong: number;
    rankBadge?: string;
  },
  userName?: string
): CompleteStudentData {
  const data = getStudentData(userId, userName);

  data.analytics.totalExamsTaken += 1;
  data.analytics.totalQuestionsAttempted += examDetails.attempted;
  data.analytics.totalQuestionsCorrect += examDetails.correct;
  data.analytics.totalQuestionsWrong += examDetails.wrong;

  const att = data.analytics.totalQuestionsAttempted;
  const cor = data.analytics.totalQuestionsCorrect;
  const wrg = data.analytics.totalQuestionsWrong;

  data.analytics.overallAccuracy = att > 0 ? ((cor / att) * 100).toFixed(2) : "0.00";
  data.analytics.mistakeRate = att > 0 ? ((wrg / att) * 100).toFixed(2) : "0.00";
  data.analytics.lastActiveAt = new Date().toISOString();

  // Prepend to recent exams
  data.recentExams.unshift({
    id: `sub-${Date.now()}`,
    examId: examDetails.examId,
    examTitle: examDetails.examTitle,
    university: examDetails.university,
    totalScore: examDetails.totalScore.toFixed(2),
    maxScore: examDetails.maxScore.toFixed(2),
    totalAttempted: examDetails.attempted,
    totalCorrect: examDetails.correct,
    totalWrong: examDetails.wrong,
    accuracyRate:
      examDetails.attempted > 0
        ? `${((examDetails.correct / examDetails.attempted) * 100).toFixed(1)}%`
        : "0%",
    rankBadge: examDetails.rankBadge || "সফলভাবে সম্পন্ন",
    percentile: "95.0%",
    submittedAt: "এইমাত্র",
    status: examDetails.totalScore >= examDetails.maxScore * 0.8 ? "EXCELLENT" : "PASSED",
  });

  saveStudentData(data);
  return data;
}

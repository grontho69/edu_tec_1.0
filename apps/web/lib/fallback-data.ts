import { SEED_TOPICS_CATALOG, SEED_ALL_400_QUESTIONS } from "./seed-questions-catalog";

/**
 * Zero-Lag Fallback & Offline Dataset for Admission Exam Engine.
 * Provides all 400 authentic questions across Physics, Chemistry, Math & Biology
 * and full syllabus taxonomy.
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

export const FALLBACK_TOPICS_CATALOG = SEED_TOPICS_CATALOG;

export const FALLBACK_PRACTICE_QUESTIONS: FallbackQuestion[] =
  SEED_ALL_400_QUESTIONS as FallbackQuestion[];

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

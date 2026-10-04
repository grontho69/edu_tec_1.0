/**
 * Built-in Model Test catalog.
 *
 * These exams are upserted into the `exams` table by the seed script so that
 * `/api/v1/exams/:id/paper` and the submission worker can resolve them (the
 * `exams.id` column is a UUID with FK references from submissions & cheating logs).
 *
 * `subjectCodes` + `questionCount` describe how the exam paper is assembled
 * from the seeded question bank.
 */
export interface ModelTestDefinition {
  id: string;
  title: string;
  description: string;
  examType: "PRACTICE" | "LIVE_MODEL_TEST" | "TOPIC_QUIZ";
  durationMinutes: number;
  questionCount: number;
  subjectCodes: string[];
  negativeMarkingRate: string;
}

export const MODEL_TEST_DEFINITIONS: ModelTestDefinition[] = [
  {
    id: "8f8b89e2-1111-2222-3333-444455556666",
    title: "বুয়েট স্পেশাল লাইভ মেগা মডেল টেস্ট — ০১",
    description: "BUET + CKRUET pattern: Physics, Chemistry & Higher Math",
    examType: "LIVE_MODEL_TEST",
    durationMinutes: 60,
    questionCount: 50,
    subjectCodes: ["PHY", "CHEM", "MATH"],
    negativeMarkingRate: "0.25",
  },
  {
    id: "8f8b89e2-2222-3333-4444-555566667777",
    title: "ঢাবি 'ক' ইউনিট স্পিড ও নির্ভুলতা টেস্ট",
    description: "DU Science unit: Physics, Chemistry, Math & Biology",
    examType: "LIVE_MODEL_TEST",
    durationMinutes: 45,
    questionCount: 60,
    subjectCodes: ["PHY", "CHEM", "MATH", "BIO"],
    negativeMarkingRate: "0.25",
  },
  {
    id: "8f8b89e2-3333-4444-5555-666677778888",
    title: "মেডিকেল জীববিজ্ঞান ও রসায়ন বুস্টার টেস্ট",
    description: "MBBS & BDS pattern: Biology & Chemistry",
    examType: "LIVE_MODEL_TEST",
    durationMinutes: 60,
    questionCount: 100,
    subjectCodes: ["BIO", "CHEM"],
    negativeMarkingRate: "0.25",
  },
  {
    id: "8f8b89e2-4444-5555-6666-777788889999",
    title: "বিগত বছরের প্রশ্ন: বুয়েট ভর্তি পরীক্ষা ২০২৩-২৪",
    description: "BUET previous year practice: Physics, Chemistry & Higher Math",
    examType: "PRACTICE",
    durationMinutes: 60,
    questionCount: 60,
    subjectCodes: ["PHY", "CHEM", "MATH"],
    negativeMarkingRate: "0.25",
  },
];

export function getModelTestDefinition(examId: string): ModelTestDefinition | undefined {
  return MODEL_TEST_DEFINITIONS.find((t) => t.id === examId);
}

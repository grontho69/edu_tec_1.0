import type { DatabaseInstance } from "@admission-engine/database";
import {
  users,
  userAnalytics,
  examSubmissions,
  exams,
  cheatingLogs,
} from "@admission-engine/database";
import { eq, desc, and, ilike, or, count } from "drizzle-orm";
import type {
  StudentFilter,
  LogCheatingInfractionInput,
} from "@admission-engine/types";

export class StudentOversightService {
  constructor(private db: DatabaseInstance) {}

  /**
   * Queries and audits all student profiles with pre-calculated progression metrics and infraction tallies.
   */
  async listStudents(filter?: StudentFilter) {
    const limit = Math.min(100, Math.max(1, filter?.limit ?? 20));
    const offset = Math.max(0, filter?.offset ?? 0);

    const conditions = [eq(users.role, "STUDENT")];

    if (filter?.targetUnit) {
      conditions.push(eq(users.targetUnit, filter.targetUnit));
    }

    if (filter?.search && filter.search.trim().length > 0) {
      const term = `%${filter.search.trim()}%`;
      conditions.push(or(ilike(users.fullName, term), ilike(users.email, term))!);
    }

    const students = await this.db
      .select({
        id: users.id,
        fullName: users.fullName,
        email: users.email,
        phone: users.phone,
        targetUnit: users.targetUnit,
        avatarUrl: users.avatarUrl,
        createdAt: users.createdAt,
        totalExamsTaken: userAnalytics.totalExamsTaken,
        overallAccuracy: userAnalytics.overallAccuracy,
        streakDays: userAnalytics.streakDays,
        lastActiveAt: userAnalytics.lastActiveAt,
      })
      .from(users)
      .leftJoin(userAnalytics, eq(users.id, userAnalytics.userId))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset);

    // Fetch infraction counts for these students
    const studentIds = students.map((s) => s.id);
    const infractionMap = new Map<string, number>();

    if (studentIds.length > 0) {
      const infractions = await this.db
        .select({
          userId: cheatingLogs.userId,
          count: count(cheatingLogs.id),
        })
        .from(cheatingLogs)
        .groupBy(cheatingLogs.userId);

      for (const inf of infractions) {
        infractionMap.set(inf.userId, Number(inf.count));
      }
    }

    return students.map((s) => ({
      ...s,
      totalExamsTaken: s.totalExamsTaken ?? 0,
      overallAccuracy: s.overallAccuracy ?? "0.00",
      streakDays: s.streakDays ?? 0,
      cheatingInfractionCount: infractionMap.get(s.id) ?? 0,
    }));
  }

  /**
   * Retrieves complete student audit report including exam history and cheating logs.
   */
  async getStudentAudit(studentId: string) {
    const [student] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, studentId), eq(users.role, "STUDENT")))
      .limit(1);

    if (!student) {
      return null;
    }

    const [analytics] = await this.db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.userId, studentId))
      .limit(1);

    // Exam submissions history
    const submissions = await this.db
      .select({
        id: examSubmissions.id,
        examId: examSubmissions.examId,
        examTitle: exams.title,
        totalScore: examSubmissions.totalScore,
        totalAttempted: examSubmissions.totalAttempted,
        totalCorrect: examSubmissions.totalCorrect,
        accuracyRate: examSubmissions.accuracyRate,
        timeTakenSeconds: examSubmissions.timeTakenSeconds,
        submittedAt: examSubmissions.submittedAt,
      })
      .from(examSubmissions)
      .innerJoin(exams, eq(examSubmissions.examId, exams.id))
      .where(eq(examSubmissions.userId, studentId))
      .orderBy(desc(examSubmissions.submittedAt))
      .limit(20);

    // Cheating / proctoring infraction logs
    const infractions = await this.db
      .select()
      .from(cheatingLogs)
      .where(eq(cheatingLogs.userId, studentId))
      .orderBy(desc(cheatingLogs.createdAt));

    return {
      student,
      analytics: analytics || {
        totalExamsTaken: 0,
        totalQuestionsAttempted: 0,
        totalQuestionsCorrect: 0,
        overallAccuracy: "0.00",
        totalStudyTimeSeconds: 0,
        streakDays: 0,
        lastActiveAt: null,
      },
      submissions,
      infractions,
    };
  }

  /**
   * Records a cheating/proctoring infraction.
   * Auto-escalates actionTaken to FORCED_SUBMISSION upon the 3rd infraction.
   */
  async recordCheatingInfraction(input: LogCheatingInfractionInput) {
    // Count existing infractions for this exam session
    const existing = await this.db
      .select({ id: cheatingLogs.id })
      .from(cheatingLogs)
      .where(
        and(
          eq(cheatingLogs.userId, input.userId),
          eq(cheatingLogs.examId, input.examId)
        )
      );

    const infractionNumber = existing.length + 1;
    const actionTaken: "WARNING" | "FORCED_SUBMISSION" =
      infractionNumber >= 3 ? "FORCED_SUBMISSION" : "WARNING";

    const [record] = await this.db
      .insert(cheatingLogs)
      .values({
        userId: input.userId,
        examId: input.examId,
        infractionType: input.infractionType,
        infractionNumber,
        actionTaken,
        metadata: input.metadata || {},
      })
      .returning();

    return {
      ...record,
      shouldForceSubmit: infractionNumber >= 3,
    };
  }
}

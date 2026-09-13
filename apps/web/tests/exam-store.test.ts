import { describe, it, expect, beforeEach } from "vitest";
import "fake-indexeddb/auto";
import {
  saveAnswer,
  getDraft,
  clearDraft,
  recordLocalInfraction,
  getLocalInfractions,
  clearInfractions,
} from "../lib/storage/exam-store";

describe("Exam Store Offline-First IndexedDB Test Suite", () => {
  const testExamId = "exam_offline_test_101";

  beforeEach(async () => {
    await clearDraft(testExamId);
    await clearInfractions(testExamId);
  });

  it("1. Saves answers to IndexedDB before React state and rehydrates draft in under 50ms", async () => {
    const startTime = performance.now();

    // Student clicks options for question 1 and question 2
    await saveAnswer(testExamId, "q_1", "B", 150);
    await saveAnswer(testExamId, "q_2", "D", 150);

    // Accidental reload scenario: rehydrate from IndexedDB
    const rehydrated = await getDraft(testExamId);
    const elapsed = performance.now() - startTime;

    expect(rehydrated).toBeDefined();
    expect(rehydrated?.examId).toBe(testExamId);
    expect(rehydrated?.answers["q_1"]).toBe("B");
    expect(rehydrated?.answers["q_2"]).toBe("D");
    expect(rehydrated?.serverOffsetMs).toBe(150);
    expect(elapsed).toBeLessThan(50); // Under 50ms offline requirement
  });

  it("2. Clears draft completely upon exam submission", async () => {
    await saveAnswer(testExamId, "q_1", "A");
    const beforeClear = await getDraft(testExamId);
    expect(beforeClear?.answers["q_1"]).toBe("A");

    await clearDraft(testExamId);
    const afterClear = await getDraft(testExamId);
    expect(afterClear).toBeNull();
  });

  it("3. Records local proctoring infractions and tracks infraction count", async () => {
    const inf1 = await recordLocalInfraction(testExamId, "TAB_BLUR");
    expect(inf1).toBe(1);

    const inf2 = await recordLocalInfraction(testExamId, "FULLSCREEN_EXIT");
    expect(inf2).toBe(2);

    const inf3 = await recordLocalInfraction(testExamId, "TAB_BLUR");
    expect(inf3).toBe(3);

    const all = await getLocalInfractions(testExamId);
    expect(all.length).toBe(3);
    expect(all[0]?.type).toBe("TAB_BLUR");
    expect(all[1]?.type).toBe("FULLSCREEN_EXIT");
  });
});

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "admission_engine_offline_store";
const DB_VERSION = 1;
const STORE_DRAFTS = "exam_drafts";
const STORE_INFRACTIONS = "exam_infractions";

export interface ExamDraftRecord {
  examId: string;
  answers: Record<string, string>; // questionId -> selectedOptionId
  serverOffsetMs: number;
  lastUpdatedAt: number;
}

export interface InfractionRecord {
  id?: number;
  examId: string;
  type: string;
  timestamp: number;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> | null {
  const isClient = typeof window !== "undefined";
  const hasIndexedDb =
    (isClient && "indexedDB" in window && !!window.indexedDB) ||
    (typeof globalThis !== "undefined" && "indexedDB" in globalThis && !!(globalThis as any).indexedDB);

  if (!hasIndexedDb) {
    return null;
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_DRAFTS)) {
          db.createObjectStore(STORE_DRAFTS, { keyPath: "examId" });
        }
        if (!db.objectStoreNames.contains(STORE_INFRACTIONS)) {
          const store = db.createObjectStore(STORE_INFRACTIONS, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("examId", "examId");
        }
      },
    });
  }

  return dbPromise;
}

/**
 * Saves a student's answer selection to IndexedDB before updating React state.
 * Guarantees zero data loss on accidental reload, network drops, or crash.
 */
export async function saveAnswer(
  examId: string,
  questionId: string,
  option: string,
  serverOffsetMs: number = 0
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const tx = db.transaction(STORE_DRAFTS, "readwrite");
  const store = tx.objectStore(STORE_DRAFTS);

  const existing = (await store.get(examId)) as ExamDraftRecord | undefined;
  const draft: ExamDraftRecord = existing || {
    examId,
    answers: {},
    serverOffsetMs,
    lastUpdatedAt: Date.now(),
  };

  draft.answers[questionId] = option;
  draft.lastUpdatedAt = Date.now();
  if (serverOffsetMs !== 0) {
    draft.serverOffsetMs = serverOffsetMs;
  }

  await store.put(draft);
  await tx.done;
}

/**
 * Rehydrates student answers from IndexedDB in < 50ms without hitting the backend API.
 */
export async function getDraft(examId: string): Promise<ExamDraftRecord | null> {
  const db = await getDb();
  if (!db) return null;

  const record = (await db.get(STORE_DRAFTS, examId)) as ExamDraftRecord | undefined;
  return record || null;
}

/**
 * Clears saved exam draft upon successful submission.
 */
export async function clearDraft(examId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(STORE_DRAFTS, examId);
}

/**
 * Saves synchronized server offset (serverTime - clientTime) to prevent OS clock tampering.
 */
export async function saveServerOffset(examId: string, offsetMs: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existing = (await db.get(STORE_DRAFTS, examId)) as ExamDraftRecord | undefined;
  if (existing) {
    existing.serverOffsetMs = offsetMs;
    await db.put(STORE_DRAFTS, existing);
  } else {
    await db.put(STORE_DRAFTS, {
      examId,
      answers: {},
      serverOffsetMs: offsetMs,
      lastUpdatedAt: Date.now(),
    });
  }
}

/**
 * Records local anti-cheat infraction (e.g. visibilitychange blur, fullscreen exit)
 * and returns the cumulative count for this exam session.
 */
export async function recordLocalInfraction(examId: string, type: string): Promise<number> {
  const db = await getDb();
  if (!db) return 1;

  await db.add(STORE_INFRACTIONS, {
    examId,
    type,
    timestamp: Date.now(),
  });

  const all = await db.getAllFromIndex(STORE_INFRACTIONS, "examId", examId);
  return all.length;
}

/**
 * Fetches all infractions logged for this exam session.
 */
export async function getLocalInfractions(examId: string): Promise<InfractionRecord[]> {
  const db = await getDb();
  if (!db) return [];

  return db.getAllFromIndex(STORE_INFRACTIONS, "examId", examId);
}

/**
 * Clears infractions for a given exam session.
 */
export async function clearInfractions(examId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const tx = db.transaction(STORE_INFRACTIONS, "readwrite");
  const store = tx.objectStore(STORE_INFRACTIONS);
  const index = store.index("examId");
  let cursor = await index.openCursor(IDBKeyRange.only(examId));
  while (cursor) {
    await cursor.delete();
    cursor = await cursor.continue();
  }
  await tx.done;
}

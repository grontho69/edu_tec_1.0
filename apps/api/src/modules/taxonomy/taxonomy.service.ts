import type { DatabaseInstance } from "@admission-engine/database";
import { subjects, chapters, topics } from "@admission-engine/database";

export interface HierarchicalTopic {
  id: number;
  name: string;
  slug: string;
}

export interface HierarchicalChapter {
  id: number;
  name: string;
  chapterNumber: number;
  slug: string;
  topics: HierarchicalTopic[];
}

export interface HierarchicalSubject {
  id: number;
  name: string;
  code: string;
  slug: string;
  iconUrl: string | null;
  chapters: HierarchicalChapter[];
}

export interface TaxonomyCacheEntry {
  tree: HierarchicalSubject[];
  cachedAt: number;
  expiresAt: number;
}

export class TaxonomyService {
  private cache: TaxonomyCacheEntry | null = null;
  private readonly defaultTtlMs: number;

  constructor(defaultTtlMs = 10 * 60 * 1000) {
    // Default cache TTL: 10 minutes
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Retrieves the hierarchical taxonomy tree (Subject -> Chapter -> Topic).
   * Checks in-memory cache first; on miss, fetches from database and caches.
   */
  async getTaxonomyTree(db: DatabaseInstance, forceRefresh = false): Promise<HierarchicalSubject[]> {
    const now = Date.now();

    if (!forceRefresh && this.cache && this.cache.expiresAt > now) {
      return this.cache.tree;
    }

    // Fetch all subjects, chapters, and topics in parallel using indexed queries
    const [allSubjects, allChapters, allTopics] = await Promise.all([
      db.select().from(subjects).orderBy(subjects.id),
      db.select().from(chapters).orderBy(chapters.chapterNumber),
      db.select().from(topics).orderBy(topics.id),
    ]);

    // Group topics by chapterId
    const topicsByChapter = new Map<number, HierarchicalTopic[]>();
    for (const t of allTopics) {
      const list = topicsByChapter.get(t.chapterId) ?? [];
      list.push({
        id: t.id,
        name: t.name,
        slug: t.slug,
      });
      topicsByChapter.set(t.chapterId, list);
    }

    // Group chapters by subjectId
    const chaptersBySubject = new Map<number, HierarchicalChapter[]>();
    for (const c of allChapters) {
      const list = chaptersBySubject.get(c.subjectId) ?? [];
      list.push({
        id: c.id,
        name: c.name,
        chapterNumber: c.chapterNumber,
        slug: c.slug,
        topics: topicsByChapter.get(c.id) ?? [],
      });
      chaptersBySubject.set(c.subjectId, list);
    }

    // Build hierarchical subjects
    const tree: HierarchicalSubject[] = allSubjects.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      slug: s.slug,
      iconUrl: s.iconUrl,
      chapters: chaptersBySubject.get(s.id) ?? [],
    }));

    // Update in-memory cache
    this.cache = {
      tree,
      cachedAt: now,
      expiresAt: now + this.defaultTtlMs,
    };

    return tree;
  }

  /**
   * Invalidate the in-memory taxonomy cache (e.g. on new chapter/topic creation).
   */
  invalidateCache(): void {
    this.cache = null;
  }

  /**
   * Checks if in-memory cache currently holds active data.
   */
  isCached(): boolean {
    return this.cache !== null && this.cache.expiresAt > Date.now();
  }
}

export const taxonomyService = new TaxonomyService();

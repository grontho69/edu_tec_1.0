/**
 * Redis client interface and in-memory implementation supporting:
 * - Sorted Sets (ZADD, ZREMRANGEBYSCORE, ZCARD, ZCOUNT, ZREVRANK, ZREVRANGE, ZSCORE)
 * - Key-Value operations (SET with atomic NX/XX and EX/PX, GET, DEL, GETDEL)
 * - Atomic command pipelining for Upstash quota budgeting
 * - Automatic millisecond-level TTL expiration
 */

export interface SetOptions {
  nx?: boolean;
  xx?: boolean;
  ex?: number; // seconds
  px?: number; // milliseconds
}

export interface IRedisPipeline {
  zadd(key: string, score: number, member: string): IRedisPipeline;
  zrevrank(key: string, member: string): IRedisPipeline;
  zscore(key: string, member: string): IRedisPipeline;
  set(key: string, value: string, ...args: any[]): IRedisPipeline;
  get(key: string): IRedisPipeline;
  del(...keys: string[]): IRedisPipeline;
  expire(key: string, seconds: number): IRedisPipeline;
  exec(): Promise<any[]>;
}

export interface IRedisClient {
  zremrangebyscore(key: string, min: number | string, max: number | string): Promise<number>;
  zadd(key: string, score: number, member: string): Promise<number>;
  zcard(key: string): Promise<number>;
  zcount(key: string, min: number | string, max: number | string): Promise<number>;
  zrevrank(key: string, member: string): Promise<number | null>;
  zrevrange(
    key: string,
    start: number,
    stop: number,
    withScores?: boolean
  ): Promise<any[]>;
  zscore(key: string, member: string): Promise<number | null>;
  expire(key: string, seconds: number): Promise<number>;
  set(key: string, value: string, ...args: any[]): Promise<"OK" | null>;
  get(key: string): Promise<string | null>;
  del(...keys: string[]): Promise<number>;
  getdel(key: string): Promise<string | null>;
  pipeline(): IRedisPipeline;
  flushall(): Promise<"OK">;
}

interface SortedSetMember {
  score: number;
  member: string;
}

interface StoredValue {
  type: "string" | "zset";
  value?: string | undefined;
  zset?: SortedSetMember[] | undefined;
  expiresAt?: number | undefined;
}

export class InMemoryRedisClient implements IRedisClient {
  private store = new Map<string, StoredValue>();

  private cleanIfExpired(key: string): StoredValue | undefined {
    const item = this.store.get(key);
    if (!item) return undefined;
    if (item.expiresAt !== undefined && Date.now() > item.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return item;
  }

  async zremrangebyscore(key: string, min: number | string, max: number | string): Promise<number> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "zset" || !item.zset) {
      return 0;
    }

    const minScore = min === "-inf" ? -Infinity : typeof min === "number" ? min : parseFloat(min);
    const maxScore = max === "+inf" ? Infinity : typeof max === "number" ? max : parseFloat(max);

    const initialLen = item.zset.length;
    item.zset = item.zset.filter((m) => m.score < minScore || m.score > maxScore);
    const removedCount = initialLen - item.zset.length;
    return removedCount;
  }

  async zadd(key: string, score: number, member: string): Promise<number> {
    let item = this.cleanIfExpired(key);
    if (!item) {
      item = { type: "zset", zset: [] };
      this.store.set(key, item);
    } else if (item.type !== "zset") {
      item.type = "zset";
      item.zset = [];
    }

    const existingIndex = item.zset!.findIndex((m) => m.member === member);
    if (existingIndex >= 0) {
      item.zset![existingIndex]!.score = score;
      return 0; // Updated, not added
    }

    item.zset!.push({ score, member });
    item.zset!.sort((a, b) => a.score - b.score);
    return 1; // Added
  }

  async zcard(key: string): Promise<number> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "zset" || !item.zset) {
      return 0;
    }
    return item.zset.length;
  }

  async zcount(key: string, min: number | string, max: number | string): Promise<number> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "zset" || !item.zset) {
      return 0;
    }

    const minScore = min === "-inf" ? -Infinity : typeof min === "number" ? min : parseFloat(min);
    const maxScore = max === "+inf" ? Infinity : typeof max === "number" ? max : parseFloat(max);

    return item.zset.filter((m) => m.score >= minScore && m.score <= maxScore).length;
  }

  async zrevrank(key: string, member: string): Promise<number | null> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "zset" || !item.zset || item.zset.length === 0) {
      return null;
    }

    // Sort descending by score
    const descSorted = [...item.zset].sort((a, b) => b.score - a.score);
    const idx = descSorted.findIndex((m) => m.member === member);
    return idx >= 0 ? idx : null;
  }

  async zrevrange(
    key: string,
    start: number,
    stop: number,
    withScores = false
  ): Promise<any[]> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "zset" || !item.zset || item.zset.length === 0) {
      return [];
    }

    const descSorted = [...item.zset].sort((a, b) => b.score - a.score);
    const total = descSorted.length;

    // Normalize negative indices
    const normalizedStart = start < 0 ? Math.max(0, total + start) : start;
    let normalizedStop = stop < 0 ? total + stop : stop;
    if (normalizedStop >= total) normalizedStop = total - 1;

    if (normalizedStart > normalizedStop || normalizedStart >= total) {
      return [];
    }

    const sliced = descSorted.slice(normalizedStart, normalizedStop + 1);
    if (withScores) {
      return sliced.map((s) => ({ member: s.member, score: s.score }));
    }
    return sliced.map((s) => s.member);
  }

  async zscore(key: string, member: string): Promise<number | null> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "zset" || !item.zset) {
      return null;
    }
    const found = item.zset.find((m) => m.member === member);
    return found ? found.score : null;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const item = this.cleanIfExpired(key);
    if (!item) return 0;
    item.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  /**
   * Sets key with value. Supports:
   * - set(key, value, "EX", 120)
   * - set(key, value, "NX", "EX", 120)
   * - set(key, value, "EX", 120, "NX")
   * - set(key, value, { nx: true, ex: 120 })
   */
  async set(key: string, value: string, ...args: any[]): Promise<"OK" | null> {
    let nx = false;
    let xx = false;
    let durationSeconds: number | undefined;
    let durationMs: number | undefined;

    // Parse options from args
    for (let i = 0; i < args.length; i++) {
      const arg = args[i];
      if (typeof arg === "string") {
        const upper = arg.toUpperCase();
        if (upper === "NX") nx = true;
        if (upper === "XX") xx = true;
        if (upper === "EX" && typeof args[i + 1] === "number") {
          durationSeconds = args[i + 1];
          i++;
        }
        if (upper === "PX" && typeof args[i + 1] === "number") {
          durationMs = args[i + 1];
          i++;
        }
      } else if (typeof arg === "object" && arg !== null) {
        if (arg.nx) nx = true;
        if (arg.xx) xx = true;
        if (typeof arg.ex === "number") durationSeconds = arg.ex;
        if (typeof arg.px === "number") durationMs = arg.px;
      }
    }

    const existing = this.cleanIfExpired(key);

    // NX: Set only if key does NOT exist
    if (nx && existing !== undefined) {
      return null;
    }

    // XX: Set only if key DOES exist
    if (xx && existing === undefined) {
      return null;
    }

    let expiresAt: number | undefined;
    if (typeof durationSeconds === "number") {
      expiresAt = Date.now() + durationSeconds * 1000;
    } else if (typeof durationMs === "number") {
      expiresAt = Date.now() + durationMs;
    }

    this.store.set(key, {
      type: "string",
      value,
      expiresAt,
    });

    return "OK";
  }

  async get(key: string): Promise<string | null> {
    const item = this.cleanIfExpired(key);
    if (!item || item.type !== "string" || item.value === undefined) {
      return null;
    }
    return item.value;
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) {
        count++;
      }
    }
    return count;
  }

  async getdel(key: string): Promise<string | null> {
    const val = await this.get(key);
    if (val !== null) {
      this.store.delete(key);
    }
    return val;
  }

  /**
   * Upstash quota budgeting: combines multiple Redis operations into a pipeline
   */
  pipeline(): IRedisPipeline {
    const operations: Array<() => Promise<any>> = [];

    const pipe: IRedisPipeline = {
      zadd: (key, score, member) => {
        operations.push(() => this.zadd(key, score, member));
        return pipe;
      },
      zrevrank: (key, member) => {
        operations.push(() => this.zrevrank(key, member));
        return pipe;
      },
      zscore: (key, member) => {
        operations.push(() => this.zscore(key, member));
        return pipe;
      },
      set: (key, value, ...args) => {
        operations.push(() => this.set(key, value, ...args));
        return pipe;
      },
      get: (key) => {
        operations.push(() => this.get(key));
        return pipe;
      },
      del: (...keys) => {
        operations.push(() => this.del(...keys));
        return pipe;
      },
      expire: (key, seconds) => {
        operations.push(() => this.expire(key, seconds));
        return pipe;
      },
      exec: async () => {
        const results = [];
        for (const op of operations) {
          results.push(await op());
        }
        return results;
      },
    };

    return pipe;
  }

  async flushall(): Promise<"OK"> {
    this.store.clear();
    return "OK";
  }
}

// Global default instance for shared in-memory state across requests
export const defaultRedisClient = new InMemoryRedisClient();

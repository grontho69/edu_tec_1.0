/**
 * Binary Min-Heap Priority Queue for Top-K Admission Leaderboard & Tie-Breaking.
 *
 * Traditional full sort: O(N log N) time, O(N) memory.
 * Min-Heap Top-K: O(N log K) time, O(K) memory.
 * For 50,000 students, Top-100 evaluation requires only a 100-element heap!
 *
 * Strict BUET / Medical Admission Tie-Breaking Rules:
 * 1. Score: Higher is better (descending).
 * 2. Wrong Count / Penalty: Fewer mistakes is better (ascending).
 * 3. Completion Time: Faster completion is better (ascending).
 */

export interface CandidateResult {
  userId: string;
  fullName: string;
  college?: string | undefined;
  targetUnit?: string | undefined;
  score: number;
  wrongCount: number;
  durationSeconds: number;
  submittedAt: string;
}

export class LeaderboardHeap {
  private heap: CandidateResult[] = [];
  private readonly maxCapacity: number;

  constructor(k: number = 100) {
    this.maxCapacity = k;
  }

  /**
   * Compares candidate A against candidate B.
   * Returns:
   *  < 0 if A is "inferior" to B (lower score, more wrong, or slower)
   *  > 0 if A is "superior" to B (higher score, fewer wrong, or faster)
   *  = 0 if identical performance
   */
  private compare(a: CandidateResult, b: CandidateResult): number {
    // 1. Primary: Score (higher is better)
    if (a.score !== b.score) {
      return a.score - b.score;
    }

    // 2. Secondary: Wrong Count (fewer mistakes is better)
    if (a.wrongCount !== b.wrongCount) {
      return b.wrongCount - a.wrongCount; // B has more wrong => A is better => positive
    }

    // 3. Tertiary: Duration (faster is better)
    if (a.durationSeconds !== b.durationSeconds) {
      return b.durationSeconds - a.durationSeconds; // B took longer => A is faster => positive
    }

    // 4. Stable tie-breaker: Earlier submission time
    return b.submittedAt.localeCompare(a.submittedAt);
  }

  /**
   * Inserts a candidate into the Top-K heap.
   * Time complexity: O(log K) per candidate.
   */
  push(candidate: CandidateResult): void {
    if (this.heap.length < this.maxCapacity) {
      this.heap.push(candidate);
      this.siftUp(this.heap.length - 1);
    } else if (this.compare(candidate, this.heap[0]!) > 0) {
      // Candidate is better than the current minimum in the top-K
      this.heap[0] = candidate;
      this.siftDown(0);
    }
  }

  /**
   * Batch processes N candidates and returns the sorted Top-K list.
   * Time complexity: O(N log K).
   */
  getTopK(): CandidateResult[] {
    // Clone and sort descending
    return [...this.heap].sort((a, b) => this.compare(b, a));
  }

  size(): number {
    return this.heap.length;
  }

  clear(): void {
    this.heap = [];
  }

  private siftUp(index: number): void {
    let current = index;
    while (current > 0) {
      const parent = Math.floor((current - 1) / 2);
      // Min-heap: parent should be inferior to child
      if (this.compare(this.heap[current]!, this.heap[parent]!) < 0) {
        this.swap(current, parent);
        current = parent;
      } else {
        break;
      }
    }
  }

  private siftDown(index: number): void {
    let current = index;
    const length = this.heap.length;

    while (true) {
      let smallest = current;
      const left = 2 * current + 1;
      const right = 2 * current + 2;

      if (left < length && this.compare(this.heap[left]!, this.heap[smallest]!) < 0) {
        smallest = left;
      }

      if (right < length && this.compare(this.heap[right]!, this.heap[smallest]!) < 0) {
        smallest = right;
      }

      if (smallest !== current) {
        this.swap(current, smallest);
        current = smallest;
      } else {
        break;
      }
    }
  }

  private swap(i: number, j: number): void {
    const temp = this.heap[i]!;
    this.heap[i] = this.heap[j]!;
    this.heap[j] = temp;
  }
}

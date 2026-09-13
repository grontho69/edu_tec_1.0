import type { ExamWorker, ExamSubmissionJob, EvaluatedExamResult } from "./exam-worker";

export interface ISubmissionQueue {
  push(job: ExamSubmissionJob): Promise<void>;
  drain(): Promise<void>;
  getPendingCount(): number;
  processDirect?(job: ExamSubmissionJob): Promise<EvaluatedExamResult>;
}

/**
 * Lightweight, zero-cost in-memory asynchronous submission queue
 * (compatible with BullMQ / Upstash QStash semantics for production serverless).
 */
export class InMemorySubmissionQueue implements ISubmissionQueue {
  private queue: ExamSubmissionJob[] = [];
  private isProcessing = false;
  private activePromises = new Set<Promise<EvaluatedExamResult>>();

  constructor(private worker: ExamWorker) {}

  async processDirect(job: ExamSubmissionJob): Promise<EvaluatedExamResult> {
    return await this.worker.processSubmission(job);
  }

  async push(job: ExamSubmissionJob): Promise<void> {
    this.queue.push(job);
    // Non-blocking trigger of worker execution
    queueMicrotask(() => this.processNext());
  }

  private async processNext(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) break;

      const promise = this.worker
        .processSubmission(job)
        .catch((err) => {
          console.error(`[ExamSubmissionQueue] Error processing submission ${job.ticketId}:`, err);
          return null as any;
        })
        .finally(() => {
          this.activePromises.delete(promise);
        });

      this.activePromises.add(promise);
    }
    this.isProcessing = false;
  }

  /**
   * Waits until all currently enqueued and in-flight jobs have completed execution.
   * Crucial for deterministic automated tests.
   */
  async drain(): Promise<void> {
    while (this.queue.length > 0 || this.activePromises.size > 0) {
      await this.processNext();
      if (this.activePromises.size > 0) {
        await Promise.all(Array.from(this.activePromises));
      }
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  getPendingCount(): number {
    return this.queue.length + this.activePromises.size;
  }
}

// Queue abstraction for background job processing.
// Uses Redis-backed BullMQ when available, falls back to in-process execution.

import { createLogger } from "../logging/logger";

const log = createLogger({ component: "queue" });

export type JobStatus = "pending" | "active" | "completed" | "failed" | "delayed" | "waiting-children";

export interface Job<T = unknown> {
  id: string;
  queue: string;
  data: T;
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  failedAt?: Date;
  error?: string;
  result?: unknown;
}

export type JobHandler<T = unknown> = (data: T, job: Job<T>) => Promise<unknown>;

export interface QueueOptions {
  concurrency?: number;
  maxAttempts?: number;
  backoffDelay?: number;
  backoffType?: "fixed" | "exponential";
}

export interface Queue {
  name: string;
  add<T>(data: T, opts?: { delay?: number; jobId?: string }): Promise<Job<T>>;
  process<T>(handler: JobHandler<T>): void;
  getJob(jobId: string): Promise<Job | null>;
  getStats(): Promise<{ waiting: number; active: number; completed: number; failed: number }>;
}

// In-process queue implementation (for dev/test)
class InProcessQueue implements Queue {
  readonly name: string;
  private jobs = new Map<string, Job>();
  private handlers: JobHandler[] = [];
  private processing = false;

  constructor(name: string, private opts: QueueOptions) {
    this.name = name;
  }

  async add<T>(data: T, extra?: { delay?: number; jobId?: string }): Promise<Job<T>> {
    const id = extra?.jobId ?? `${this.name}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
    const job: Job<T> = {
      id,
      queue: this.name,
      data,
      status: "pending",
      attempts: 0,
      maxAttempts: this.opts.maxAttempts ?? 3,
      createdAt: new Date(),
    };
    this.jobs.set(id, job);

    if (!extra?.delay) {
      // Process asynchronously
      setTimeout(() => this.processNext(), 0);
    } else {
      setTimeout(() => this.processNext(), extra.delay);
    }

    return job;
  }

  process<T>(handler: JobHandler<T>) {
    this.handlers.push(handler as JobHandler);
  }

  async getJob(jobId: string): Promise<Job | null> {
    return this.jobs.get(jobId) ?? null;
  }

  async getStats() {
    const jobs = Array.from(this.jobs.values());
    return {
      waiting: jobs.filter((j) => j.status === "pending").length,
      active: jobs.filter((j) => j.status === "active").length,
      completed: jobs.filter((j) => j.status === "completed").length,
      failed: jobs.filter((j) => j.status === "failed").length,
    };
  }

  private async processNext() {
    if (this.processing || this.handlers.length === 0) return;
    this.processing = true;

    const pending = Array.from(this.jobs.values()).filter((j) => j.status === "pending");
    for (const job of pending) {
      job.status = "active";
      job.attempts++;
      job.processedAt = new Date();

      try {
        const handler = this.handlers[0]!;
        job.result = await handler(job.data, job);
        job.status = "completed";
        job.completedAt = new Date();
      } catch (err) {
        job.error = String(err);
        if (job.attempts >= job.maxAttempts) {
          job.status = "failed";
          job.failedAt = new Date();
          log.error("Job failed permanently", { jobId: job.id, queue: this.name, error: job.error });
        } else {
          job.status = "pending";
          // Retry with backoff
          const delay = this.opts.backoffType === "exponential"
            ? (this.opts.backoffDelay ?? 1000) * Math.pow(2, job.attempts - 1)
            : (this.opts.backoffDelay ?? 1000);
          setTimeout(() => this.processNext(), delay);
        }
      }
    }

    this.processing = false;
  }
}

// Queue registry
const queues = new Map<string, Queue>();

export function getQueue(name: string, opts: QueueOptions = {}): Queue {
  let queue = queues.get(name);
  if (!queue) {
    queue = new InProcessQueue(name, opts);
    queues.set(name, queue);
  }
  return queue;
}

// --- Pre-defined queues ---

export const QUEUES = {
  EVALUATION: "conversation.evaluation",
  AUDIO_ANALYSIS: "audio.analysis",
  EMBEDDING: "embedding.generate",
  DOCUMENT_PROCESS: "document.process",
  ANALYTICS: "analytics.aggregate",
} as const;

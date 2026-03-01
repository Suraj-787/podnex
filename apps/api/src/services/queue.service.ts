import { Queue, Worker, Job } from "bullmq";

export interface PodcastJobData {
    podcastId: string;
    userId: string;
    noteContent: string;
    duration: "SHORT" | "LONG";
    hostVoice: string;
    guestVoice: string;
    ttsProvider: string;
}

const QUEUE_NAME = "podcast-generation";

// Build BullMQ connection config from REDIS_URL, preserving TLS for rediss://
const rawUrl = process.env.REDIS_URL || "redis://localhost:6379";
let connectionConfig: Record<string, unknown>;
try {
    const parsed = new URL(rawUrl);
    connectionConfig = {
        host: parsed.hostname,
        port: parseInt(parsed.port || "6379"),
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        tls: rawUrl.startsWith("rediss://") ? {} : undefined,
        maxRetriesPerRequest: null,
        enableReadyCheck: false,
        retryStrategy: (times: number) => times > 10 ? null : Math.min(times * 500, 30000),
    };
} catch {
    connectionConfig = { host: "localhost", port: 6379, maxRetriesPerRequest: null };
}


export const podcastQueue = new Queue<PodcastJobData>(QUEUE_NAME, {
    connection: connectionConfig,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: "exponential",
            delay: 5000,
        },
        removeOnComplete: {
            count: 100, // Keep last 100 completed
            age: 24 * 3600, // 24 hours
        },
        removeOnFail: {
            count: 500, // Keep last 500 failed
        },
    },
});

export class QueueService {
    static async addPodcastJob(data: PodcastJobData) {
        const job = await podcastQueue.add("generate-podcast", data, {
            priority: 1,
        });

        return {
            jobId: job.id!,
            job,
        };
    }

    static async getJob(jobId: string) {
        return await Job.fromId(podcastQueue, jobId);
    }

    static async getJobStatus(jobId: string) {
        const job = await this.getJob(jobId);
        if (!job) return null;

        const state = await job.getState();
        return {
            id: job.id,
            status: state,
            progress: job.progress,
            data: job.data,
            returnvalue: job.returnvalue,
            failedReason: job.failedReason,
        };
    }

    static async cancelJob(jobId: string) {
        const job = await this.getJob(jobId);
        if (job) {
            await job.remove();
        }
    }

    static async retryJob(jobId: string) {
        const job = await this.getJob(jobId);
        if (job) {
            await job.retry();
        }
    }

    static async getQueueStats() {
        const counts = await podcastQueue.getJobCounts();
        return counts;
    }
}

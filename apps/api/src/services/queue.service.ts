import { Queue, Worker, Job } from "bullmq";
import { redis } from "@repo/redis";

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

// Get connection config from Redis instance
const connectionConfig = {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
    db: redis.options.db,
};

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

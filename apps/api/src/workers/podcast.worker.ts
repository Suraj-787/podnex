import { Worker, Job } from "bullmq";
import { prisma } from "@repo/database";
import type { PodcastJobData } from "../services/queue.service.js";
import { SubscriptionService } from "../services/subscription.service.js";
import { ScriptGeneratorService } from "../services/script-generator.service.js";
import { AudioGeneratorService } from "../services/audio-generator.service.js";
import { AudioCombinerService } from "../services/audio-combiner.service.js";
import { StorageService } from "../services/storage.service.js";
import { WebhookService } from "../services/webhook.service.js";

// Prevent Redis/BullMQ errors from crashing the entire process
process.on("unhandledRejection", (reason) => {
    console.error("⚠️  Unhandled promise rejection (worker):", reason);
});

async function processPodcastJob(job: Job<PodcastJobData>) {
    const { podcastId, userId, noteContent, duration, hostVoice, guestVoice, ttsProvider } = job.data;

    try {
        console.log(`🎙️  Processing podcast ${podcastId}`);

        // Update status to processing
        await updateProgress(podcastId, 0, "PROCESSING", "Starting generation");

        // Trigger webhook: podcast.processing
        await WebhookService.sendEvent(userId, "PODCAST_PROCESSING", {
            podcastId,
            status: "PROCESSING",
            progress: 0,
            timestamp: new Date().toISOString(),
        }).catch(err => console.error("Webhook error:", err));

        // Step 1: Generate script (0-25%)
        await job.updateProgress(10);
        await updateProgress(podcastId, 10, "PROCESSING", "Generating script");
        const script = await ScriptGeneratorService.generate(noteContent, duration, { hostVoice, guestVoice });

        await job.updateProgress(25);
        await updateProgress(podcastId, 25, "PROCESSING", "Script generated");

        // Step 2: Generate audio (25-70%)
        await job.updateProgress(30);
        await updateProgress(podcastId, 30, "PROCESSING", "Generating audio");
        const audioSegments = await AudioGeneratorService.generateAll(
            script.segments,
            { hostVoice, guestVoice, ttsProvider }
        );

        await job.updateProgress(70);
        await updateProgress(podcastId, 70, "PROCESSING", "Audio generated");

        // Step 3: Combine audio (70-85%)
        await job.updateProgress(75);
        await updateProgress(podcastId, 75, "PROCESSING", "Combining audio");
        const finalAudio = await AudioCombinerService.combine(audioSegments);

        await job.updateProgress(85);
        await updateProgress(podcastId, 85, "PROCESSING", "Audio combined");

        // Step 4: Upload to S3 (85-95%) with local fallback
        await job.updateProgress(90);
        await updateProgress(podcastId, 90, "PROCESSING", "Uploading");

        let audioUrl: string;
        try {
            audioUrl = await StorageService.uploadAudio(
                finalAudio.buffer,
                podcastId,
                {
                    duration: finalAudio.duration.toString(),
                    size: finalAudio.size.toString(),
                    userId: userId,
                }
            );
        } catch (error) {
            // Fallback to local storage if S3 fails
            console.warn(`⚠️  S3 upload failed, saving locally: ${error}`);
            const fs = await import('fs/promises');
            const path = await import('path');
            const publicDir = path.join(process.cwd(), 'public', 'podcasts');
            await fs.mkdir(publicDir, { recursive: true });
            const localPath = path.join(publicDir, `${podcastId}.mp3`);
            await fs.writeFile(localPath, finalAudio.buffer);
            audioUrl = `/podcasts/${podcastId}.mp3`;
            console.log(`✅ Audio saved locally: ${localPath}`);
        }

        await job.updateProgress(95);

        // Step 5: Update database (95-100%)
        const audioDuration = Math.floor(finalAudio.duration / 60); // Convert to minutes

        await prisma.podcast.update({
            where: { id: podcastId },
            data: {
                status: "COMPLETED",
                progress: 100,
                currentStep: "Completed",
                audioUrl,
                audioDuration,
                transcript: script.segments as any,
                completedAt: new Date(),
            },
        });

        // Track usage
        await SubscriptionService.trackUsage(userId, audioDuration, podcastId);

        // Update job status
        await prisma.podcastJob.updateMany({
            where: { podcastId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
            },
        });

        console.log(`✅ Podcast ${podcastId} completed`);

        // Trigger webhook: podcast.completed
        await WebhookService.sendEvent(userId, "PODCAST_COMPLETED", {
            podcastId,
            status: "COMPLETED",
            audioUrl,
            audioDuration,
            timestamp: new Date().toISOString(),
        }).catch(err => console.error("Webhook error:", err));

        return { success: true, audioUrl };
    } catch (error: any) {
        console.error(`❌ Podcast ${podcastId} failed:`, error);

        // Update podcast status to failed
        await prisma.podcast.update({
            where: { id: podcastId },
            data: {
                status: "FAILED",
                error: error.message,
            },
        });

        // Update job status
        await prisma.podcastJob.updateMany({
            where: { podcastId },
            data: {
                status: "FAILED",
                error: error.message,
                stackTrace: error.stack,
            },
        });

        // Trigger webhook: podcast.failed
        await WebhookService.sendEvent(userId, "PODCAST_FAILED", {
            podcastId,
            status: "FAILED",
            error: error.message,
            timestamp: new Date().toISOString(),
        }).catch(err => console.error("Webhook error:", err));

        throw error;
    }
}

async function updateProgress(
    podcastId: string,
    progress: number,
    status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED",
    currentStep: string
) {
    await prisma.podcast.update({
        where: { id: podcastId },
        data: { progress, status, currentStep },
    });
}


// Build BullMQ connection config from REDIS_URL, preserving TLS for rediss://
const rawUrl = process.env.REDIS_URL || "redis://localhost:6379";
let workerConnection: Record<string, unknown>;
try {
    const parsed = new URL(rawUrl);
    workerConnection = {
        host: parsed.hostname,
        port: parseInt(parsed.port || "6379"),
        password: parsed.password ? decodeURIComponent(parsed.password) : undefined,
        username: parsed.username ? decodeURIComponent(parsed.username) : undefined,
        tls: rawUrl.startsWith("rediss://") ? {} : undefined,
        maxRetriesPerRequest: null,  // Required for BullMQ
        enableReadyCheck: false,
        retryStrategy: (times: number) => times > 10 ? null : Math.min(times * 500, 30000),
    };
} catch {
    workerConnection = { host: "localhost", port: 6379, maxRetriesPerRequest: null };
}

// Create worker
export const podcastWorker = new Worker<PodcastJobData>(
    "podcast-generation",
    processPodcastJob,
    {
        connection: workerConnection,
        concurrency: 1,
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
    }
);

podcastWorker.on("completed", (job) => {
    console.log(`✅ Job ${job.id} completed`);
});

podcastWorker.on("failed", (job, err) => {
    console.error(`❌ Job ${job?.id} failed:`, err.message);
});

podcastWorker.on("error", (err) => {
    console.error("⚠️  Worker error:", err);
});

console.log("🔧 Podcast worker started");

import { Worker, Job } from "bullmq";
import { redis } from "@repo/redis";
import { prisma } from "@repo/database";
import type { PodcastJobData } from "../services/queue.service.js";
import { SubscriptionService } from "../services/subscription.service.js";
import { ScriptGeneratorService } from "../services/script-generator.service.js";
import { AudioGeneratorService } from "../services/audio-generator.service.js";
import { AudioCombinerService } from "../services/audio-combiner.service.js";
import { StorageService } from "../services/storage.service.js";

async function processPodcastJob(job: Job<PodcastJobData>) {
    const { podcastId, userId, noteContent, duration, hostVoice, guestVoice, ttsProvider } = job.data;

    try {
        console.log(`🎙️  Processing podcast ${podcastId}`);

        // Update status to processing
        await updateProgress(podcastId, 0, "PROCESSING", "Starting generation");

        // Step 1: Generate script (0-25%)
        await job.updateProgress(10);
        await updateProgress(podcastId, 10, "PROCESSING", "Generating script");
        const script = await ScriptGeneratorService.generate(noteContent, duration);

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


// Get connection config from Redis instance
const connectionConfig = {
    host: redis.options.host,
    port: redis.options.port,
    password: redis.options.password,
    db: redis.options.db,
};

// Create worker
export const podcastWorker = new Worker<PodcastJobData>(
    "podcast-generation",
    processPodcastJob,
    {
        connection: connectionConfig,
        concurrency: 5, // Process 5 jobs simultaneously
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

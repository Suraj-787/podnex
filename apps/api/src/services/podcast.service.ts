import { prisma } from "@repo/database";
import type { Prisma, PodcastStatus } from "@repo/database";
import { AppError } from "../middleware/error.middleware.js";
import { QueueService, type PodcastJobData } from "./queue.service.js";
import { SubscriptionService } from "./subscription.service.js";

export class PodcastService {
    static async create(userId: string, data: {
        noteContent: string;
        duration: "SHORT" | "LONG";
        title?: string;
        noteId?: string;
        hostVoice?: string;
        guestVoice?: string;
        ttsProvider?: string;
    }) {
        // Check subscription limits
        const limitCheck = await SubscriptionService.checkLimits(userId);
        if (!limitCheck.allowed) {
            throw new AppError(403, limitCheck.reason || "Subscription limit reached");
        }

        // Create podcast record
        const podcast = await prisma.podcast.create({
            data: {
                userId,
                noteContent: data.noteContent,
                duration: data.duration,
                title: data.title,
                noteId: data.noteId,
                hostVoice: data.hostVoice || "host",
                guestVoice: data.guestVoice || "guest",
                ttsProvider: data.ttsProvider || "unreal",
                status: "QUEUED",
                progress: 0,
            },
        });

        // Increment podcast count immediately
        await SubscriptionService.incrementPodcastCount(userId);

        // Add job to queue
        const jobData: PodcastJobData = {
            podcastId: podcast.id,
            userId,
            noteContent: data.noteContent,
            duration: data.duration,
            hostVoice: data.hostVoice || "host",
            guestVoice: data.guestVoice || "guest",
            ttsProvider: data.ttsProvider || "unreal",
        };

        const { jobId } = await QueueService.addPodcastJob(jobData);

        // Create or update job tracking record (upsert to handle duplicates)
        await prisma.podcastJob.upsert({
            where: { jobId },
            create: {
                jobId,
                podcastId: podcast.id,
                status: "QUEUED",
            },
            update: {
                status: "QUEUED",
                error: null,
                stackTrace: null,
            },
        });

        return {
            ...podcast,
            jobId,
        };
    }

    static async findById(podcastId: string, userId: string) {
        console.log(`🔍 Finding podcast: ${podcastId} for user: ${userId}`);

        const podcast = await prisma.podcast.findFirst({
            where: {
                id: podcastId,
                userId,
                deletedAt: null,
            },
            include: {
                jobs: {
                    orderBy: { createdAt: "desc" },
                    take: 1,
                },
            },
        });

        if (!podcast) {
            console.log(`❌ Podcast not found: ${podcastId} for user: ${userId}`);

            // Debug: Check if podcast exists without userId filter
            const anyPodcast = await prisma.podcast.findUnique({
                where: { id: podcastId },
            });

            if (anyPodcast) {
                console.log(`⚠️  Podcast exists but belongs to different user: ${anyPodcast.userId}`);
            } else {
                console.log(`⚠️  Podcast does not exist in database at all`);
            }

            throw new AppError(404, "Podcast not found");
        }

        console.log(`✅ Found podcast: ${podcast.id}, status: ${podcast.status}`);
        return podcast;
    }

    static async findByUser(
        userId: string,
        options: {
            page?: number;
            limit?: number;
            status?: PodcastStatus;
            sort?: "createdAt" | "updatedAt";
            order?: "asc" | "desc";
        } = {}
    ) {
        const {
            page = 1,
            limit = 20,
            status,
            sort = "createdAt",
            order = "desc",
        } = options;

        const skip = (page - 1) * limit;

        const where: Prisma.PodcastWhereInput = {
            userId,
            deletedAt: null,
            ...(status && { status }),
        };

        const [podcasts, total] = await Promise.all([
            prisma.podcast.findMany({
                where,
                skip,
                take: limit,
                orderBy: { [sort]: order },
                include: {
                    jobs: {
                        orderBy: { createdAt: "desc" },
                        take: 1,
                    },
                },
            }),
            prisma.podcast.count({ where }),
        ]);

        return {
            podcasts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    static async update(podcastId: string, userId: string, data: {
        title?: string;
        noteContent?: string;
    }) {
        const podcast = await this.findById(podcastId, userId);

        return await prisma.podcast.update({
            where: { id: podcast.id },
            data,
        });
    }

    static async delete(podcastId: string, userId: string) {
        const podcast = await this.findById(podcastId, userId);

        // Soft delete
        await prisma.podcast.update({
            where: { id: podcast.id },
            data: { deletedAt: new Date() },
        });

        // Cancel job if running
        const job = podcast.jobs[0];
        if (job && (job.status === "QUEUED" || job.status === "PROCESSING")) {
            await QueueService.cancelJob(job.jobId);
        }

        return { success: true };
    }

    static async getStatus(podcastId: string, userId: string) {
        const podcast = await this.findById(podcastId, userId);

        return {
            id: podcast.id,
            status: podcast.status,
            progress: podcast.progress,
            currentStep: podcast.currentStep,
            error: podcast.error,
            audioUrl: podcast.audioUrl,
            createdAt: podcast.createdAt,
            completedAt: podcast.completedAt,
        };
    }

    static async retry(podcastId: string, userId: string) {
        const podcast = await this.findById(podcastId, userId);

        if (podcast.status !== "FAILED") {
            throw new AppError(400, "Can only retry failed podcasts");
        }

        // Check limits again
        const limitCheck = await SubscriptionService.checkLimits(userId);
        if (!limitCheck.allowed) {
            throw new AppError(403, limitCheck.reason || "Subscription limit reached");
        }

        // Reset podcast status
        await prisma.podcast.update({
            where: { id: podcast.id },
            data: {
                status: "QUEUED",
                progress: 0,
                error: null,
                retryCount: { increment: 1 },
            },
        });

        // Re-add to queue
        const jobData: PodcastJobData = {
            podcastId: podcast.id,
            userId,
            noteContent: podcast.noteContent,
            duration: podcast.duration,
            hostVoice: podcast.hostVoice,
            guestVoice: podcast.guestVoice,
            ttsProvider: podcast.ttsProvider,
        };

        const { jobId } = await QueueService.addPodcastJob(jobData);

        await prisma.podcastJob.upsert({
            where: { jobId },
            create: {
                jobId,
                podcastId: podcast.id,
                status: "QUEUED",
            },
            update: {
                status: "QUEUED",
                error: null,
                stackTrace: null,
            },
        });

        return { success: true, jobId };
    }
}

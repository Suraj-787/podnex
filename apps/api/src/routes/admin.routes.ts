import { Router } from "express";
import { requireAuth, requireAdmin, type AuthRequest } from "../middleware/auth.middleware.js";
import { AnalyticsService } from "../services/analytics.service.js";
import { prisma } from "@repo/database";
import { QueueService } from "../services/queue.service.js";

const router = Router();

// All routes require admin access
router.use(requireAuth, requireAdmin);

// Get platform statistics
router.get("/stats", async (req: AuthRequest, res, next) => {
    try {
        const stats = await AnalyticsService.getPlatformStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

// List all users
router.get("/users", async (req: AuthRequest, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                take: limit,
                skip,
                orderBy: { createdAt: "desc" },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    subscription: {
                        select: {
                            plan: true,
                            status: true,
                            currentPodcastCount: true,
                            currentMinutesUsed: true,
                        },
                    },
                    _count: {
                        select: { podcasts: true },
                    },
                },
            }),
            prisma.user.count(),
        ]);

        res.json({
            success: true,
            data: users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get user details
router.get("/users/:id", async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id! },
            include: {
                subscription: true,
                podcasts: {
                    take: 10,
                    orderBy: { createdAt: "desc" },
                },
                _count: {
                    select: {
                        podcasts: true,
                        apiKeys: true,
                        webhooks: true,
                    },
                },
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// List all podcasts
router.get("/podcasts", async (req: AuthRequest, res, next) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [podcasts, total] = await Promise.all([
            prisma.podcast.findMany({
                where: { deletedAt: null },
                take: limit,
                skip,
                orderBy: { createdAt: "desc" },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
            }),
            prisma.podcast.count({ where: { deletedAt: null } }),
        ]);

        res.json({
            success: true,
            data: podcasts,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
});

// Get job queue stats
router.get("/jobs", async (req: AuthRequest, res, next) => {
    try {
        const stats = await QueueService.getQueueStats();
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

export default router;

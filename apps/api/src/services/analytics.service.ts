import { prisma } from "@repo/database";
import { AppError } from "../middleware/error.middleware.js";

export class AnalyticsService {
    /**
     * Get user statistics
     */
    static async getUserStats(userId: string) {
        const [
            totalPodcasts,
            completedPodcasts,
            failedPodcasts,
            subscription,
            totalMinutes,
        ] = await Promise.all([
            prisma.podcast.count({
                where: { userId, deletedAt: null },
            }),
            prisma.podcast.count({
                where: { userId, status: "COMPLETED", deletedAt: null },
            }),
            prisma.podcast.count({
                where: { userId, status: "FAILED", deletedAt: null },
            }),
            prisma.subscription.findUnique({
                where: { userId },
            }),
            prisma.podcast.aggregate({
                where: { userId, status: "COMPLETED", deletedAt: null },
                _sum: { audioDuration: true },
            }),
        ]);

        const successRate =
            totalPodcasts > 0 ? (completedPodcasts / totalPodcasts) * 100 : 0;

        return {
            totalPodcasts,
            completedPodcasts,
            failedPodcasts,
            processingPodcasts: totalPodcasts - completedPodcasts - failedPodcasts,
            successRate: Math.round(successRate * 10) / 10,
            totalMinutes: totalMinutes._sum.audioDuration || 0,
            subscription: {
                plan: subscription?.plan || "FREE",
                podcastsUsed: subscription?.currentPodcastCount || 0,
                podcastsLimit: subscription?.monthlyPodcastLimit || 0,
                minutesUsed: subscription?.currentMinutesUsed || 0,
                minutesLimit: subscription?.monthlyMinutesLimit || 0,
            },
        };
    }

    /**
     * Get usage timeline (daily/weekly/monthly)
     */
    static async getUsageTimeSeries(
        userId: string,
        range: "week" | "month" | "year" = "month"
    ) {
        const now = new Date();
        const startDate = new Date();

        switch (range) {
            case "week":
                startDate.setDate(now.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(now.getMonth() - 1);
                break;
            case "year":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        const podcasts = await prisma.podcast.findMany({
            where: {
                userId,
                createdAt: { gte: startDate },
                deletedAt: null,
            },
            select: {
                createdAt: true,
                audioDuration: true,
                status: true,
            },
            orderBy: { createdAt: "asc" },
        });

        // Group by date
        const timeline: Record<string, { podcasts: number; minutes: number }> = {};

        podcasts.forEach((podcast) => {
            const date = podcast.createdAt.toISOString().split("T")[0];
            if (!date) return;

            if (!timeline[date]) {
                timeline[date] = { podcasts: 0, minutes: 0 };
            }
            timeline[date]!.podcasts++;
            if (podcast.status === "COMPLETED" && podcast.audioDuration) {
                timeline[date]!.minutes += podcast.audioDuration;
            }
        });

        return Object.entries(timeline).map(([date, data]) => ({
            date,
            ...data,
        }));
    }

    /**
     * Get platform-wide statistics (admin only)
     */
    static async getPlatformStats() {
        const [
            totalUsers,
            totalPodcasts,
            completedPodcasts,
            activeSubscriptions,
            totalMinutes,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.podcast.count({ where: { deletedAt: null } }),
            prisma.podcast.count({ where: { status: "COMPLETED", deletedAt: null } }),
            prisma.subscription.count({ where: { status: "ACTIVE" } }),
            prisma.podcast.aggregate({
                where: { status: "COMPLETED", deletedAt: null },
                _sum: { audioDuration: true },
            }),
        ]);

        const subscriptionBreakdown = await prisma.subscription.groupBy({
            by: ["plan"],
            _count: true,
        });

        return {
            totalUsers,
            totalPodcasts,
            completedPodcasts,
            activeSubscriptions,
            totalMinutes: totalMinutes._sum.audioDuration || 0,
            subscriptionBreakdown: subscriptionBreakdown.map((item) => ({
                plan: item.plan,
                count: item._count,
            })),
        };
    }
}

import { apiFetch } from "./client";

// Analytics Types
export interface UserStats {
    totalPodcasts: number;
    completedPodcasts: number;
    failedPodcasts: number;
    processingPodcasts: number;
    successRate: number;
    totalMinutes: number;
    subscription: {
        plan: string;
        podcastsUsed: number;
        podcastsLimit: number;
        minutesUsed: number;
        minutesLimit: number;
    };
}

export interface UsageTimelineItem {
    date: string;
    podcasts: number;
    minutes: number;
}

// Analytics API Functions
export const analyticsApi = {
    getStats: async (): Promise<UserStats> => {
        const response = await apiFetch<{ success: boolean; data: UserStats }>("/api/v1/analytics/stats");
        return response.data;
    },

    getUsageTimeline: async (range: "week" | "month" | "year" = "month"): Promise<UsageTimelineItem[]> => {
        const response = await apiFetch<{ success: boolean; data: UsageTimelineItem[] }>(`/api/v1/analytics/usage-timeline?range=${range}`);
        return response.data;
    },
};

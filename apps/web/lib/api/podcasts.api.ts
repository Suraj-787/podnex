import { api } from "./client";
import type {
    Podcast,
    PodcastStatusResponse,
    CreatePodcastDto,
    UpdatePodcastDto,
    ListPodcastsParams,
    PaginatedResponse,
    PodcastStats,
    ApiResponse,
} from "../types";

export const podcastsApi = {
    /**
     * List podcasts with pagination and filters
     */
    list: async (params?: ListPodcastsParams) => {
        const response = await api.get<PaginatedResponse<Podcast>>("/api/v1/podcasts", {
            params: params as Record<string, string | number | boolean | undefined>,
        });
        return {
            podcasts: response.data || [],
            pagination: response.pagination,
        };
    },

    /**
     * Get a single podcast by ID
     */
    get: async (id: string) => {
        const response = await api.get<ApiResponse<Podcast>>(`/api/v1/podcasts/${id}`);
        return response.data;
    },

    /**
     * Create a new podcast
     */
    create: async (data: CreatePodcastDto) => {
        const response = await api.post<ApiResponse<Podcast>>("/api/v1/podcasts", data);
        return response.data;
    },

    /**
     * Update a podcast
     */
    update: async (id: string, data: UpdatePodcastDto) => {
        const response = await api.patch<ApiResponse<Podcast>>(
            `/api/v1/podcasts/${id}`,
            data
        );
        return response.data;
    },

    /**
     * Delete a podcast
     */
    delete: async (id: string) => {
        await api.delete(`/api/v1/podcasts/${id}`);
    },

    /**
     * Retry a failed podcast generation
     */
    retry: async (id: string) => {
        const response = await api.post<ApiResponse<Podcast>>(
            `/api/v1/podcasts/${id}/retry`
        );
        return response.data;
    },

    /**
     * Get podcast generation status
     */
    getStatus: async (id: string) => {
        const response = await api.get<ApiResponse<PodcastStatusResponse>>(
            `/api/v1/podcasts/${id}/status`
        );
        return response.data;
    },

    /**
     * Get podcast statistics
     */
    getStats: async () => {
        const response = await api.get<ApiResponse<PodcastStats>>("/api/v1/podcasts/stats");
        return response.data;
    },

    /**
     * Get download URL for a podcast
     */
    getDownloadUrl: async (id: string) => {
        const response = await api.get<ApiResponse<{ url: string }>>(
            `/api/v1/podcasts/${id}/download`
        );
        if (!response.data) {
            throw new Error("Download URL not available");
        }
        return response.data.url;
    },
};

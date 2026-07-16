import { useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient, type QueryClient } from "@tanstack/react-query";
import { podcastsApi } from "../api/podcasts.api";
import { userKeys } from "./useUser";
import type {
    Podcast,
    CreatePodcastDto,
    UpdatePodcastDto,
    ListPodcastsParams,
} from "../types";
import { toast } from "sonner";

// Query keys
export const podcastKeys = {
    all: ["podcasts"] as const,
    lists: () => [...podcastKeys.all, "list"] as const,
    list: (params?: ListPodcastsParams) => [...podcastKeys.lists(), params] as const,
    details: () => [...podcastKeys.all, "detail"] as const,
    detail: (id: string) => [...podcastKeys.details(), id] as const,
    stats: () => [...podcastKeys.all, "stats"] as const,
    status: (id: string) => [...podcastKeys.all, "status", id] as const,
};

const ACTIVE_STATUSES = new Set(["PROCESSING", "QUEUED"]);

/**
 * Podcast generation finishes asynchronously in the worker — nothing else in
 * the app ever tells React Query that usage/subscription/stats changed once
 * that happens (useCreatePodcast only invalidates at creation time, while
 * still QUEUED). Called from the three hooks below that already poll a
 * podcast's status, right when a transition into COMPLETED is observed.
 */
function invalidateUsageAndStats(queryClient: QueryClient) {
    queryClient.invalidateQueries({ queryKey: podcastKeys.stats() });
    queryClient.invalidateQueries({ queryKey: userKeys.usage() });
    queryClient.invalidateQueries({ queryKey: userKeys.subscription() });
}

/**
 * Hook to fetch list of podcasts with pagination and filters
 * Automatically refetches if any podcast is processing
 */
export function usePodcasts(params?: ListPodcastsParams) {
    const queryClient = useQueryClient();
    const activeIds = useRef<Set<string>>(new Set());

    const query = useQuery({
        queryKey: podcastKeys.list(params),
        queryFn: () => podcastsApi.list(params),
        // Auto-refresh every 3 seconds if there are processing podcasts
        refetchInterval: (query) => {
            const data = query.state.data;
            if (!data || !data.podcasts) return false;
            const hasProcessing = data.podcasts.some(
                (p) => p.status === "PROCESSING" || p.status === "QUEUED"
            );
            return hasProcessing ? 3000 : false;
        },
    });

    useEffect(() => {
        const podcasts = query.data?.podcasts;
        if (!podcasts) return;

        const stillActive = new Set<string>();
        let justCompleted = false;

        for (const p of podcasts) {
            if (ACTIVE_STATUSES.has(p.status)) {
                stillActive.add(p.id);
            } else if (p.status === "COMPLETED" && activeIds.current.has(p.id)) {
                justCompleted = true;
            }
        }

        activeIds.current = stillActive;
        if (justCompleted) invalidateUsageAndStats(queryClient);
    }, [query.data, queryClient]);

    return query;
}

/**
 * Hook to fetch a single podcast
 */
export function usePodcast(id: string) {
    const queryClient = useQueryClient();
    const wasActive = useRef(false);

    const query = useQuery({
        queryKey: podcastKeys.detail(id),
        queryFn: () => podcastsApi.get(id),
        enabled: !!id,
        // Auto-refresh every 2 seconds if processing
        refetchInterval: (query) => {
            const data = query.state.data;
            return data?.status === "PROCESSING" || data?.status === "QUEUED" ? 2000 : false;
        },
    });

    useEffect(() => {
        const status = query.data?.status;
        if (!status) return;

        if (ACTIVE_STATUSES.has(status)) {
            wasActive.current = true;
        } else if (status === "COMPLETED" && wasActive.current) {
            invalidateUsageAndStats(queryClient);
            wasActive.current = false;
        }
    }, [query.data?.status, queryClient]);

    return query;
}

/**
 * Hook to fetch podcast statistics
 */
export function usePodcastStats() {
    return useQuery({
        queryKey: podcastKeys.stats(),
        queryFn: () => podcastsApi.getStats(),
    });
}

/**
 * Hook to fetch podcast status (for real-time updates)
 */
export function usePodcastStatus(id: string, enabled = true) {
    const queryClient = useQueryClient();
    const wasActive = useRef(false);

    const query = useQuery({
        queryKey: podcastKeys.status(id),
        queryFn: () => podcastsApi.getStatus(id),
        enabled: enabled && !!id,
        refetchInterval: 2000, // Poll every 2 seconds
    });

    useEffect(() => {
        const status = query.data?.status;
        if (!status) return;

        if (ACTIVE_STATUSES.has(status)) {
            wasActive.current = true;
        } else if (status === "COMPLETED" && wasActive.current) {
            invalidateUsageAndStats(queryClient);
            wasActive.current = false;
        }
    }, [query.data?.status, queryClient]);

    return query;
}

/**
 * Hook to create a new podcast
 */
export function useCreatePodcast() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreatePodcastDto) => podcastsApi.create(data),
        onSuccess: (newPodcast) => {
            // Invalidate and refetch podcasts list
            queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
            queryClient.invalidateQueries({ queryKey: podcastKeys.stats() });
            toast.success("Podcast created! Generation started.");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to create podcast");
        },
    });
}

/**
 * Hook to update a podcast
 */
export function useUpdatePodcast() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePodcastDto }) =>
            podcastsApi.update(id, data),
        onSuccess: (updatedPodcast) => {
            if (!updatedPodcast) return;
            // Update the podcast in the cache
            queryClient.setQueryData(
                podcastKeys.detail(updatedPodcast.id),
                updatedPodcast
            );
            // Invalidate lists to reflect changes
            queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
            toast.success("Podcast updated");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to update podcast");
        },
    });
}

/**
 * Hook to delete a podcast
 */
export function useDeletePodcast() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => podcastsApi.delete(id),
        onSuccess: (_, deletedId) => {
            // Remove from cache
            queryClient.removeQueries({ queryKey: podcastKeys.detail(deletedId) });
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
            queryClient.invalidateQueries({ queryKey: podcastKeys.stats() });
            toast.success("Podcast deleted");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to delete podcast");
        },
    });
}

/**
 * Hook to retry a failed podcast
 */
export function useRetryPodcast() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => podcastsApi.retry(id),
        onSuccess: (retriedPodcast) => {
            if (!retriedPodcast) return;
            // Update the podcast in the cache
            queryClient.setQueryData(
                podcastKeys.detail(retriedPodcast.id),
                retriedPodcast
            );
            // Invalidate lists
            queryClient.invalidateQueries({ queryKey: podcastKeys.lists() });
            toast.success("Podcast retry started");
        },
        onError: (error: Error) => {
            toast.error(error.message || "Failed to retry podcast");
        },
    });
}

/**
 * Hook to get download URL for a podcast
 */
export function usePodcastDownloadUrl(id: string) {
    return useQuery({
        queryKey: [...podcastKeys.detail(id), "download"],
        queryFn: () => podcastsApi.getDownloadUrl(id),
        enabled: false, // Only fetch when explicitly called
        staleTime: 5 * 60 * 1000, // 5 minutes (signed URLs usually expire)
    });
}

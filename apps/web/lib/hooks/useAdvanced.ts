import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiKeysApi, webhooksApi, analyticsApi } from "../api";
import type { CreateApiKeyData, CreateWebhookData, UpdateWebhookData } from "../api";
import { toast } from "sonner";

// ============================================================================
// API KEYS HOOKS
// ============================================================================

export function useApiKeys() {
    return useQuery({
        queryKey: ["apiKeys"],
        queryFn: apiKeysApi.list,
    });
}

export function useCreateApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateApiKeyData) => apiKeysApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
            toast.success("API key created successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create API key");
        },
    });
}

export function useUpdateApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { name?: string; scopes?: string[] } }) =>
            apiKeysApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
            toast.success("API key updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update API key");
        },
    });
}

export function useRevokeApiKey() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => apiKeysApi.revoke(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["apiKeys"] });
            toast.success("API key revoked successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to revoke API key");
        },
    });
}

// ============================================================================
// WEBHOOKS HOOKS
// ============================================================================

export function useWebhooks() {
    return useQuery({
        queryKey: ["webhooks"],
        queryFn: webhooksApi.list,
    });
}

export function useWebhook(id: string) {
    return useQuery({
        queryKey: ["webhooks", id],
        queryFn: () => webhooksApi.get(id),
        enabled: !!id,
    });
}

export function useCreateWebhook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateWebhookData) => webhooksApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook created successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to create webhook");
        },
    });
}

export function useUpdateWebhook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateWebhookData }) =>
            webhooksApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook updated successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to update webhook");
        },
    });
}

export function useDeleteWebhook() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => webhooksApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["webhooks"] });
            toast.success("Webhook deleted successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to delete webhook");
        },
    });
}

export function useWebhookDeliveries(id: string, params?: { page?: number; limit?: number }) {
    return useQuery({
        queryKey: ["webhooks", id, "deliveries", params],
        queryFn: () => webhooksApi.getDeliveries(id, params),
        enabled: !!id,
    });
}

export function useSendTestWebhook() {
    return useMutation({
        mutationFn: (id: string) => webhooksApi.sendTest(id),
        onSuccess: () => {
            toast.success("Test event sent successfully");
        },
        onError: (error: any) => {
            toast.error(error.message || "Failed to send test event");
        },
    });
}

// ============================================================================
// ANALYTICS HOOKS
// ============================================================================

export function useAnalyticsStats() {
    return useQuery({
        queryKey: ["analytics", "stats"],
        queryFn: analyticsApi.getStats,
    });
}

export function useUsageTimeline(range: "week" | "month" | "year" = "month") {
    return useQuery({
        queryKey: ["analytics", "timeline", range],
        queryFn: () => analyticsApi.getUsageTimeline(range),
    });
}

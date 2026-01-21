import { apiFetch } from "./client";

// Webhook Types
export type WebhookEvent = "PODCAST_CREATED" | "PODCAST_PROCESSING" | "PODCAST_COMPLETED" | "PODCAST_FAILED";

export interface Webhook {
    id: string;
    url: string;
    secret?: string; // Only returned on creation
    events: WebhookEvent[];
    active: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        deliveries: number;
    };
}

export interface WebhookDelivery {
    id: string;
    event: WebhookEvent;
    payload: any;
    responseStatus: number | null;
    responseBody: string | null;
    success: boolean;
    error: string | null;
    createdAt: string;
}

export interface CreateWebhookData {
    url: string;
    events: WebhookEvent[];
}

export interface UpdateWebhookData {
    url?: string;
    events?: WebhookEvent[];
    active?: boolean;
}

// Webhook API Functions
export const webhooksApi = {
    list: async (): Promise<Webhook[]> => {
        const response = await apiFetch<{ success: boolean; data: Webhook[] }>("/api/v1/webhooks");
        return response.data;
    },

    create: async (data: CreateWebhookData): Promise<Webhook> => {
        const response = await apiFetch<{ success: boolean; data: Webhook }>("/api/v1/webhooks", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response.data;
    },

    get: async (id: string): Promise<Webhook> => {
        const response = await apiFetch<{ success: boolean; data: Webhook }>(`/api/v1/webhooks/${id}`);
        return response.data;
    },

    update: async (id: string, data: UpdateWebhookData): Promise<Webhook> => {
        const response = await apiFetch<{ success: boolean; data: Webhook }>(`/api/v1/webhooks/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return response.data;
    },

    delete: async (id: string): Promise<void> => {
        await apiFetch(`/api/v1/webhooks/${id}`, {
            method: "DELETE",
        });
    },

    getDeliveries: async (
        id: string,
        params?: { page?: number; limit?: number }
    ): Promise<{ deliveries: WebhookDelivery[]; pagination: any }> => {
        const queryParams = new URLSearchParams();
        if (params?.page) queryParams.append("page", params.page.toString());
        if (params?.limit) queryParams.append("limit", params.limit.toString());

        const response = await apiFetch<{
            success: boolean;
            deliveries: WebhookDelivery[];
            pagination: any;
        }>(
            `/api/v1/webhooks/${id}/deliveries?${queryParams.toString()}`
        );
        return {
            deliveries: response.deliveries,
            pagination: response.pagination,
        };
    },

    retryDelivery: async (webhookId: string, deliveryId: string): Promise<void> => {
        await apiFetch(`/api/v1/webhooks/${webhookId}/deliveries/${deliveryId}/retry`, {
            method: "POST",
        });
    },

    sendTest: async (id: string): Promise<void> => {
        await apiFetch(`/api/v1/webhooks/${id}/test`, {
            method: "POST",
        });
    },
};

import { apiFetch } from "./client";

// API Key Types
export interface ApiKey {
    id: string;
    name: string;
    prefix: string;
    scopes: string[];
    expiresAt: string | null;
    createdAt: string;
    lastUsedAt: string | null;
}

export interface CreateApiKeyData {
    name: string;
    scopes?: string[];
    expiresAt?: string;
}

export interface ApiKeyWithPlainKey extends ApiKey {
    key: string; // Only returned on creation
}

// API Key API Functions
export const apiKeysApi = {
    list: async (): Promise<ApiKey[]> => {
        const response = await apiFetch<{ success: boolean; data: ApiKey[] }>("/api/v1/api-keys");
        return response.data;
    },

    create: async (data: CreateApiKeyData): Promise<ApiKeyWithPlainKey> => {
        const response = await apiFetch<{ success: boolean; data: ApiKeyWithPlainKey }>("/api/v1/api-keys", {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response.data;
    },

    get: async (id: string): Promise<ApiKey> => {
        const response = await apiFetch<{ success: boolean; data: ApiKey }>(`/api/v1/api-keys/${id}`);
        return response.data;
    },

    update: async (id: string, data: { name?: string; scopes?: string[] }): Promise<ApiKey> => {
        const response = await apiFetch<{ success: boolean; data: ApiKey }>(`/api/v1/api-keys/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return response.data;
    },

    revoke: async (id: string): Promise<void> => {
        await apiFetch(`/api/v1/api-keys/${id}`, {
            method: "DELETE",
        });
    },
};

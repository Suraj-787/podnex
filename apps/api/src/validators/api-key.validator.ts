import { z } from "zod";

export const createApiKeySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    scopes: z
        .array(z.string())
        .optional()
        .default(["podcasts:read", "podcasts:write"]),
    expiresAt: z.string().datetime().optional().transform((val) => val ? new Date(val) : undefined),
});

export const updateApiKeySchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
    scopes: z.array(z.string()).optional(),
});

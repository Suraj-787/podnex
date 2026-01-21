import { z } from "zod";
import { WebhookEvent } from "@prisma/client";

export const createWebhookSchema = z.object({
    url: z.string().url("Invalid URL"),
    events: z.array(z.nativeEnum(WebhookEvent)).min(1, "At least one event required"),
});

export const updateWebhookSchema = z.object({
    url: z.string().url("Invalid URL").optional(),
    events: z.array(z.nativeEnum(WebhookEvent)).optional(),
    active: z.boolean().optional(),
});

export const getDeliveriesSchema = z.object({
    page: z.string().transform(Number).pipe(z.number().int().positive()).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional(),
});

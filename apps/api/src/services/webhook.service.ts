import { prisma } from "@repo/database";
import crypto from "crypto";
import { AppError } from "../middleware/error.middleware.js";
import type { WebhookEvent } from "@prisma/client";

export class WebhookService {
    /**
     * Generate a secure webhook secret
     */
    private static generateSecret(): string {
        return `whsec_${crypto.randomBytes(32).toString("hex")}`;
    }

    /**
     * Sign payload with HMAC-SHA256
     */
    static signPayload(payload: string, secret: string): string {
        return crypto
            .createHmac("sha256", secret)
            .update(payload)
            .digest("hex");
    }

    /**
     * Verify webhook signature
     */
    static verifySignature(
        payload: string,
        signature: string,
        secret: string
    ): boolean {
        const expectedSignature = this.signPayload(payload, secret);
        return crypto.timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        );
    }

    /**
     * Create a new webhook
     */
    static async create(
        userId: string,
        data: {
            url: string;
            events: WebhookEvent[];
        }
    ) {
        const secret = this.generateSecret();

        const webhook = await prisma.webhook.create({
            data: {
                userId,
                url: data.url,
                secret,
                events: data.events,
                active: true,
            },
            select: {
                id: true,
                url: true,
                secret: true,
                events: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return webhook;
    }

    /**
     * List user's webhooks
     */
    static async list(userId: string) {
        const webhooks = await prisma.webhook.findMany({
            where: { userId },
            select: {
                id: true,
                url: true,
                events: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { deliveries: true },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return webhooks;
    }

    /**
     * Get webhook by ID
     */
    static async findById(id: string, userId: string) {
        const webhook = await prisma.webhook.findFirst({
            where: { id, userId },
            select: {
                id: true,
                url: true,
                secret: true,
                events: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: { deliveries: true },
                },
            },
        });

        if (!webhook) {
            throw new AppError(404, "Webhook not found");
        }

        return webhook;
    }

    /**
     * Update webhook
     */
    static async update(
        id: string,
        userId: string,
        data: {
            url?: string;
            events?: WebhookEvent[];
            active?: boolean;
        }
    ) {
        // Verify ownership
        await this.findById(id, userId);

        const webhook = await prisma.webhook.update({
            where: { id },
            data: {
                url: data.url,
                events: data.events,
                active: data.active,
            },
            select: {
                id: true,
                url: true,
                events: true,
                active: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return webhook;
    }

    /**
     * Delete webhook
     */
    static async delete(id: string, userId: string) {
        // Verify ownership
        await this.findById(id, userId);

        await prisma.webhook.delete({
            where: { id },
        });

        return { success: true, message: "Webhook deleted" };
    }

    /**
     * Send event to all subscribed webhooks
     */
    static async sendEvent(
        userId: string,
        event: WebhookEvent,
        payload: any
    ) {
        const webhooks = await prisma.webhook.findMany({
            where: {
                userId,
                active: true,
                events: { has: event },
            },
        });

        const deliveryPromises = webhooks.map((webhook) =>
            this.deliverWebhook(webhook.id, webhook.url, webhook.secret, event, payload)
        );

        await Promise.allSettled(deliveryPromises);
    }

    /**
     * Deliver webhook to endpoint
     */
    private static async deliverWebhook(
        webhookId: string,
        url: string,
        secret: string,
        event: WebhookEvent,
        payload: any,
        attempt: number = 1
    ): Promise<void> {
        const payloadString = JSON.stringify(payload);
        const signature = this.signPayload(payloadString, secret);
        const timestamp = Date.now();

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-Webhook-Signature": signature,
                    "X-Webhook-Timestamp": timestamp.toString(),
                    "X-Webhook-Event": event,
                },
                body: payloadString,
            });

            const responseBody = await response.text();

            // Log delivery
            await prisma.webhookDelivery.create({
                data: {
                    webhookId,
                    event,
                    payload,
                    responseStatus: response.status,
                    responseBody: responseBody.substring(0, 1000), // Limit size
                    success: response.ok,
                    error: response.ok ? null : `HTTP ${response.status}`,
                },
            });

            // Retry on failure (max 3 attempts)
            if (!response.ok && attempt < 3) {
                const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.deliverWebhook(webhookId, url, secret, event, payload, attempt + 1);
            }
        } catch (error: any) {
            // Log failed delivery
            await prisma.webhookDelivery.create({
                data: {
                    webhookId,
                    event,
                    payload,
                    responseStatus: null,
                    responseBody: null,
                    success: false,
                    error: error.message,
                },
            });

            // Retry on network error (max 3 attempts)
            if (attempt < 3) {
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise((resolve) => setTimeout(resolve, delay));
                return this.deliverWebhook(webhookId, url, secret, event, payload, attempt + 1);
            }
        }
    }

    /**
     * Get webhook deliveries
     */
    static async getDeliveries(
        webhookId: string,
        userId: string,
        options: {
            page?: number;
            limit?: number;
        } = {}
    ) {
        // Verify ownership
        await this.findById(webhookId, userId);

        const page = options.page || 1;
        const limit = options.limit || 50;
        const skip = (page - 1) * limit;

        const [deliveries, total] = await Promise.all([
            prisma.webhookDelivery.findMany({
                where: { webhookId },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip,
                select: {
                    id: true,
                    event: true,
                    payload: true,
                    responseStatus: true,
                    responseBody: true,
                    success: true,
                    error: true,
                    createdAt: true,
                },
            }),
            prisma.webhookDelivery.count({
                where: { webhookId },
            }),
        ]);

        return {
            deliveries,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
     * Retry failed delivery
     */
    static async retryDelivery(deliveryId: string, userId: string) {
        const delivery = await prisma.webhookDelivery.findUnique({
            where: { id: deliveryId },
            include: {
                webhook: true,
            },
        });

        if (!delivery) {
            throw new AppError(404, "Delivery not found");
        }

        if (delivery.webhook.userId !== userId) {
            throw new AppError(403, "Unauthorized");
        }

        // Redeliver
        await this.deliverWebhook(
            delivery.webhookId,
            delivery.webhook.url,
            delivery.webhook.secret,
            delivery.event,
            delivery.payload
        );

        return { success: true, message: "Delivery retried" };
    }

    /**
     * Send test event
     */
    static async sendTestEvent(webhookId: string, userId: string) {
        const webhook = await this.findById(webhookId, userId);

        const testPayload = {
            event: "PODCAST_CREATED",
            data: {
                id: "test_podcast_id",
                title: "Test Podcast",
                status: "COMPLETED",
                createdAt: new Date().toISOString(),
            },
            timestamp: new Date().toISOString(),
        };

        await this.deliverWebhook(
            webhook.id,
            webhook.url,
            webhook.secret,
            "PODCAST_CREATED",
            testPayload
        );

        return { success: true, message: "Test event sent" };
    }
}

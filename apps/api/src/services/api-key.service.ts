import { prisma } from "@repo/database";
import crypto from "crypto";
import { AppError } from "../middleware/error.middleware.js";

export class ApiKeyService {
    /**
     * Generate a secure API key
     * Format: pk_live_<32_random_hex_chars>
     */
    private static generateKey(): { key: string; hash: string; preview: string } {
        const randomBytes = crypto.randomBytes(32);
        const key = `pk_live_${randomBytes.toString("hex")}`;
        const hash = crypto.createHash("sha256").update(key).digest("hex");
        const preview = `${key.substring(0, 15)}...${key.substring(key.length - 4)}`;

        return { key, hash, preview };
    }

    /**
     * Hash an API key for comparison
     */
    static hashKey(key: string): string {
        return crypto.createHash("sha256").update(key).digest("hex");
    }

    /**
     * Create a new API key
     */
    static async create(
        userId: string,
        data: {
            name: string;
            scopes?: string[];
            expiresAt?: Date;
        }
    ) {
        const { key, hash, preview } = this.generateKey();

        const apiKey = await prisma.apiKey.create({
            data: {
                userId,
                name: data.name,
                key: hash, // Store hashed key
                prefix: preview, // Store preview
                scopes: data.scopes || ["podcasts:read", "podcasts:write"],
                expiresAt: data.expiresAt,
            },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                expiresAt: true,
                createdAt: true,
                lastUsedAt: true,
            },
        });

        // Return the plain key only once
        return {
            ...apiKey,
            key, // Plain key - show only on creation
        };
    }

    /**
     * List user's API keys
     */
    static async list(userId: string) {
        const apiKeys = await prisma.apiKey.findMany({
            where: {
                userId,
                // Only show non-expired keys or keys without expiration
                OR: [
                    { expiresAt: null },
                    { expiresAt: { gt: new Date() } },
                ],
            },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                expiresAt: true,
                createdAt: true,
                lastUsedAt: true,
            },
            orderBy: { createdAt: "desc" },
        });

        return apiKeys;
    }

    /**
     * Get API key by ID
     */
    static async findById(id: string, userId: string) {
        const apiKey = await prisma.apiKey.findFirst({
            where: { id, userId },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                expiresAt: true,
                createdAt: true,
                lastUsedAt: true,
            },
        });

        if (!apiKey) {
            throw new AppError(404, "API key not found");
        }

        return apiKey;
    }

    /**
     * Update API key
     */
    static async update(
        id: string,
        userId: string,
        data: {
            name?: string;
            scopes?: string[];
        }
    ) {
        // Verify ownership
        await this.findById(id, userId);

        const apiKey = await prisma.apiKey.update({
            where: { id },
            data: {
                name: data.name,
                scopes: data.scopes,
            },
            select: {
                id: true,
                name: true,
                prefix: true,
                scopes: true,
                expiresAt: true,
                createdAt: true,
                lastUsedAt: true,
            },
        });

        return apiKey;
    }

    /**
     * Revoke (delete) API key
     */
    static async revoke(id: string, userId: string) {
        // Verify ownership
        await this.findById(id, userId);

        await prisma.apiKey.delete({
            where: { id },
        });

        return { success: true, message: "API key revoked" };
    }

    /**
     * Verify API key and return user
     * Used in auth middleware
     */
    static async verify(key: string) {
        const hash = this.hashKey(key);

        const apiKey = await prisma.apiKey.findUnique({
            where: { key: hash },
            include: { user: true },
        });

        if (!apiKey) {
            throw new AppError(401, "Invalid API key");
        }

        // Check if expired
        if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
            throw new AppError(401, "API key expired");
        }

        // Increment usage count and update last used
        await this.incrementUsage(apiKey.id);

        return {
            user: apiKey.user,
            scopes: apiKey.scopes,
        };
    }

    /**
     * Increment usage count
     */
    static async incrementUsage(keyId: string) {
        await prisma.apiKey.update({
            where: { id: keyId },
            data: {
                lastUsedAt: new Date(),
            },
        });
    }
}

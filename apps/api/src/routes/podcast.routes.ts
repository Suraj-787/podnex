import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";
import { checkSubscriptionLimits } from "../middleware/subscription.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { PodcastService } from "../services/podcast.service.js";
import { StorageService } from "../services/storage.service.js";
import { AppError } from "../middleware/error.middleware.js";
import {
    createPodcastSchema,
    updatePodcastSchema,
    listPodcastsSchema,
} from "../validators/podcast.validator.js";

const router = Router();

// Create podcast
router.post(
    "/",
    requireAuth,
    checkSubscriptionLimits,
    validate(createPodcastSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const podcast = await PodcastService.create(req.user!.id, req.body);
            res.status(201).json({ success: true, data: podcast });
        } catch (error) {
            next(error);
        }
    }
);

// List podcasts
router.get(
    "/",
    requireAuth,
    validate(listPodcastsSchema, "query"),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await PodcastService.findByUser(req.user!.id, req.query);
            res.json({ success: true, data: result.podcasts, pagination: result.pagination });
        } catch (error) {
            next(error);
        }
    }
);

// Get single podcast
router.get("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const podcast = await PodcastService.findById(req.params.id!, req.user!.id);
        res.json({ success: true, data: podcast });
    } catch (error) {
        next(error);
    }
});

// Update podcast
router.patch(
    "/:id",
    requireAuth,
    validate(updatePodcastSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const podcast = await PodcastService.update(
                req.params.id!,
                req.user!.id,
                req.body
            );
            res.json({ success: true, data: podcast });
        } catch (error) {
            next(error);
        }
    }
);

// Delete podcast
router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        await PodcastService.delete(req.params.id!, req.user!.id);
        res.json({ success: true, message: "Podcast deleted" });
    } catch (error) {
        next(error);
    }
});

// Get status
router.get("/:id/status", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const status = await PodcastService.getStatus(req.params.id!, req.user!.id);
        res.json({ success: true, data: status });
    } catch (error) {
        next(error);
    }
});

// Retry failed podcast
router.post("/:id/retry", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const result = await PodcastService.retry(req.params.id!, req.user!.id);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

// Download podcast
router.get("/:id/download", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const podcast = await PodcastService.findById(req.params.id!, req.user!.id);

        if (!podcast.audioUrl) {
            throw new AppError(404, "Audio not available yet");
        }

        const signedUrl = await StorageService.getSignedDownloadUrl(podcast.audioUrl);
        res.json({ success: true, data: { url: signedUrl } });
    } catch (error) {
        next(error);
    }
});

export default router;

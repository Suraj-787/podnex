import { Router } from "express";
import { requireAuth, requireSession, type AuthRequest } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { ApiKeyService } from "../services/api-key.service.js";
import { createApiKeySchema, updateApiKeySchema } from "../validators/api-key.validator.js";

const router = Router();

// Create API key
router.post(
    "/",
    requireAuth,
    requireSession,
    validate(createApiKeySchema),
    async (req: AuthRequest, res, next) => {
        try {
            const apiKey = await ApiKeyService.create(req.user!.id, req.body);
            res.status(201).json({
                success: true,
                data: apiKey,
                message: "API key created successfully. Save it now - you won't be able to see it again!",
            });
        } catch (error) {
            next(error);
        }
    }
);

// List API keys
router.get("/", requireAuth, requireSession, async (req: AuthRequest, res, next) => {
    try {
        const apiKeys = await ApiKeyService.list(req.user!.id);
        res.json({ success: true, data: apiKeys });
    } catch (error) {
        next(error);
    }
});

// Get single API key
router.get("/:id", requireAuth, requireSession, async (req: AuthRequest, res, next) => {
    try {
        const apiKey = await ApiKeyService.findById(req.params.id!, req.user!.id);
        res.json({ success: true, data: apiKey });
    } catch (error) {
        next(error);
    }
});

// Update API key
router.patch(
    "/:id",
    requireAuth,
    requireSession,
    validate(updateApiKeySchema),
    async (req: AuthRequest, res, next) => {
        try {
            const apiKey = await ApiKeyService.update(
                req.params.id!,
                req.user!.id,
                req.body
            );
            res.json({ success: true, data: apiKey });
        } catch (error) {
            next(error);
        }
    }
);

// Revoke (delete) API key
router.delete("/:id", requireAuth, requireSession, async (req: AuthRequest, res, next) => {
    try {
        const result = await ApiKeyService.revoke(req.params.id!, req.user!.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;

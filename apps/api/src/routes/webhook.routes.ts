import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validation.middleware.js";
import { WebhookService } from "../services/webhook.service.js";
import {
    createWebhookSchema,
    updateWebhookSchema,
    getDeliveriesSchema,
} from "../validators/webhook.validator.js";

const router = Router();

// Create webhook
router.post(
    "/",
    requireAuth,
    validate(createWebhookSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const webhook = await WebhookService.create(req.user!.id, req.body);
            res.status(201).json({
                success: true,
                data: webhook,
                message: "Webhook created successfully. Save the secret - you'll need it to verify signatures!",
            });
        } catch (error) {
            next(error);
        }
    }
);

// List webhooks
router.get("/", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const webhooks = await WebhookService.list(req.user!.id);
        res.json({ success: true, data: webhooks });
    } catch (error) {
        next(error);
    }
});

// Get single webhook
router.get("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const webhook = await WebhookService.findById(req.params.id!, req.user!.id);
        res.json({ success: true, data: webhook });
    } catch (error) {
        next(error);
    }
});

// Update webhook
router.patch(
    "/:id",
    requireAuth,
    validate(updateWebhookSchema),
    async (req: AuthRequest, res, next) => {
        try {
            const webhook = await WebhookService.update(
                req.params.id!,
                req.user!.id,
                req.body
            );
            res.json({ success: true, data: webhook });
        } catch (error) {
            next(error);
        }
    }
);

// Delete webhook
router.delete("/:id", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const result = await WebhookService.delete(req.params.id!, req.user!.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

// Get webhook deliveries
router.get(
    "/:id/deliveries",
    requireAuth,
    validate(getDeliveriesSchema, "query"),
    async (req: AuthRequest, res, next) => {
        try {
            const result = await WebhookService.getDeliveries(
                req.params.id!,
                req.user!.id,
                req.query
            );
            res.json({ success: true, ...result });
        } catch (error) {
            next(error);
        }
    }
);

// Retry delivery
router.post(
    "/:id/deliveries/:deliveryId/retry",
    requireAuth,
    async (req: AuthRequest, res, next) => {
        try {
            const result = await WebhookService.retryDelivery(
                req.params.deliveryId!,
                req.user!.id
            );
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
);

// Send test event
router.post("/:id/test", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const result = await WebhookService.sendTestEvent(req.params.id!, req.user!.id);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;

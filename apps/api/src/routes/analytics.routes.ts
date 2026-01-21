import { Router } from "express";
import { requireAuth, type AuthRequest } from "../middleware/auth.middleware.js";
import { AnalyticsService } from "../services/analytics.service.js";

const router = Router();

// Get user statistics
router.get("/stats", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const stats = await AnalyticsService.getUserStats(req.user!.id);
        res.json({ success: true, data: stats });
    } catch (error) {
        next(error);
    }
});

// Get usage timeline
router.get("/usage-timeline", requireAuth, async (req: AuthRequest, res, next) => {
    try {
        const range = (req.query.range as "week" | "month" | "year") || "month";
        const timeline = await AnalyticsService.getUsageTimeSeries(req.user!.id, range);
        res.json({ success: true, data: timeline });
    } catch (error) {
        next(error);
    }
});

export default router;

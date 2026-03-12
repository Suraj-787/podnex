/**
 * Express app factory — separated from server startup so tests can
 * import the app without starting the HTTP server or background workers.
 */
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { errorHandler, notFound } from "./middleware/index.js";
import userRoutes from "./routes/user.routes.js";
import podcastRoutes from "./routes/podcast.routes.js";
import billingRoutes from "./routes/billing.routes.js";
import apiKeyRoutes from "./routes/api-key.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import analyticsRoutes from "./routes/analytics.routes.js";
import adminRoutes from "./routes/admin.routes.js";

export function createApp() {
  const app = express();

  // Security & Performance Middleware
  app.use(helmet());
  app.use(compression());

  // CORS
  const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
      },
      credentials: true,
    })
  );

  // Better Auth handler — MUST come before express.json()
  app.all("/api/auth/*", toNodeHandler(auth));

  // Body parsing (after Better Auth)
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, message: "API is running", timestamp: new Date().toISOString() });
  });

  // Routes
  app.use("/api/v1/user", userRoutes);
  app.use("/api/v1/podcasts", podcastRoutes);
  app.use("/api/v1/billing", billingRoutes);
  app.use("/api/v1/api-keys", apiKeyRoutes);
  app.use("/api/v1/webhooks", webhookRoutes);
  app.use("/api/v1/analytics", analyticsRoutes);
  app.use("/api/v1/admin", adminRoutes);

  // Error handlers (must be last)
  app.use(notFound);
  app.use(errorHandler);

  return app;
}

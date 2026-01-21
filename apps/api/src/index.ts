import "./lib/env.js"; // Load environment variables FIRST
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
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from apps/api directory FIRST
dotenv.config({ path: join(__dirname, "../.env") });

// Debug: Log environment variable loading
console.log("🔧 Environment variables loaded:");
console.log(`   AWS_ACCESS_KEY_ID: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set' : '❌ Missing'}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   AWS_REGION: ${process.env.AWS_REGION || 'us-east-1 (default)'}`);
console.log(`   S3_BUCKET_NAME: ${process.env.S3_BUCKET_NAME || 'podnext-audio-storage (default)'}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? '✅ Set' : '❌ Missing'}\n`);

// Import worker AFTER env vars are loaded
import "./workers/podcast.worker.js";

const app = express();
const PORT = process.env.PORT || 3001;

// Security & Performance Middleware
app.use(helmet());
app.use(compression());

// CORS - MUST come before Better Auth handler
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Better Auth handler - MUST come before express.json()
app.all("/api/auth/*", toNodeHandler(auth));

// Body parsing (after Better Auth)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

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

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📝 Auth endpoint: http://localhost:${PORT}/api/auth`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

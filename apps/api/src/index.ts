import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import { errorHandler, notFound } from "./middleware/index.js";
import userRoutes from "./routes/user.routes.js";
import podcastRoutes from "./routes/podcast.routes.js";
import dotenv from "dotenv";
import "./workers/podcast.worker.js"; // Start worker

dotenv.config();

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

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  console.log(`📝 Auth endpoint: http://localhost:${PORT}/api/auth`);
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

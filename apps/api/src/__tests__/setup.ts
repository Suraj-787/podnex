/**
 * Global test setup — runs before every test file.
 * Mocks external dependencies so tests are fast and isolated.
 *
 * NOTE: vi.mock("../lib/auth.js") is NOT here — it must be declared
 * at the top of each test file because vi.mock paths are resolved
 * relative to the file that calls vi.mock().
 */
import { vi, afterEach } from "vitest";

// ─── Environment Variables ────────────────────────────────────────────────────
process.env["NODE_ENV"] = "test";
process.env["FRONTEND_URL"] = "http://localhost:3000";
process.env["BETTER_AUTH_URL"] = "http://localhost:3001";
process.env["BETTER_AUTH_SECRET"] = "test-secret-for-unit-tests-only-32c";
process.env["DATABASE_URL"] = "postgresql://test:test@localhost:5432/test";
process.env["REDIS_URL"] = "redis://localhost:6379";

// ─── Mock: @repo/database (Prisma) ───────────────────────────────────────────
//  All Prisma methods return undefined by default; individual tests override as needed.
vi.mock("@repo/database", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    session: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    podcast: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
      aggregate: vi.fn(),
    },
    podcastJob: {
      upsert: vi.fn(),
      findFirst: vi.fn(),
    },
    subscription: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    apiKey: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    webhook: {
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    webhookDelivery: { create: vi.fn() },
    $transaction: vi.fn((fn: (prisma: unknown) => unknown) =>
      fn({
        subscription: { update: vi.fn() },
        podcast: { updateMany: vi.fn() },
      })
    ),
  },
  PodcastStatus: {
    QUEUED: "QUEUED",
    PROCESSING: "PROCESSING",
    COMPLETED: "COMPLETED",
    FAILED: "FAILED",
  },
}));

// ─── Mock: @repo/redis ────────────────────────────────────────────────────────
vi.mock("@repo/redis", () => ({
  redis: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    on: vi.fn(),
  },
  default: {
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
    on: vi.fn(),
  },
}));

// ─── Mock: bullmq Queue (Queue is only used in QueueService) ─────────────────
vi.mock("bullmq", () => ({
  Queue: vi.fn().mockImplementation(() => ({
    add: vi.fn().mockResolvedValue({ id: "test-job-id" }),
    getJobCounts: vi.fn().mockResolvedValue({}),
  })),
  Worker: vi.fn().mockImplementation(() => ({
    on: vi.fn(),
  })),
  Job: {
    fromId: vi.fn().mockResolvedValue(null),
  },
}));

afterEach(() => {
  vi.clearAllMocks();
});

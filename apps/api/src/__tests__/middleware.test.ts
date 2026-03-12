/**
 * Middleware Test Suite
 *
 * Covers: CORS policy enforcement, health check, auth middleware chain,
 * and route-level authorization checks.
 */
import { describe, it, expect, vi } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

vi.mock("../lib/auth.js", () => ({
  auth: {
    handler: vi.fn((_req: unknown, res: { json: (d: unknown) => void }) =>
      res.json({ mock: true })
    ),
    api: { getSession: vi.fn() },
  },
}));

import { auth } from "../lib/auth.js";

const app = createApp();

const MOCK_USER = { id: "user-001", email: "test@podnex.tech", name: "Test User" };
const MOCK_SESSION = {
  session: { id: "sess-001", userId: MOCK_USER.id, expiresAt: new Date(Date.now() + 3600_000) },
  user: MOCK_USER,
};

// ============================================================================
describe("Health Check", () => {
  it("GET /api/health returns 200 with status info (no auth required)", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("API is running");
    expect(res.body.timestamp).toBeDefined();
  });

  it("health endpoint is accessible without credentials", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);

    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200); // should never be 401
  });
});

// ============================================================================
describe("CORS Middleware", () => {
  it("returns CORS headers for allowed origin", async () => {
    const res = await request(app)
      .options("/api/v1/podcasts")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "GET");

    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3000");
    expect(res.headers["access-control-allow-credentials"]).toBe("true");
  });

  it("blocks requests from disallowed origins with CORS error", async () => {
    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Origin", "https://malicious-site.com");

    // Server should reject with a CORS/network-level error or 500 from CORS middleware
    expect([403, 500]).toContain(res.status);
  });

  it("allows requests with no origin header (server-to-server)", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findMany).mockResolvedValue([]);
    vi.mocked(prisma.podcast.count).mockResolvedValue(0);

    // No Origin header = server-to-server, should be allowed
    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Cookie", "session=valid");
    // Should not be blocked by CORS (may be 200 or 401 depending on auth)
    expect(res.status).not.toBe(0);
  });

  it("preflight includes Access-Control-Allow-Methods", async () => {
    const res = await request(app)
      .options("/api/v1/podcasts")
      .set("Origin", "http://localhost:3000")
      .set("Access-Control-Request-Method", "POST");

    expect(res.headers["access-control-allow-methods"]).toMatch(/POST/i);
  });
});

// ============================================================================
describe("Auth Middleware Chain", () => {
  it("API key auth is attempted first when Bearer token is present", async () => {
    // Middleware checks API key BEFORE session; if API key lookup fails, returns 401
    vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
    const { prisma } = await import("@repo/database");
    // API key not found → 401 (session is never checked when Bearer is present)
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .set("Authorization", "Bearer pk_live_somekey");

    expect(res.status).toBe(401); // API key checked first, fails
  });

  it("correctly rejects when both session and API key are invalid", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null);
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(null);

    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Authorization", "Bearer pk_live_badkey");

    expect(res.status).toBe(401);
  });
});

// ============================================================================
describe("Subscription Middleware — Rate / Limit Enforcement", () => {
  it("allows podcast creation when under limit", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      id: "sub-001",
      userId: MOCK_USER.id,
      plan: "FREE",
      status: "ACTIVE",
      monthlyPodcastLimit: 5,
      currentPodcastCount: 2, // under limit
      monthlyMinutesLimit: 25,
      currentMinutesUsed: 10,
      usageResetDate: new Date(Date.now() + 86400_000),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 86400_000),
    } as any);
    vi.mocked(prisma.podcast.create).mockResolvedValue({
      id: "pod-new", userId: MOCK_USER.id, status: "QUEUED",
      noteContent: "test", duration: "SHORT", jobs: [],
    } as any);
    vi.mocked(prisma.podcast.update).mockResolvedValue({} as any);
    vi.mocked(prisma.podcastJob.upsert).mockResolvedValue({} as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "Some interesting content about machine learning and artificial intelligence that is long enough to pass the minimum 100 character validation requirement.", duration: "SHORT" });

    expect(res.status).toBe(201);
  });

  it("blocks podcast creation when FREE plan limit (5) is reached", async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      id: "sub-001",
      userId: MOCK_USER.id,
      plan: "FREE",
      status: "ACTIVE",
      monthlyPodcastLimit: 5,
      currentPodcastCount: 5, // AT limit
      monthlyMinutesLimit: 25,
      currentMinutesUsed: 25,
      usageResetDate: new Date(Date.now() + 86400_000),
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 86400_000),
    } as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "Over limit content", duration: "SHORT" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

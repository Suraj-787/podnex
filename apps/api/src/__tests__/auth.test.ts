/**
 * Auth Flow Test Suite
 *
 * Covers: session validation on protected routes, unauthenticated
 * access rejection, and the session header forwarding contract.
 *
 * Strategy: mock `auth.api.getSession` to simulate authenticated /
 * unauthenticated states without a real database or auth server.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";

// vi.mock is hoisted — this runs before any import, providing the mock
vi.mock("../lib/auth.js", () => ({
  auth: {
    handler: vi.fn((_req: unknown, res: { json: (d: unknown) => void }) =>
      res.json({ mock: true })
    ),
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { auth } from "../lib/auth.js";

const app = createApp();

// ─── Shared test fixtures ────────────────────────────────────────────────────
const MOCK_USER = {
  id: "user-001",
  email: "test@podnex.tech",
  name: "Test User",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const MOCK_SESSION = {
  session: { id: "session-001", userId: MOCK_USER.id, expiresAt: new Date(Date.now() + 3600_000) },
  user: MOCK_USER,
};

// ─── Helper: simulate an authenticated request ───────────────────────────────
function asAuthenticated() {
  vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
}

function asUnauthenticated() {
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
}

// ============================================================================
describe("Auth — Session Validation on Protected Routes", () => {
  // ── GET /api/v1/podcasts (protected route) ──────────────────────────────
  describe("GET /api/v1/podcasts", () => {
    it("returns 200 and podcast list when session is valid", async () => {
      asAuthenticated();

      // Mock Prisma to return empty list
      const { prisma } = await import("@repo/database");
      vi.mocked(prisma.podcast.findMany).mockResolvedValue([]);
      vi.mocked(prisma.podcast.count).mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/podcasts")
        .set("Cookie", "session=valid-session-token");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("returns 401 when no session cookie is provided", async () => {
      asUnauthenticated();

      const res = await request(app).get("/api/v1/podcasts");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toBeDefined();
    });

    it("returns 401 when session token is invalid", async () => {
      vi.mocked(auth.api.getSession).mockRejectedValue(new Error("Invalid token"));

      const res = await request(app)
        .get("/api/v1/podcasts")
        .set("Cookie", "session=invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("returns 401 when session is expired", async () => {
      vi.mocked(auth.api.getSession).mockResolvedValue({
        session: {
          id: "session-expired",
          userId: MOCK_USER.id,
          expiresAt: new Date(Date.now() - 1000), // already expired
        },
        user: null,
      } as any);

      const res = await request(app)
        .get("/api/v1/podcasts")
        .set("Cookie", "session=expired-token");

      expect(res.status).toBe(401);
    });
  });

  // ── User info route ─────────────────────────────────────────────────────
  describe("GET /api/v1/user/profile", () => {
    it("returns user data for authenticated request", async () => {
      asAuthenticated();

      const { prisma } = await import("@repo/database");
      vi.mocked(prisma.user.findUnique).mockResolvedValue(MOCK_USER as any);

      const res = await request(app)
        .get("/api/v1/user/profile")
        .set("Cookie", "session=valid-session-token");

      // User route should either 200 or redirect — should NOT be 401
      expect(res.status).not.toBe(401);
    });

    it("returns 401 for unauthenticated request", async () => {
      asUnauthenticated();

      const res = await request(app).get("/api/v1/user/profile");

      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ success: false });
    });
  });

  // ── Bearer token (API key auth) ─────────────────────────────────────────
  describe("API Key Authentication via Authorization header", () => {
    it("returns 401 for malformed Authorization header (no Bearer)", async () => {
      asUnauthenticated();

      const res = await request(app)
        .get("/api/v1/podcasts")
        .set("Authorization", "Basic bad-format");

      expect(res.status).toBe(401);
    });

    it("returns 401 for well-formed but invalid API key", async () => {
      asUnauthenticated();
      const { prisma } = await import("@repo/database");
      vi.mocked(prisma.apiKey.findFirst).mockResolvedValue(null);

      const res = await request(app)
        .get("/api/v1/podcasts")
        .set("Authorization", "Bearer pk_live_invalidkeyvalue12345");

      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/Invalid or expired API key/i);
    });

    it("accepts request with valid API key (pk_live_ prefix)", async () => {
      // Mock a valid API key lookup
      const { prisma } = await import("@repo/database");
      vi.mocked(prisma.apiKey.findFirst).mockResolvedValue({
        id: "key-001",
        userId: MOCK_USER.id,
        key: "hashed-key",
        expiresAt: null,
        lastUsedAt: null,
        user: MOCK_USER,
      } as any);
      vi.mocked(prisma.apiKey.update).mockResolvedValue({} as any);
      vi.mocked(prisma.podcast.findMany).mockResolvedValue([]);
      vi.mocked(prisma.podcast.count).mockResolvedValue(0);

      const res = await request(app)
        .get("/api/v1/podcasts")
        .set("Authorization", "Bearer pk_live_validkey12345678");

      expect(res.status).toBe(200);
    });
  });
});

// ============================================================================
describe("Auth — Response Envelope Contract", () => {
  it("all 401 responses follow { success: false, error: string } envelope", async () => {
    asUnauthenticated();

    const protectedRoutes = [
      { method: "GET", path: "/api/v1/podcasts" },
      { method: "GET", path: "/api/v1/user/profile" },
      { method: "GET", path: "/api/v1/api-keys" },
    ];

    for (const route of protectedRoutes) {
      const res = await (request(app) as any)[route.method.toLowerCase()](route.path);
      expect(res.status, `${route.method} ${route.path} should be 401`).toBe(401);
      expect(res.body.success, `${route.method} ${route.path} should have success:false`).toBe(false);
      expect(res.body.error, `${route.method} ${route.path} should have error message`).toBeDefined();
    }
  });
});

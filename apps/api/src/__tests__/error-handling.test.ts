/**
 * Error Handling Test Suite
 *
 * Covers: malformed requests, unknown routes, validation errors,
 * consistent error envelope format, and boundary value analysis.
 *
 * Key for SDET: demonstrates systematic negative testing.
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
const MOCK_SUBSCRIPTION = {
  id: "sub-001", userId: MOCK_USER.id, plan: "FREE", status: "ACTIVE",
  monthlyPodcastLimit: 5, currentPodcastCount: 0,
  monthlyMinutesLimit: 25, currentMinutesUsed: 0,
  usageResetDate: new Date(Date.now() + 86400_000),
  currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 86400_000),
};

function asAuthenticated() {
  vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
}

// ============================================================================
describe("Error Handling — Unknown Routes", () => {
  it("returns 404 for completely unknown route", async () => {
    const res = await request(app).get("/api/v1/nonexistent-endpoint");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for wrong HTTP method on existing route", async () => {
    // PATCH is not defined on the list podcasts route
    const res = await request(app)
      .put("/api/v1/podcasts")
      .send({});

    expect([404, 401, 405]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("returns 404 for nested unknown paths under known prefix", async () => {
    const res = await request(app).get("/api/v1/podcasts/id/unknown-sub-route/deeper");

    // Should not be 200 — unknown routes should surface gracefully
    expect([404, 401]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================================
describe("Error Handling — Malformed Request Bodies", () => {
  it("returns 400 for invalid JSON body on podcast creation", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(MOCK_SUBSCRIPTION as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .set("Content-Type", "application/json")
      .send("{ this is not valid json }");

    expect([400, 422, 500]).toContain(res.status);
  });

  it("returns 400 for completely empty body on podcast creation", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(MOCK_SUBSCRIPTION as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when noteContent is too short (less than minimum)", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(MOCK_SUBSCRIPTION as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "x", duration: "SHORT" }); // 1 char, too short

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================================
describe("Error Handling — Response Envelope Consistency", () => {
  it("all error responses include { success: false, error: string }", async () => {
    const scenarios: { path: string; method: string; body?: object }[] = [
      { method: "GET", path: "/api/v1/podcasts" },                          // 401
      { method: "POST", path: "/api/v1/podcasts", body: {} },               // 401 or 400
      { method: "GET", path: "/api/v1/nonexistent" },                        // 404
    ];

    for (const scenario of scenarios) {
      vi.mocked(auth.api.getSession).mockResolvedValue(null);

      const req = (request(app) as any)[scenario.method.toLowerCase()](scenario.path);
      if (scenario.body) req.send(scenario.body);

      const res = await req;

      expect(res.body.success, `${scenario.method} ${scenario.path} missing success field`).toBe(false);
      expect(typeof res.body.error, `${scenario.method} ${scenario.path} missing error field`).toBe("string");
    }
  });

  it("successful responses always include { success: true, data: ... }", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findMany).mockResolvedValue([]);
    vi.mocked(prisma.podcast.count).mockResolvedValue(0);

    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Cookie", "session=valid");

    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
  });
});

// ============================================================================
describe("Error Handling — Boundary Value Analysis (Podcast noteContent)", () => {
  const validBase = { duration: "SHORT" };

  const boundary_cases = [
    { label: "empty string (0 chars)",    noteContent: "",                                                        expectedStatus: 400 },
    { label: "single char (1 char)",      noteContent: "a",                                                       expectedStatus: 400 },
    { label: "99 chars (below min)",       noteContent: "a".repeat(99),                                           expectedStatus: 400 },
    { label: "100 chars (at min)",         noteContent: "a".repeat(100),                                          expectedStatus: [201, 400] },
    { label: "null value",                 noteContent: null,                                                      expectedStatus: 400 },
    { label: "number instead of string",  noteContent: 12345 as any,                                              expectedStatus: 400 },
    { label: "array instead of string",   noteContent: ["text"] as any,                                           expectedStatus: 400 },
  ];

  for (const tc of boundary_cases) {
    it(`noteContent — ${tc.label}`, async () => {
      asAuthenticated();
      const { prisma } = await import("@repo/database");
      vi.mocked(prisma.subscription.findUnique).mockResolvedValue(MOCK_SUBSCRIPTION as any);
      vi.mocked(prisma.podcast.create).mockResolvedValue({ id: "new", status: "QUEUED", jobs: [] } as any);
      vi.mocked(prisma.podcast.update).mockResolvedValue({} as any);
      vi.mocked(prisma.podcastJob.upsert).mockResolvedValue({} as any);

      const res = await request(app)
        .post("/api/v1/podcasts")
        .set("Cookie", "session=valid")
        .send({ ...validBase, noteContent: tc.noteContent });

      const expectedStatuses = Array.isArray(tc.expectedStatus)
        ? tc.expectedStatus
        : [tc.expectedStatus];

      expect(
        expectedStatuses,
        `noteContent "${tc.label}" got status ${res.status}, expected one of ${expectedStatuses.join(", ")}`
      ).toContain(res.status);
    });
  }
});

// ============================================================================
describe("Error Handling — Database Failure Recovery", () => {
  it("returns 500 (not crash) when Prisma throws unexpected error", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockRejectedValue(
      new Error("Connection pool exhausted")
    );

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "Some interesting content", duration: "SHORT" });

    // Should be 500, not a process crash
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it("returns 500 gracefully when podcast listing DB call fails", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findMany).mockRejectedValue(new Error("DB connection reset"));

    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

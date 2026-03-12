/**
 * Podcast API Test Suite
 *
 * Covers: CRUD operations, input validation, authorization,
 * subscription limit enforcement, and status polling.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
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

const MOCK_PODCAST = {
  id: "pod-001",
  userId: MOCK_USER.id,
  title: "My First Podcast",
  noteContent: "This is content for the podcast about AI.",
  duration: "SHORT",
  status: "QUEUED",
  progress: 0,
  hostVoice: "Sierra",
  guestVoice: "Daniel",
  ttsProvider: "unreal",
  audioUrl: null,
  audioDuration: null,
  audioSize: null,
  currentStep: null,
  error: null,
  retryCount: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  completedAt: null,
  deletedAt: null,
  noteId: null,
  jobs: [],
};

const MOCK_SUBSCRIPTION = {
  id: "sub-001",
  userId: MOCK_USER.id,
  plan: "FREE",
  status: "ACTIVE",
  monthlyPodcastLimit: 5,
  monthlyMinutesLimit: 25,
  currentPodcastCount: 0,
  currentMinutesUsed: 0,
  usageResetDate: new Date(Date.now() + 86400_000),
  currentPeriodStart: new Date(),
  currentPeriodEnd: new Date(Date.now() + 86400_000),
};

function asAuthenticated() {
  vi.mocked(auth.api.getSession).mockResolvedValue(MOCK_SESSION as any);
}
function asUnauthenticated() {
  vi.mocked(auth.api.getSession).mockResolvedValue(null);
}

async function mockSubscriptionAllowed() {
  const { prisma } = await import("@repo/database");
  vi.mocked(prisma.subscription.findUnique).mockResolvedValue(MOCK_SUBSCRIPTION as any);
}

// ============================================================================
describe("Podcast API — Create Podcast (POST /api/v1/podcasts)", () => {
  it("returns 201 with podcast data for valid authenticated request", async () => {
    asAuthenticated();
    await mockSubscriptionAllowed();

    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.create).mockResolvedValue(MOCK_PODCAST as any);
    vi.mocked(prisma.podcast.update).mockResolvedValue(MOCK_PODCAST as any);
    vi.mocked(prisma.podcastJob.upsert).mockResolvedValue({} as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "Interesting content about AI and machine learning that goes into great detail about how modern systems work and their impact on the world today.", duration: "SHORT" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.status).toBe("QUEUED");
  });

  it("returns 401 when not authenticated", async () => {
    asUnauthenticated();

    const res = await request(app)
      .post("/api/v1/podcasts")
      .send({ noteContent: "Some content", duration: "SHORT" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when noteContent is missing", async () => {
    asAuthenticated();
    await mockSubscriptionAllowed();

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ duration: "SHORT" }); // missing noteContent

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when duration has invalid value", async () => {
    asAuthenticated();
    await mockSubscriptionAllowed();

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "Some content", duration: "MEDIUM" }); // invalid

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when noteContent is empty string", async () => {
    asAuthenticated();
    await mockSubscriptionAllowed();

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "", duration: "SHORT" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 403 when subscription limit is exceeded", async () => {
    asAuthenticated();

    // Subscription at limit
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue({
      ...MOCK_SUBSCRIPTION,
      currentPodcastCount: 5, // at FREE limit (5)
    } as any);

    const res = await request(app)
      .post("/api/v1/podcasts")
      .set("Cookie", "session=valid")
      .send({ noteContent: "Content", duration: "SHORT" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================================
describe("Podcast API — List Podcasts (GET /api/v1/podcasts)", () => {
  it("returns 200 with paginated list for authenticated user", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findMany).mockResolvedValue([MOCK_PODCAST as any]);
    vi.mocked(prisma.podcast.count).mockResolvedValue(1);

    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination.total).toBe(1);
  });

  it("returns 200 with empty array when user has no podcasts", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findMany).mockResolvedValue([]);
    vi.mocked(prisma.podcast.count).mockResolvedValue(0);

    const res = await request(app)
      .get("/api/v1/podcasts")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.pagination.total).toBe(0);
  });

  it("returns 401 for unauthenticated request", async () => {
    asUnauthenticated();

    const res = await request(app).get("/api/v1/podcasts");

    expect(res.status).toBe(401);
  });
});

// ============================================================================
describe("Podcast API — Get Single Podcast (GET /api/v1/podcasts/:id)", () => {
  it("returns 200 with podcast data for owner", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue(MOCK_PODCAST as any);

    const res = await request(app)
      .get("/api/v1/podcasts/pod-001")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe("pod-001");
  });

  it("returns 404 when podcast belongs to another user", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    // findFirst with userId filter returns null (not owner)
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.podcast.findUnique).mockResolvedValue({
      ...MOCK_PODCAST,
      userId: "other-user-999",
    } as any);

    const res = await request(app)
      .get("/api/v1/podcasts/pod-other")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ============================================================================
describe("Podcast API — Delete Podcast (DELETE /api/v1/podcasts/:id)", () => {
  it("returns 200 after successful soft delete", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue(MOCK_PODCAST as any);
    vi.mocked(prisma.podcast.update).mockResolvedValue({
      ...MOCK_PODCAST,
      deletedAt: new Date(),
    } as any);

    const res = await request(app)
      .delete("/api/v1/podcasts/pod-001")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 401 when user is not authenticated", async () => {
    asUnauthenticated();

    const res = await request(app).delete("/api/v1/podcasts/pod-001");

    expect(res.status).toBe(401);
  });
});

// ============================================================================
describe("Podcast API — Status Polling (GET /api/v1/podcasts/:id/status)", () => {
  it("returns status object with progress and currentStep", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue({
      ...MOCK_PODCAST,
      status: "PROCESSING",
      progress: 45,
      currentStep: "Generating audio",
    } as any);

    const res = await request(app)
      .get("/api/v1/podcasts/pod-001/status")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PROCESSING");
    expect(res.body.data.progress).toBe(45);
    expect(res.body.data.currentStep).toBe("Generating audio");
  });

  it("returns completed status with audioUrl when done", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue({
      ...MOCK_PODCAST,
      status: "COMPLETED",
      progress: 100,
      audioUrl: "https://s3.amazonaws.com/podnext/pod-001.mp3",
    } as any);

    const res = await request(app)
      .get("/api/v1/podcasts/pod-001/status")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
    expect(res.body.data.audioUrl).toBeDefined();
  });
});

// ============================================================================
describe("Podcast API — Retry Failed Podcast (POST /api/v1/podcasts/:id/retry)", () => {
  it("returns 200 and re-queues a FAILED podcast", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");

    const failedPodcast = { ...MOCK_PODCAST, status: "FAILED", jobs: [] };
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue(failedPodcast as any);
    vi.mocked(prisma.subscription.findUnique).mockResolvedValue(MOCK_SUBSCRIPTION as any);
    vi.mocked(prisma.podcast.update).mockResolvedValue({ ...failedPodcast, status: "QUEUED" } as any);
    vi.mocked(prisma.podcastJob.upsert).mockResolvedValue({} as any);

    const res = await request(app)
      .post("/api/v1/podcasts/pod-001/retry")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("returns 400 when podcast is not in FAILED state", async () => {
    asAuthenticated();
    const { prisma } = await import("@repo/database");

    // Podcast is COMPLETED, not FAILED
    vi.mocked(prisma.podcast.findFirst).mockResolvedValue({
      ...MOCK_PODCAST,
      status: "COMPLETED",
      jobs: [],
    } as any);

    const res = await request(app)
      .post("/api/v1/podcasts/pod-001/retry")
      .set("Cookie", "session=valid");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

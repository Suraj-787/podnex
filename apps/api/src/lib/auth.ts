import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "@repo/database";

// Only register a provider once its credentials are actually configured —
// matches the pattern used for Dodo Payments routes elsewhere in the app.
const socialProviders: Record<string, { clientId: string; clientSecret: string }> = {};

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  socialProviders.google = {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  };
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  socialProviders.github = {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
  };
}

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",

  trustedOrigins: (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  socialProviders,

  // The OAuth state cookie set during signIn.social() is written via a
  // cross-origin fetch() (frontend on Vercel, API on EC2) — browsers with
  // third-party cookie blocking (Chrome's default as of this deployment,
  // not just Safari/Firefox) never store it, since it's set outside a
  // top-level navigation to this domain. The state token itself is still
  // verified against a random 32-char value stored server-side in the
  // Verification table, so this only removes a redundant secondary check,
  // not the actual CSRF protection.
  account: {
    skipStateCookieCheck: true,
  },

  // Required for cross-domain cookies (frontend on Vercel, API on EC2)
  advanced: {
    defaultCookieAttributes: {
      sameSite: "none" as const,
      secure: true,
      httpOnly: true,
      path: "/",
    },
  },

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },

  hooks: {
    // Checked by existence rather than gated on ctx.path.startsWith("/sign-up"):
    // OAuth (Google/GitHub) first-time sign-up goes through /callback/:id, not
    // /sign-up/*, and newSession is set on every login (not just new-user
    // creation) — so path-matching alone would miss social sign-ups entirely
    // while an existence check works uniformly for every auth method.
    after: createAuthMiddleware(async (ctx) => {
      const newSession = ctx.context.newSession;
      if (!newSession) return;

      const existing = await prisma.subscription.findUnique({
        where: { userId: newSession.user.id },
      });
      if (existing) return;

      try {
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await prisma.subscription.create({
          data: {
            userId: newSession.user.id,
            plan: "FREE",
            status: "ACTIVE",
            monthlyPodcastLimit: 5,
            monthlyMinutesLimit: 25,
            usageResetDate: nextMonth,
            currentPeriodStart: new Date(),
            currentPeriodEnd: nextMonth,
          },
        });
        console.log(`✅ Created default subscription for user ${newSession.user.id}`);
      } catch (error) {
        console.error("❌ Failed to create subscription for user:", error);
      }
    }),
  },
});

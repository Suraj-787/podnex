import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { prisma } from "@repo/database";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3001",

  trustedOrigins: (process.env.FRONTEND_URL || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

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
    after: createAuthMiddleware(async (ctx) => {
      if (ctx.path.startsWith("/sign-up")) {
        const newSession = ctx.context.newSession;

        if (newSession) {
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
        }
      }
    }),
  },
});

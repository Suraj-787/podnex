export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  expiresAt: string;
  token: string;
  userId: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  session?: Session;
  error?: string;
  message?: string;
}

export interface UpdateProfileDto {
  name?: string;
  image?: string;
}

export type SubscriptionPlan = 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS';
export type SubscriptionStatus = 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'PAUSED';

// Matches the raw Prisma row returned as-is by GET /api/v1/user/subscription
// (SubscriptionService.getSubscription) — field names are the actual DB
// columns, not a separate API-shaped contract.
export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  monthlyPodcastLimit: number;
  monthlyMinutesLimit: number;
  currentPodcastCount: number;
  currentMinutesUsed: number;
  usageResetDate: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Matches GET /api/v1/user/usage (SubscriptionService.getUsage) exactly.
export interface UsageData {
  currentPeriod: {
    podcastsUsed: number;
    podcastsLimit: number;
    minutesUsed: number;
    minutesLimit: number;
    resetDate: string;
  };
  subscription: {
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    currentPeriodStart: string;
    currentPeriodEnd: string;
  };
}

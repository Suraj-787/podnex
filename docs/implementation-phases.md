# 🚀 PodNex Implementation Phases

**Complete Roadmap for Production-Grade SaaS Transformation**

---

## 📋 Project Overview

**Goal:** Transform PodNex prototype into a full-featured, production-ready SaaS platform for AI-powered podcast generation.

**Timeline:** 5-6 weeks (Full-time development)  
**Team Size:** 1-2 developers  
**Tech Stack:** 
- **Frontend:** Next.js 15, React 19, TanStack Query, Zustand, shadcn/ui
- **Backend:** Express.js, Prisma, PostgreSQL, BullMQ, Redis
- **Services:** Dodo Payments, OpenAI, Unreal Speech, S3/R2

---

## 🎯 Success Metrics

- [ ] User can sign up, create podcasts, and play them
- [ ] Real-time progress updates during generation
- [ ] Subscription limits enforced correctly
- [ ] Payment flow works end-to-end
- [ ] API keys can be generated and used
- [ ] Webhooks deliver events reliably
- [ ] System handles 100+ concurrent podcast generations
- [ ] 99.9% uptime for API endpoints
- [ ] <2s average API response time
- [ ] Lighthouse score >90 for frontend

---

## 📦 Phase 0: Foundation Setup (Days 1-2)

**Goal:** Set up development environment, install dependencies, and configure base infrastructure

### Backend Tasks

- [x] **Project Structure**
  ```bash
  cd apps/api
  npm install express cors dotenv
  npm install --save-dev typescript @types/node @types/express ts-node-dev
  ```

- [x] **Install Core Dependencies**
  ```bash
  npm install prisma @prisma/client
  npm install bullmq ioredis
  npm install zod
  npm install @dodopayments/express
  npm install better-auth
  npm install @ai-sdk/openai ai
  npm install aws-sdk # for S3
  npm install winston # logging
  npm install express-rate-limit
  ```

- [x] **Database Setup**
  - [x] Configure PostgreSQL (local or hosted)
  - [x] Initialize Prisma: `npx prisma init`
  - [x] Set `DATABASE_URL` in `.env`
  - [x] Note: Schema created but needs db:push to sync to actual database
  
- [x] **Redis Setup**
  - [x] Install Redis locally or use managed service (Upstash, Redis Cloud)
  - [x] Set `REDIS_URL` in `.env`
  - [x] Redis running on localhost:6379
  - [x] Package created at packages/redis with ioredis

- [x] **Environment Variables**
  - [x] Copy all required env vars from plan
  - [x] Set up `.env.example` template
  - [x] Document all required credentials
  - [x] Note: No OAuth providers configured - email/password only

### Frontend Tasks

- [x] **Project Already Set Up** (Next.js, shadcn/ui configured)
  - [x] Design system: Dark theme with warm accents
  - [x] Fonts: Cormorant Garamond (serif, headings), Inter (sans, body)
  - [x] Color palette: Deep black (#050505), warm off-white, blue-gray accents
  - [x] Grain overlay effect for sophistication

- [x] **Install Additional Dependencies**
  ```bash
  cd apps/web
  npm install @tanstack/react-query
  npm install zustand
  npm install react-hook-form @hookform/resolvers zod
  npm install date-fns
  npm install recharts # for charts
  npm install sonner # for toasts
  npm install @stripe/stripe-js # will use for Dodo
  npm install lucide-react # icons
  ```

- [x] **Configure API Client**
  - [x] Set `NEXT_PUBLIC_API_URL` in `.env.local`
  - [x] Create base API client structure (health.api.ts, client.ts)

### DevOps Tasks

- [x] **Git Workflow**
  - [x] Document commit conventions (docs/git-workflow.md)
  - [x] Branch strategy documented
  - [x] PR guidelines created
  - [ ] Create `development` branch (optional)
  - [ ] Set up branch protection rules (optional)

- [x] **Testing Setup**
  - [x] Testing guide created (docs/testing-setup.md)
  - [x] Vitest configuration documented
  - [x] Test examples provided
  - [x] GitHub Actions workflow created (.github/workflows/test.yml)
  - [ ] Install Vitest packages (optional - when ready to write tests)

**Deliverable:** Fully configured development environment ready for coding

---

## 📦 Phase 1: Database & Authentication (Days 3-5)

**Goal:** Implement complete database schema and authentication system

### Backend Tasks

#### 1.1 Database Schema Implementation

- [x] **Create Prisma Schema** (`packages/database/prisma/schema.prisma`)
  - [x] Extend existing User, Session, Account models (already done ✅)
  - [x] Add Podcast model
  - [x] Add PodcastJob model
  - [x] Add Subscription model
  - [x] Add UsageRecord model
  - [x] Add ApiKey model
  - [x] Add Webhook model
  - [x] Add WebhookDelivery model
  - [x] Add all enums (PodcastStatus, PodcastDuration, SubscriptionPlan, etc.)

- [x] **Run Migrations**
  ```bash
  npx prisma migrate dev --name init_podcast_schema
  npx prisma generate
  ```
  - [x] Schema created with all models
  - [x] Prisma generate completed

- [ ] **Seed Database** (optional)
  - [ ] Create seed script with sample data
  - [ ] Create test users with different plans

#### 1.2 Authentication Routes

- [x] **Better Auth Integration** (Already configured)
  - [x] Email and password authentication
  - [x] Session-based auth working
  - [x] Sign up/Sign in flows
  - [x] Hooks configured with createAuthMiddleware
  - [x] Auto-create subscription on signup
  - [x] Note: Google OAuth removed - keeping authentication simple with email/password only

- [x] **Add Auth Middleware** (`src/middleware/auth.middleware.ts`)
  - [x] `requireAuth` - Session validation
  - [x] `optionalAuth` - Optional session
  - [x] `requireApiKey` - API key validation (SHA256 hashing)
  - [x] `requireAdmin` - Admin check (using ADMIN_EMAILS env var)
  - [x] Extract user from session/API key

- [x] **User Routes** (`src/routes/user.routes.ts`)
  - [x] `GET /api/v1/user/profile` - Get profile
  - [x] `PATCH /api/v1/user/profile` - Update profile (name, image)
  - [x] `GET /api/v1/user/subscription` - Get subscription
  - [x] `GET /api/v1/user/usage` - Get usage statistics
  - [x] `DELETE /api/v1/user/account` - Delete account (soft delete with cleanup)

- [x] **Subscription Service** (already implemented in Phase 2)
  - [x] `getSubscription(userId)` - Fetch subscription
  - [x] `checkLimits(userId)` - Validate usage against limits
  - [x] `trackUsage(userId, minutes)` - Record usage
  - [x] `createDefaultSubscription(userId)` - Create FREE plan on signup (done in auth hook)
  - [ ] `resetMonthlyUsage()` - Reset counters (cron job - future)

- [x] **Subscription Routes** (integrated in user.routes.ts)
  - [x] `GET /api/v1/user/subscription` - Get subscription details
  - [x] `GET /api/v1/user/usage` - Get usage statistics

- [x] **Subscription Middleware** (`src/middleware/subscription.middleware.ts`)
  - [x] `checkSubscriptionLimits` - Enforce limits on podcast creation (implemented in Phase 2)

- [x] **Auto-create Subscription on User Registration**
  - [x] Hook into Better Auth registration (hooks.after with createAuthMiddleware)
  - [x] Create FREE subscription automatically (5 podcasts, 25 minutes limit)

### Frontend Tasks
  - [x] Created at apps/web/app/signin/page.tsx
  
- [x] **Sign Up Page** (Already exists)
  - [x] Created at apps/web/app/signup/page.tsx

- [x] **Add Post-Auth Redirect**
  - [x] Redirect to `/dashboard` after successful signup
  - [x] Redirect to `/signin` if not authenticated

- [x] **Auth Context/Hook**
  - [x] Use Better Auth React client (auth-client.ts configured)
  - [x] Better Auth hooks available (useSession, signOut)

#### 1.2 Settings - Profile Page

- [x] **Create Route** (`app/(dashboard)/settings/profile/page.tsx`)
  - [x] Settings page exists with grid layout
  - [x] Profile page created with ProfileForm integration
  
- [x] **Profile Form Component** (`components/settings/ProfileForm.tsx`)
  - [x] Name input with validation (min 2 chars)
  - [x] Email display (read-only)
  - [x] Avatar with initials (gradient circle)
  - [x] Delete account button (with AlertDialog confirmation)
  - [x] Loading states and error handling
  - [ ] Password change (using Better Auth reset flow instead)
  - [ ] Avatar upload (deferred - using initials)

- [x] **API Integration**
  - [x] Update profile mutation (PATCH /api/v1/user/profile)
  - [x] Delete account (DELETE /api/v1/user/account)
  - [x] Toast notifications
  - [ ] Real data fetching (currently using mock data - Phase 2)

**Deliverable:** Complete authentication system with user profiles and subscription foundation

---

## 📦 Phase 2: Core Podcast API (Days 6-10)

**Goal:** Build complete podcast generation backend with job queue system

### Backend Tasks

#### 2.1 Port Prototype Logic

- [ ] **Script Generator Service** (`src/services/script-generator.service.ts`)
  - Copy from prototype: `podnex-proto/src/services/scriptGenerator.ts`
  - Integrate with OpenAI
  - Add error handling

- [ ] **Audio Generator Service** (`src/services/audio-generator.service.ts`)
  - Copy from prototype: `podnex-proto/src/services/audioGenerator.ts`
  - Support Unreal Speech TTS
  - Add retry logic

- [ ] **Audio Combiner Service** (`src/services/audio-combiner.service.ts`)
  - Copy from prototype: `podnex-proto/src/services/audioCombiner.ts`
  - FFmpeg integration
  - Buffer management

- [ ] **Storage Service** (`src/services/storage.service.ts`)
  - S3/R2 upload functionality
  - Signed URL generation
  - File deletion

#### 2.2 Job Queue System

- [ ] **Install & Configure BullMQ**
  ```bash
  npm install bullmq ioredis
  ```

- [ ] **Queue Service** (`src/services/queue.service.ts`)
  - Create podcast generation queue
  - Add job to queue
  - Get job status
  - Cancel job
  - Retry failed job
  - Get queue statistics

- [ ] **Job Processor** (`src/workers/podcast.worker.ts`)
  - Process podcast jobs
  - Update progress (0%, 25%, 50%, 75%, 100%)
  - Handle errors and retries
  - Update database on completion
  - Send webhooks

- [ ] **Start Worker Process**
  - Create separate worker file
  - Add to `package.json` scripts
  - Configure concurrency

#### 2.3 Podcast Service & Routes

- [ ] **Podcast Service** (`src/services/podcast.service.ts`)
  - [ ] `create(userId, data)` - Create podcast record & queue job
  - [ ] `findById(id, userId)` - Get single podcast
  - [ ] `findByUser(userId, options)` - List user's podcasts
  - [ ] `update(id, userId, data)` - Update podcast (title, etc.)
  - [ ] `delete(id, userId)` - Soft delete
  - [ ] `retry(id, userId)` - Retry failed generation
  - [ ] `getStatus(id, userId)` - Get real-time status
  - [ ] `generateDownloadUrl(id, userId)` - Generate signed S3 URL

- [ ] **Podcast Routes** (`src/routes/podcast.routes.ts`)
  - [ ] `POST /api/v1/podcasts` - Create (with subscription limit check)
  - [ ] `GET /api/v1/podcasts` - List (with pagination, filters)
  - [ ] `GET /api/v1/podcasts/:id` - Get details
  - [ ] `PATCH /api/v1/podcasts/:id` - Update
  - [ ] `DELETE /api/v1/podcasts/:id` - Delete
  - [ ] `POST /api/v1/podcasts/:id/retry` - Retry
  - [ ] `GET /api/v1/podcasts/:id/status` - Get status (for polling)
  - [ ] `GET /api/v1/podcasts/:id/download` - Get download URL
  - [ ] `GET /api/v1/podcasts/:id/transcript` - Get transcript

- [ ] **Validation Schemas** (`src/validators/podcast.validator.ts`)
  - Create podcast schema
  - Update podcast schema
  - Query parameters schema

#### 2.4 Usage Tracking

- [ ] **Track Usage on Completion**
  - In job processor, call `trackUsage(userId, audioDuration)`
  - Create UsageRecord entry
  - Increment subscription counters
x] **Create Dashboard Layout** (`app/(dashboard)/layout.tsx`)
  - [x] Sidebar component with navigation
  - [x] Header with breadcrumb navigation
  - [x] Mobile responsive (collapsible sidebar with SidebarProvider)
  - [x] Logout button in user dropdown
  - [x] Apply current design system:
    - [x] Use Cormorant Garamond for headings
    - [x] Dark theme with warm accents
    - [x] Grain overlay for sophistication (opacity 0.03)
    - [x] Smooth transitions with cubic-bezier easing

- [x] **Sidebar Navigation** (`components/dashboard/DashboardSidebar.tsx`)
  - [x] Dashboard (home icon)
  - [x] Podcasts (mic icon)
  - [x] Analytics (chart icon)
  - [x] Settings (gear icon)
  - [x] Active state highlighting
  - [x] Usage meter showing plan limits
  - [x] User dropdown with profile and logoutcents
    - Grain overlay for sophistication
   x] **Create Dashboard Home** (`app/(dashboard)/dashboard/page.tsx`)
  - [x] Welcome message with user name
  - [x] Stats cards section
  - [x] Recent podcasts section with empty st

- [x] **Stats Cards Component** (`components/dashboard/StatsCard.tsx`)
  - [x] Component created and reusable
  - [x] Displays icon, title, value, change
  - [ ] Currently showing mock data (needs API integration)

- [x] **Usage Meter Component** (`components/dashboard/UsageMeter.tsx`)
  - [x] Integrated in sidebar (not separate component)
  - [x] Visual progress bar
  - [x] Shows plan usage
  - [ ] Currently showing mock data (needs API integration)

- [x] **Recent Podcasts Component** (`components/dashboard/RecentPodcasts.tsx`)
  - [x] Component created
  - [x] Grid layout ready
  - [x] Empty state with illustration
  - [ ] Currently no data (needs API integration)

- [x] **Quick Action Button**
  - [x] "Create Your First Podcast" button in empty state

#### 2.5 Podcasts Page (Frontend) ✅

- [x] **Create Podcasts Page** (`app/(dashboard)/podcasts/page.tsx`)
  - [x] Page created with full implementation
  - [x] Filters, search, and sorting integrated
  - [x] Grid and list view toggle
  - [x] Mock data for development
  - [x] Pagination working
  - [x] Ready for API integration
  
- [x] **Podcast List Component** (`components/podcasts/PodcastList.tsx`)
  - [x] Grid/List view toggle with responsive layout
  - [x] Empty state handling
  - [x] Loading skeletons
  - [x] Pagination with page numbers

- [x] **Podcast Card Component** (`components/podcasts/PodcastCard.tsx`)
  - [x] Thumbnail with placeholder SVG
  - [x] Title display with auto-generation
  - [x] Status badge (Processing/Completed/Failed/Queued)
  - [x] Duration formatting
  - [x] Created date with relative time
  - [x] Actions menu (Play, Download, Share, View Details, Retry, Delete)
  - [x] Progress bar for processing state with white text
  - [x] Duration formatting
  - [x] Created date with relative time
  - [x] Actions menu (Play, Download, Share, View Details, Retry, Delete)
  - [x] Progress bar for processing state
  - [x] Error message display for failed state
  - [x] Hover effects and animations
  - [x] Retry button in grid view matches list view design
  - [x] Percentage text in white for processing stateeted, Processing, Queued, Failed)
  - [x] Sort by date and duration (ascending/descending)
  - [x] View mode toggle (grid/list)
  - [x] Create new button

- [x] **Additional Components Created**
  - [x] `StatusBadge.tsx` - Reusable status indicator with icons
  - [x] `EmptyState.tsx` - Empty state with CTA
  - [x] `lib/types/podcast.types.ts` - TypeScript interfaces

- [ ] **Real-time Status Updates** (pending API integration)
  - [ ] Use React Query with `refetchInterval`

#### 2.6 Create Podcast Form (Frontend) ✅

- [x] **Create Form Page** (`app/(dashboard)/podcasts/new/page.tsx`)
  - [x] Page created with complete multi-step wizard
  - [x] Step 1: Content input (textarea with placeholder formatting)
  - [x] Step 2: Configuration (duration, title, voice settings, advanced settings)
  - [x] Step 3: Review & submit
  - [x] Step indicators with progress tracking
  - [x] Navigation between steps with validation

- [x] **Form Validation**
  - [x] React Hook Form + Zod integration
  - [x] Min/max length validation (100-10,000 characters)
  - [x] Real-time character counter with color coding
  - [x] Word count display
  - [x] Validation feedback messages
  - [x] Minimum requirement highlighted in description

- [x] **Submit & Redirect**
  - [x] Show loading state with animation
  - [x] Redirect to podcast list on success (mock)
  - [x] Toast notifications for success/error

- [x] **Additional Features**
  - [x] Paste from clipboard functionality
  - [x] Upload .txt file support
  - [x] Duration selection (Short/Medium/Long)
  - [x] Voice selection for host and guest with preview buttons
  - [x] Optional title input with auto-generation fallback
  - [x] Advanced settings (webhook URL, note ID)
  - [x] Review step with content and configuration summary
  - [x] Credit cost indicator
  - [x] Clean code formatting and proper spacing
  - [ ] Use React Query with `refetchInterval`
  - [ ] Not yet created
  mponent** (`components/podcasts/PodcastPlayer.tsx`)
  - [ ] Play/pause
  - [ ] Seek bar
  - [ ] Volume control
  - [ ] Playback speed
  - [ ] Download button

- [ ] **Progress Indicator** (`components/podcasts/ProgressIndicator.tsx`)
  - [ ] Show only if status is "processing"
  - [ ] Progress bar with percentage
  - [ ] Current step text
  - [ ] Elapsed time

- [ ] **Transcript Viewer** (`components/podcasts/TranscriptViewer.tsx`)
  - [ ] Speaker-labeled segments
  - [ ] Timestamps
  - [ ] Click timestamp to seek
  - [ ] Export options (TXT, SRT)
  - [ ] Copy to clipboard

- [ ] **Metadata Section**
  - [ ] Created date
  - [ ] Duration
  - [ ] File size
  - [ ] TTS provider

- [ ] **Actions**
  - [ ] Share button
  - [ ] Delete button (with confirmation)
  - [ ] Download button

- [x]x] Dlient.ts`)
  - [ ] Not explicitly created yet, but dependencies installed
  - [ ] Configure QueryClient
  - [ ] Default options

- [x] **API Client** (`lib/api/client.ts`)
  - [x] Base request function created
  - [x] Error handling
  - [x] Auth token/cookie handling (Better Auth cookies)

- [ ] **Podcast API** (`lib/api/podcasts.ts`)
  - [ ] `list()` - List podcasts
  - [ ] `get(id)` - Get podcast
  - [ ] `create(data)` - Create podcast
  - [ ] `update(id, data)` - Update podcast
  - [ ] `delete(id)` - Delete podcast
  - [ ] `retry(id)` - Retry podcast
  - [ ] `getStatus(id)` - Get status

- [ ] **User API** (`lib/api/user.ts`)
  - [ ] `getProfile()`
  - [ ] `updateProfile(data)`
  - [ ] `getSubscription()`
  - [ ] `getUsage()`

- [ ] **Custom Hooks** (`lib/hooks/`)
  - [ ] `usePodcasts()` - List podcasts query
  - [ ] `usePodcast(id)` - Single podcast query
  - [ ] `useCreatePodcast()` - Create mutation
  - [ ] `useDeletePodcast()` - Delete mutation
  - [ ] `useSubscription()` - Subscription query
  - `useUsage()` - Usage query

**Deliverable:** Fully functional podcast creation and management system (core features)

---

## 📦 Phase 3: Billing Integration (Days 11-13)

**Goal:** Complete Dodo Payments integration for subscription management

### Backend Tasks

#### 3.1 Dodo Payments Service

- [ ] **Install Dodo Payments**
  ```bash
  npm install @dodopayments/express
  ```

- [ ] **Dodo Payments Service** (`src/services/dodo-payments.service.ts`)
  - [ ] `createCheckoutSession(userId, plan)` - Create checkout
  - [ ] `getCustomerPortalUrl(customerId)` - Get portal URL
  - [ ] `handleWebhook(payload)` - Process webhooks
  - [ ] `handleSubscriptionActive()` - Subscription activated
  - [ ] `handleSubscriptionCancelled()` - Subscription cancelled
  - [ ] `handleSubscriptionFailed()` - Payment failed
  - [ ] `handlePaymentSucceeded()` - Payment succeeded
  - [ ] Utility methods for plan mapping

#### 3.2 Billing Routes

- [ ] **Billing Routes** (`src/routes/billing.routes.ts`)
  - [ ] `POST /api/v1/billing/checkout` - Create checkout session
  - [ ] `GET /api/v1/billing/portal` - Get customer portal URL
  - [ ] `POST /api/v1/billing/webhooks` - Webhook endpoint

- [ ] **Subscription Management Routes**
  - [ ] `POST /api/v1/user/subscription/upgrade` - Upgrade plan
  - [ ] `DELETE /api/v1/user/subscription` - Cancel subscription

#### 3.3 Webhook Configuration

- [ ] **Set up Webhook Endpoint**
  - Configure public URL
  - Add to Dodo Payments dashboard
  - Test webhook signature verification

- [ ] **Webhook Event Handlers**
  - Handle all subscription events
  - Update database accordingly
  - Send email notifications (optional)

#### 3.4 Dodo Products Setup

- [ ] **Create Products in Dodo Dashboard**
  - [ ] FREE (reference only, no product needed)
  - [ ] STARTER - $29/month - 50 podcasts
  - [ ] PRO - $99/month - 200 podcasts
  - [ ] BUSINESS - $299/month - Unlimited
  - Save product IDs to env vars

### Frontend Tasks

#### 3.1 Subscription Settings Page

- [ ] **Create Subscription Page** (`app/(dashboard)/settings/subscription/page.tsx`)
- [ ] **Subscription Card** (`components/settings/SubscriptionCard.tsx`)
  - Current plan name
  - Billing cycle
  - Next billing date
  - Status badge

- [ ] **Usage Summary Component**
  - Podcasts used/limit
  - Minutes used/limit
  - Visual progress bars
  - Reset date

- [ ] **Plan Comparison Component**
  - Show all plans side-by-side
  - Highlight current plan
  - Feature comparison
  - "Upgrade" / "Downgrade" buttons

- [ ] **Billing History Component**
  - List of past invoices (if available from Dodo)
  - Download invoice links

#### 3.2 Checkout Flow

- [ ] **Upgrade Button Handler**
  - Call `/api/v1/billing/checkout`
  - Redirect to Dodo checkout URL
  - Handle return URL callback

- [ ] **Success Page** (`app/(dashboard)/billing/success/page.tsx`)
  - Congratulations message
  - Show updated plan
  - CTA to create podcasts

- [ ] **Cancel Page** (`app/(dashboard)/billing/cancel/page.tsx`)
  - "Payment cancelled" message
  - Retry button

#### 3.3 Customer Portal Integration

- [ ] **Manage Subscription Button**
  - Fetch portal URL from backend
  - Open in new tab or redirect

- [ ] **Cancel Subscription Flow**
  - Confirmation dialog
  - Retention messaging
  - Call cancel endpoint

#### 3.4 Usage Limit Enforcement (Frontend)

- [ ] **Check Limits Before Create**
  - Fetch current usage
  - Show upgrade prompt if at limit
  - Disable "Create Podcast" button if exceeded

- [ ] **Upgrade Prompts**
  - Modal when limit reached
  - "Upgrade Now" CTA
  - Show plan comparison

**Deliverable:** Complete billing system with subscription upgrades and management

---

## 📦 Phase 4: Advanced Features (Days 14-18)

**Goal:** Implement API keys, webhooks, analytics, and admin panel

### Backend Tasks

#### 4.1 API Key System

- [ ] **API Key Service** (`src/services/api-key.service.ts`)
  - [ ] `create(userId, data)` - Generate API key
  - [ ] `list(userId)` - List user's keys
  - [ ] `revoke(id, userId)` - Revoke key
  - [ ] `update(id, userId, data)` - Update key settings
  - [ ] `verify(key)` - Verify key and get user
  - [ ] `incrementUsage(key)` - Track usage

- [ ] **API Key Routes** (`src/routes/api-key.routes.ts`)
  - [ ] `POST /api/v1/api-keys` - Create
  - [ ] `GET /api/v1/api-keys` - List
  - [ ] `PATCH /api/v1/api-keys/:id` - Update
  - [ ] `DELETE /api/v1/api-keys/:id` - Revoke

- [ ] **API Key Generation**
  - Generate secure random key
  - Hash before storing
  - Return plain key only once
  - Create prefix for display (e.g., `pk_live_xxxxx`)

- [ ] **Rate Limiting per API Key**
  - Implement in middleware
  - Per-key rate limits
  - Return 429 when exceeded

#### 4.2 Webhook System

- [ ] **Webhook Service** (`src/services/webhook.service.ts`)
  - [ ] `create(userId, data)` - Create webhook
  - [ ] `list(userId)` - List webhooks
  - [ ] `update(id, userId, data)` - Update webhook
  - [ ] `delete(id, userId)` - Delete webhook
  - [ ] `sendEvent(userId, event, payload)` - Send webhook
  - [ ] `verifySignature(signature, body, secret)` - Verify
  - [ ] `retry(deliveryId)` - Retry failed delivery

- [ ] **Webhook Routes** (`src/routes/webhook.routes.ts`)
  - [ ] `POST /api/v1/webhooks` - Create
  - [ ] `GET /api/v1/webhooks` - List
  - [ ] `PATCH /api/v1/webhooks/:id` - Update
  - [ ] `DELETE /api/v1/webhooks/:id` - Delete
  - [ ] `GET /api/v1/webhooks/:id/deliveries` - Get delivery logs
  - [ ] `POST /api/v1/webhooks/:id/test` - Send test event

- [ ] **Webhook Delivery Logic**
  - Sign payload with HMAC
  - Retry on failure (3 attempts)
  - Log all deliveries
  - Store response status/body

- [ ] **Trigger Webhooks in Podcast Flow**
  - `podcast.created`
  - `podcast.processing`
  - `podcast.completed`
  - `podcast.failed`

#### 4.3 Analytics & Admin

- [ ] **Analytics Service** (`src/services/analytics.service.ts`)
  - [ ] `getUserStats(userId)` - User statistics
  - [ ] `getPlatformStats()` - Platform-wide stats (admin)
  - [ ] `getUsageTimeSeries(userId, range)` - Usage over time

- [ ] **Admin Routes** (`src/routes/admin.routes.ts`)
  - [ ] `GET /api/v1/admin/stats` - Platform statistics
  - [ ] `GET /api/v1/admin/users` - List all users
  - [ ] `GET /api/v1/admin/jobs` - Job queue monitor
  - [ ] `GET /api/v1/admin/podcasts` - All podcasts
  - [ ] `POST /api/v1/admin/users/:id/suspend` - Suspend user

- [ ] **Admin Middleware**
  - Check user role
  - Return 403 if not admin

### Frontend Tasks

#### 4.1 API Keys Management

- [ ] **API Keys Page** (`app/(dashboard)/settings/api-keys/page.tsx`)
- [ ] **API Key Manager** (`components/settings/ApiKeyManager.tsx`)
  - List of API keys (masked)
  - Last used date
  - Usage count
  - Revoke button

- [ ] **Create API Key Dialog**
  - Name input
  - Scopes checkboxes
  - Expiration date (optional)
  - Rate limit setting
  - Show key only once (copy to clipboard)
  - Warning message

- [ ] **API Key Display**
  - Show prefix only: `pk_live_xxxxx...xx123`
  - Copy button for prefix
  - Full key shown only on creation

#### 4.2 Webhooks Management

- [ ] **Webhooks Page** (`app/(dashboard)/settings/webhooks/page.tsx`)
- [ ] **Webhook Manager** (`components/settings/WebhookManager.tsx`)
  - List of webhooks
  - URL, events, status
  - Pause/activate toggle
  - Delete button

- [ ] **Create Webhook Dialog**
  - URL input
  - Event selection (checkboxes)
  - Auto-generate secret
  - Test webhook button

- [ ] **Webhook Deliveries Page** (`app/(dashboard)/settings/webhooks/[id]/deliveries/page.tsx`)
  - List of delivery attempts
  - Status, timestamp, response
  - Retry button for failed deliveries

#### 4.3 Analytics Dashboard

- [ ] **Analytics Page** (`app/(dashboard)/analytics/page.tsx`)
- [ ] **Usage Chart Component** (`components/analytics/UsageChart.tsx`)
  - Line chart for minutes over time
  - Bar chart for podcasts per month
  - Date range selector

- [ ] **Stats Grid**
  - Total podcasts
  - Total minutes
  - Average duration
  - Success rate

- [ ] **Activity Table** (`components/analytics/ActivityTable.tsx`)
  - Recent podcast generations
  - Date, title, duration, status
  - Export as CSV button

#### 4.4 Admin Panel

- [ ] **Admin Layout** (`app/(dashboard)/admin/layout.tsx`)
  - Only visible to admin users
  - Separate navigation

- [ ] **Admin Dashboard** (`app/(dashboard)/admin/page.tsx`)
  - Platform statistics
  - Total users, active subscriptions
  - Revenue (if available)
  - System health

- [ ] **User Management** (`app/(dashboard)/admin/users/page.tsx`)
  - List all users
  - Search by email/name
  - View user details
  - Suspend/unsuspend

- [ ] **Job Monitor** (`app/(dashboard)/admin/jobs/page.tsx`)
  - Active jobs count
  - Failed jobs list
  - Retry failed jobs
  - Queue statistics

**Deliverable:** Advanced features complete - API keys, webhooks, analytics, admin panel

---

## 📦 Phase 5: Polish & Production Ready (Days 19-25)

**Goal:** Optimize, test, secure, and prepare for production deployment

### Backend Tasks

#### 5.1 Security Hardening

- [ ] **Rate Limiting**
  - Install `express-rate-limit`
  - Apply to all routes
  - Different limits for auth vs API
  - Per-user and per-IP limits

- [ ] **Input Validation**
  - Validate all inputs with Zod
  - Sanitize user inputs
  - Prevent SQL injection (Prisma handles this)
  - Prevent XSS

- [ ] **CORS Configuration**
  - Proper origin whitelist
  - Credentials enabled
  - Preflight handling

- [ ] **Helmet & Security Headers**
  ```bash
  npm install helmet
  ```
  - Configure security headers
  - CSP policy
  - HSTS

- [ ] **Environment Validation**
  - Validate all required env vars on startup
  - Fail fast if missing critical config

#### 5.2 Error Handling & Logging

- [ ] **Structured Logging** (`src/lib/logger.ts`)
  - Use Winston or Pino
  - Log levels: error, warn, info, debug
  - Include request IDs for tracing
  - Log to files and/or cloud service

- [ ] **Global Error Handler** (enhance existing)
  - Catch all unhandled errors
  - Log stack traces
  - Return consistent error format
  - Hide internal details in production

- [ ] **Error Tracking**
  - Integrate Sentry (optional)
  - Track exceptions
  - Set up alerts

#### 5.3 Performance Optimization

- [ ] **Database Optimization**
  - Add indexes on frequently queried fields
  - Optimize N+1 queries
  - Use database connection pooling

- [ ] **Caching**
  - Cache subscription data (short TTL)
  - Cache user profiles
  - Use Redis for caching

- [ ] **Job Queue Optimization**
  - Configure concurrency
  - Set up job priorities
  - Configure retry strategies

- [ ] **API Response Compression**
  ```bash
  npm install compression
  ```
  - Enable gzip compression

#### 5.4 Monitoring & Health Checks

- [ ] **Health Check Endpoints**
  - [ ] `GET /api/health` - Basic health
  - [ ] `GET /api/health/db` - Database connection
  - [ ] `GET /api/health/redis` - Redis connection
  - [ ] `GET /api/health/s3` - S3 connectivity

- [ ] **Metrics Collection**
  - Request duration
  - Error rates
  - Queue depth
  - Active jobs
  - Database connection pool

- [ ] **Monitoring Dashboard** (optional)
  - Prometheus + Grafana
  - Or use managed service (Datadog, New Relic)

#### 5.5 Testing

- [ ] **Unit Tests**
  - Test all services
  - Test utility functions
  - Test validators
  - Target: 70%+ coverage

- [ ] **Integration Tests**
  - Test API endpoints
  - Test job processing
  - Test webhook delivery
  - Use test database

- [ ] **E2E Tests** (optional)
  - Full podcast creation flow
  - Subscription upgrade flow
  - Payment webhook flow

#### 5.6 Documentation

- [ ] **API Documentation**
  - Use Swagger/OpenAPI
  - Document all endpoints
  - Include example requests/responses

- [ ] **Setup Guide**
  - Environment setup
  - Local development instructions
  - Deployment instructions

- [ ] **Architecture Diagram**
  - System architecture
  - Data flow diagrams

### Frontend Tasks

#### 5.1 UI/UX Polish

- [ ] **Consistent Design**
  - Review all pages for consistency
  - Ensure color scheme is uniform
  - Typography consistency
  - Spacing consistency

- [ ] **Loading States**
  - Skeleton loaders for all async data
  - Loading spinners where appropriate
  - Optimistic updates for mutations

- [ ] **Error States**
  - Error boundaries for crash recovery
  - Friendly error messages
  - Retry buttons
  - Empty states for lists

- [ ] **Responsive Design**
  - Test on mobile (375px - 768px)
  - Test on tablet (768px - 1024px)
  - Test on desktop (1024px+)
  - Ensure touch targets are adequate

- [ ] **Accessibility**
  - ARIA labels on all interactive elements
  - Keyboard navigation
  - Focus indicators
  - Screen reader testing
  - Color contrast (WCAG AA minimum)

#### 5.2 Performance Optimization

- [ ] **Code Splitting**
  - Lazy load heavy components
  - Route-based code splitting
  - Dynamic imports for modals/dialogs

- [ ] **Image Optimization**
  - Use Next.js Image component
  - Proper sizing and formats
  - Lazy loading

- [ ] **Bundle Analysis**
  ```bash
  npm run build
  npx @next/bundle-analyzer
  ```
  - Identify large dependencies
  - Remove unused code

- [ ] **Caching Strategy**
  - React Query cache configuration
  - Stale-while-revalidate
  - Prefetch on hover (optional)

- [ ] **Web Vitals Optimization**
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1

#### 5.3 SEO & Meta Tags

- [ ] **Meta Tags**
  - Dynamic page titles
  - Meta descriptions
  - Open Graph tags
  - Twitter Card tags

- [ ] **Sitemap**
  - Generate sitemap.xml
  - Submit to search engines

- [ ] **robots.txt**
  - Configure crawling rules

- [ ] **Structured Data** (optional)
  - JSON-LD for rich snippets

#### 5.4 PWA Features (Optional)

- [ ] **Service Worker**
  - Install next-pwa
  - Configure caching strategy
  - Offline fallback page

- [ ] **Manifest**
  - App icons
  - App name and description
  - Theme colors

- [ ] **Install Prompt**
  - Add to home screen prompt

#### 5.5 Testing

- [ ] **Component Tests**
  - Test critical components
  - Use Testing Library
  - Test user interactions

- [ ] **E2E Tests**
  - Use Playwright or Cypress
  - Test critical user flows:
    - Sign up → Create podcast → View podcast
    - Upgrade subscription flow
    - Settings management

- [ ] **Cross-browser Testing**
  - Chrome
  - Firefox
  - Safari
  - Edge

#### 5.6 Documentation

- [ ] **User Guide** (in-app help)
  - Getting started
  - How to create a podcast
  - How to manage subscription
  - API keys usage

- [ ] **Legal Pages**
  - Terms of Service
  - Privacy Policy
  - Cookie Policy
  - Refund Policy

- [ ] **Help Center / FAQ**
  - Common questions
  - Troubleshooting guide

### DevOps Tasks

#### 5.1 Deployment Setup

- [ ] **Backend Deployment**
  - Choose platform (Railway, Render, Fly.io, AWS)
  - Configure environment variables
  - Set up database (managed PostgreSQL)
  - Set up Redis (managed Redis)
  - Configure S3/R2 bucket
  - Deploy API server
  - Deploy worker (separate dyno/service)

- [ ] **Frontend Deployment**
  - Deploy to Vercel (recommended for Next.js)
  - Or use Netlify, Cloudflare Pages
  - Configure environment variables
  - Set up custom domain
  - Configure CDN

- [ ] **Database Migrations**
  - Run production migrations
  - Backup strategy

- [ ] **Domain & DNS**
  - Configure custom domain
  - SSL certificates (auto with Vercel/hosting)
  - DNS records (A/CNAME)

#### 5.2 CI/CD Pipeline (Optional)

- [ ] **GitHub Actions**
  - Run tests on PR
  - Lint and type-check
  - Auto-deploy on merge to main

- [ ] **Automated Backups**
  - Database backups (daily)
  - S3 versioning enabled

#### 5.3 Monitoring & Alerts

- [ ] **Error Tracking**
  - Sentry for both frontend and backend
  - Configure alerts

- [ ] **Uptime Monitoring**
  - UptimeRobot or similar
  - Monitor API health endpoints
  - Alert on downtime

- [ ] **Analytics**
  - Google Analytics or Plausible
  - Track key metrics
  - Funnel analysis

**Deliverable:** Production-ready application deployed and monitored

---

## 📦 Phase 6: Launch & Iteration (Days 26-30)

**Goal:** Soft launch, gather feedback, iterate, and prepare for full launch

### Tasks

#### 6.1 Soft Launch

- [ ] **Beta Testing**
  - Invite 10-20 beta users
  - Provide free access or discounts
  - Gather feedback

- [ ] **Monitor Metrics**
  - Track errors and crashes
  - Monitor performance
  - Track user behavior

- [ ] **Bug Fixes**
  - Fix critical bugs immediately
  - Prioritize based on impact

#### 6.2 Feedback Collection

- [ ] **Feedback Form**
  - In-app feedback widget
  - Email feedback
  - Survey (Google Forms, Typeform)

- [ ] **Analytics Review**
  - Where do users drop off?
  - Which features are most used?
  - Conversion rates

#### 6.3 Iteration

- [ ] **Quick Wins**
  - Fix UX issues
  - Improve onboarding
  - Add missing tooltips

- [ ] **Feature Requests**
  - Prioritize by impact and effort
  - Implement top requests

#### 6.4 Marketing Preparation

- [ ] **Landing Page Optimization**
  - Clear value proposition
  - Social proof (testimonials)
  - CTA optimization

- [ ] **Content Marketing**
  - Blog posts
  - SEO optimization
  - Social media presence

- [ ] **Email Campaigns**
  - Welcome email series
  - Feature announcements
  - Re-engagement campaigns

#### 6.5 Full Launch

- [ ] **Press Release** (optional)
- [ ] **Product Hunt Launch**
- [ ] **Social Media Announcement**
- [ ] **Email List Announcement**

**Deliverable:** Fully launched SaaS with initial users and feedback loop

---

## 📊 Progress Tracking Template

### Weekly Checklist

**Week 1: Foundation & Auth**
- [ ] Phase 0 complete
- [ ] Phase 1 complete
- [ ] Can create account and log in
- [ ] Database schema deployed

**Week 2: Core Features**
- [ ] Phase 2 complete
- [ ] Can create and view podcasts
- [ ] Real-time progress working
- [ ] Job queue processing correctly

**Week 3: Billing & Advanced**
- [ ] Phase 3 complete
- [ ] Can upgrade subscription
- [ ] Webhooks from Dodo working
- [ ] Phase 4 started (API keys/webhooks)

**Week 4: Advanced & Polish**
- [ ] Phase 4 complete
- [ ] Analytics working
- [ ] Admin panel functional
- [ ] Phase 5 started (testing/polish)

**Week 5: Production & Launch**
- [ ] Phase 5 complete
- [ ] Deployed to production
- [ ] All critical bugs fixed
- [ ] Beta users onboarded

**Week 6: Launch & Scale**
- [ ] Phase 6 complete
- [ ] Full launch executed
- [ ] Monitoring all green
- [ ] Ready to scale

---

## 🚨 Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| OpenAI API rate limits | High | Medium | Implement queue with backoff, use multiple keys |
| TTS API failures | High | Medium | Retry logic, fallback providers |
| S3 upload failures | Medium | Low | Retry with exponential backoff |
| Database connection issues | High | Low | Connection pooling, health checks |
| Redis failures | Medium | Low | Graceful degradation, job persistence |
| Webhook delivery failures | Low | Medium | Retry mechanism, delivery logs |

### Business Risks

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| No user adoption | High | Medium | Beta testing, marketing strategy |
| Payment processing issues | High | Low | Thorough testing, Dodo support |
| Competitors | Medium | High | Unique features, better UX |
| Cost overruns | Medium | Medium | Monitor costs, set alerts |

---

## 💡 Post-Launch Roadmap

### Phase 7: Enhancements (Month 2)

- [ ] Voice cloning integration
- [ ] Custom voice uploads
- [ ] Team/organization accounts
- [ ] Bulk podcast generation
- [ ] API rate limit increase for higher tiers
- [ ] Export to multiple platforms (Spotify, Apple Podcasts)

### Phase 8: Scale (Month 3+)

- [ ] Multi-language support
- [ ] Advanced analytics (listener insights)
- [ ] White-label solution for enterprises
- [ ] Mobile app (React Native)
- [ ] Integrations (Notion, Google Docs, etc.)

---

## 📞 Support & Resources

### Documentation
- Backend Plan: [backend-implementation-plan.md](./backend-implementation-plan.md)
- Frontend Plan: [frontend-implementation-plan.md](./frontend-implementation-plan.md)

### External Resources
- [Dodo Payments Docs](https://docs.dodopayments.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [BullMQ Docs](https://docs.bullmq.io)
- [Next.js Docs](https://nextjs.org/docs)
- [Better Auth Docs](https://www.better-auth.com/docs)

---

**Last Updated:** January 7, 2026
**Status:** Ready for Implementation 🚀

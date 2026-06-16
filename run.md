# Running PodNex Locally

This repo is a pnpm + Turborepo monorepo with:

- Frontend: Next.js app in `apps/web`
- Backend: Express API in `apps/api`
- Database package: Prisma schema in `packages/database`
- Redis package: queue connection in `packages/redis`

## 1. Prerequisites

Install these first:

```bash
node --version
pnpm --version
```

Required versions:

- Node.js `20` or newer
- pnpm `10.4.1` or compatible

You also need:

- PostgreSQL running locally or a hosted PostgreSQL database
- Redis running locally or a hosted Redis URL

## 2. Install Dependencies

From the repository root:

```bash
pnpm install
```

## 3. Create Environment Files

From the repository root:

```bash
cp .env.example .env
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
```

Create the frontend environment file:

```bash
touch apps/web/.env.local
```

Add this to `apps/web/.env.local`:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

## 4. Fill Required Environment Values

Edit `.env`, `packages/database/.env`, and `apps/api/.env`.

At minimum, set these values:

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="replace-with-generated-secret"
DATABASE_URL="postgresql://user:password@localhost:5432/podnex?sslmode=prefer"
REDIS_URL="redis://localhost:6379"
OPENAI_API_KEY="your-openai-api-key"
TTS_PROVIDER="unreal"
UNREAL_SPEECH_API_KEY="your-unreal-speech-api-key"
AWS_ACCESS_KEY_ID="your-aws-access-key-id"
AWS_SECRET_ACCESS_KEY="your-aws-secret-access-key"
AWS_REGION="us-east-1"
S3_BUCKET_NAME="your-bucket-name"
```

Generate `BETTER_AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

Use the same `DATABASE_URL` in:

- `.env`
- `packages/database/.env`

Use the same auth/backend values in:

- `.env`
- `apps/api/.env`

## 5. Prepare The Database

Make sure PostgreSQL is running and the database in `DATABASE_URL` exists.

Then run:

```bash
pnpm db:generate
pnpm db:push
```

## 6. Start Redis

If you use local Redis, start it before running the backend.

The backend defaults to:

```env
REDIS_URL="redis://localhost:6379"
```

## 7. Run Frontend And Backend Together

From the repository root:

```bash
pnpm dev
```

This starts the Turborepo dev pipeline. The expected local URLs are:

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001`
- Backend health check: `http://localhost:3001/api/health`

## 8. Run Frontend And Backend Separately

Use this if you want separate terminal output for each app.

Terminal 1, backend:

```bash
pnpm --filter @repo/api dev
```

Terminal 2, frontend:

```bash
pnpm --filter web dev
```

Open:

```text
http://localhost:3000
```

## 9. Production Build Check

From the repository root:

```bash
pnpm build
```

To build only the backend:

```bash
pnpm --filter @repo/api build
```

To build only the frontend:

```bash
pnpm --filter web build
```

## 10. Common Commands

```bash
pnpm dev
pnpm build
pnpm lint
pnpm db:generate
pnpm db:push
pnpm db:studio
```

## Troubleshooting

If the frontend cannot reach the backend, check:

```env
NEXT_PUBLIC_BACKEND_URL="http://localhost:3001"
```

If authentication cookies fail, check:

```env
FRONTEND_URL="http://localhost:3000"
BETTER_AUTH_URL="http://localhost:3001"
BETTER_AUTH_SECRET="same-secret-in-root-and-api-env"
```

If podcast generation jobs do not run, check that Redis is running and `REDIS_URL` is correct.

If Prisma commands fail, check that PostgreSQL is running and `DATABASE_URL` is correct in both `.env` and `packages/database/.env`.

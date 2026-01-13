# Environment Setup Guide

This guide explains how to set up environment variables for the PodNex application.

## Quick Start

1. **Copy example files to create your local environment files:**

```bash
# Root directory
cp .env.example .env

# Database package
cp packages/database/.env.example packages/database/.env

# API backend
cp apps/api/.env.example apps/api/.env
```

2. **Update the values in each `.env` file with your actual credentials**

---

## Environment Files

### Root `.env`
Contains all environment variables for the entire monorepo. This is the main configuration file.

**Location:** `/.env`

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `OPENAI_API_KEY` - OpenAI API key for script generation
- `UNREAL_SPEECH_API_KEY` or `ELEVENLABS_API_KEY` - TTS provider API key
- `AWS_ACCESS_KEY_ID` & `AWS_SECRET_ACCESS_KEY` - AWS/S3 credentials
- `REDIS_URL` - Redis connection string (default: `redis://localhost:6379`)

**Optional Variables:**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth
- `WEBHOOK_URL` & `WEBHOOK_SECRET` - For webhook notifications
- `MONGODB_URI` - Legacy MongoDB connection (not required)

### Database Package `.env`
Contains only the database connection string for Prisma.

**Location:** `/packages/database/.env`

**Required Variables:**
- `DATABASE_URL` - PostgreSQL connection string

### API Backend `.env`
Contains backend-specific environment variables.

**Location:** `/apps/api/.env`

**Required Variables:**
- `FRONTEND_URL` - Frontend URL (default: `http://localhost:3000`)
- `BETTER_AUTH_URL` - Backend URL (default: `http://localhost:3001`)
- `BETTER_AUTH_SECRET` - Same as root `.env`
- `OPENAI_API_KEY` - OpenAI API key
- `TTS_PROVIDER` - Either `unreal` or `elevenlabs`
- TTS API keys based on provider
- AWS/S3 credentials

---

## Service-Specific Setup

### 1. Database (PostgreSQL)

**Option A: Neon (Recommended for Production)**
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `DATABASE_URL` in both `.env` files

**Option B: Local PostgreSQL**
```bash
# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL
brew services start postgresql@14

# Create database
createdb podnex

# Use this connection string:
DATABASE_URL="postgresql://localhost:5432/podnex"
```

### 2. Redis (Job Queue)

**Option A: Local Redis**
```bash
# Install Redis
brew install redis

# Start Redis
brew services start redis

# Use default connection:
REDIS_URL="redis://localhost:6379"
```

**Option B: Upstash (Cloud Redis)**
1. Sign up at https://upstash.com
2. Create a Redis database
3. Copy the connection string
4. Update `REDIS_URL`

### 3. OpenAI (Script Generation)

1. Sign up at https://platform.openai.com
2. Create an API key
3. Update `OPENAI_API_KEY`

**Pricing:** ~$0.01-0.05 per podcast script

### 4. TTS Provider

**Option A: Unreal Speech (Recommended - Cheaper)**
1. Sign up at https://unrealspeech.com
2. Create an API key
3. Set `TTS_PROVIDER="unreal"`
4. Update `UNREAL_SPEECH_API_KEY`

**Pricing:** ~$0.10-0.30 per podcast

**Option B: ElevenLabs (Higher Quality)**
1. Sign up at https://elevenlabs.io
2. Create an API key
3. Set `TTS_PROVIDER="elevenlabs"`
4. Update `ELEVENLABS_API_KEY`

**Pricing:** ~$0.50-1.50 per podcast

### 5. Storage (S3/R2)

**Option A: AWS S3**
1. Create an AWS account
2. Create an S3 bucket
3. Create IAM user with S3 access
4. Update AWS credentials

**Option B: Cloudflare R2 (Recommended - No Egress Fees)**
1. Sign up at https://cloudflare.com
2. Create an R2 bucket
3. Create API token
4. Update credentials and add:
   ```
   S3_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
   ```

**Option C: Local Storage (Development Only)**
- No setup required
- Audio files saved to `apps/api/public/podcasts/`
- Fallback is automatic if S3 fails

### 6. Better Auth Secret

Generate a secure secret:
```bash
openssl rand -base64 32
```

Update `BETTER_AUTH_SECRET` in both root and API `.env` files.

---

## Verification

After setting up all environment variables, verify your configuration:

```bash
# Check if all required variables are set
pnpm run check:env  # (if script exists)

# Or manually check:
cat .env | grep -v "^#" | grep -v "^$"
```

---

## Security Best Practices

1. **Never commit `.env` files to git**
   - Already configured in `.gitignore`
   - Only commit `.env.example` files

2. **Use different credentials for development and production**

3. **Rotate API keys regularly**

4. **Use environment-specific secrets**
   - Development: Can use test/sandbox keys
   - Production: Use production keys with proper limits

5. **Limit API key permissions**
   - AWS: Use IAM roles with minimal permissions
   - OpenAI: Set usage limits and alerts

---

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
pnpm --filter @repo/database db:push

# If connection fails, check:
# 1. Database is running
# 2. Connection string is correct
# 3. Firewall allows connection
# 4. SSL mode is correct
```

### Redis Connection Issues
```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# If fails, check:
# 1. Redis is running: brew services list
# 2. Port 6379 is not blocked
```

### API Key Issues
```bash
# Test OpenAI key
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"

# Should return list of models
```

---

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3001` | Backend server port |
| `NODE_ENV` | No | `development` | Environment mode |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Frontend URL |
| `BETTER_AUTH_URL` | Yes | `http://localhost:3001` | Backend URL |
| `BETTER_AUTH_SECRET` | Yes | - | Auth secret (32+ chars) |
| `DATABASE_URL` | Yes | - | PostgreSQL connection |
| `REDIS_URL` | Yes | `redis://localhost:6379` | Redis connection |
| `OPENAI_API_KEY` | Yes | - | OpenAI API key |
| `TTS_PROVIDER` | Yes | `unreal` | TTS provider choice |
| `UNREAL_SPEECH_API_KEY` | Conditional | - | If using Unreal Speech |
| `ELEVENLABS_API_KEY` | Conditional | - | If using ElevenLabs |
| `AWS_ACCESS_KEY_ID` | Yes* | - | AWS/S3 access key |
| `AWS_SECRET_ACCESS_KEY` | Yes* | - | AWS/S3 secret key |
| `AWS_REGION` | Yes* | `us-east-1` | AWS region |
| `S3_BUCKET_NAME` | Yes* | - | S3 bucket name |
| `S3_ENDPOINT` | No | - | For R2/S3-compatible |

\* Required for cloud storage. Local fallback available for development.

---

## Next Steps

After setting up environment variables:

1. Run database migrations:
   ```bash
   pnpm db:push
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Verify services are running:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Redis: Check with `redis-cli ping`

4. Test podcast creation through the UI

---

For more information, see the main [README.md](./README.md)

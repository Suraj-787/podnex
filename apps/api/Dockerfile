# syntax=docker/dockerfile:1
FROM node:20-slim

# Install system dependencies: ffmpeg for audio, openssl for Prisma
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm and tsx globally
RUN npm install -g pnpm@9 tsx

WORKDIR /app

# Copy workspace manifests for layer caching
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/database/package.json ./packages/database/
COPY packages/redis/package.json ./packages/redis/

# Install ALL dependencies (including dev — tsx is a devDep needed at runtime)
RUN pnpm install --frozen-lockfile

# Copy full source
COPY apps/api ./apps/api
COPY packages/database ./packages/database
COPY packages/redis ./packages/redis

# Generate Prisma client
RUN pnpm --filter @repo/database exec prisma generate

EXPOSE 3001

ENV NODE_ENV=production

# Run TypeScript directly via globally installed tsx
CMD ["tsx", "apps/api/src/index.ts"]

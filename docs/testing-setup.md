# Testing Setup Guide

## Overview

This document outlines the testing strategy and setup for PodNex.

## Testing Stack

- **Test Runner:** Vitest (fast, Vite-native)
- **Testing Library:** @testing-library/react (for React components)
- **Mocking:** Vitest built-in mocks
- **Coverage:** Vitest coverage (c8)

## Installation

### Backend Testing
```bash
cd apps/api
pnpm add -D vitest @vitest/ui
pnpm add -D @types/supertest supertest
```

### Frontend Testing
```bash
cd apps/web
pnpm add -D vitest @vitest/ui
pnpm add -D @testing-library/react @testing-library/jest-dom
pnpm add -D @testing-library/user-event
pnpm add -D jsdom
```

## Configuration

### Backend: `apps/api/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Frontend: `apps/web/vitest.config.ts`
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '.next/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Test Structure

### Backend Tests
```
apps/api/
├── src/
│   ├── services/
│   │   ├── podcast.service.ts
│   │   └── podcast.service.test.ts
│   ├── routes/
│   │   ├── podcast.routes.ts
│   │   └── podcast.routes.test.ts
│   └── test/
│       ├── setup.ts
│       ├── helpers.ts
│       └── mocks/
│           ├── prisma.ts
│           └── redis.ts
```

### Frontend Tests
```
apps/web/
├── src/
│   ├── components/
│   │   ├── PodcastCard.tsx
│   │   └── PodcastCard.test.tsx
│   ├── lib/
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   └── client.test.ts
│   └── test/
│       ├── setup.ts
│       └── utils.tsx
```

## Writing Tests

### Unit Test Example (Service)
```typescript
// apps/api/src/services/podcast.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PodcastService } from './podcast.service';
import { prismaMock } from '../test/mocks/prisma';

vi.mock('@repo/database', () => ({
  prisma: prismaMock,
}));

describe('PodcastService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a podcast and queue a job', async () => {
      const userId = 'user-123';
      const data = {
        noteContent: 'Test content',
        duration: 'SHORT' as const,
      };

      prismaMock.podcast.create.mockResolvedValue({
        id: 'podcast-123',
        userId,
        ...data,
        status: 'QUEUED',
        progress: 0,
      });

      const result = await PodcastService.create(userId, data);

      expect(result.id).toBe('podcast-123');
      expect(result.status).toBe('QUEUED');
      expect(prismaMock.podcast.create).toHaveBeenCalledOnce();
    });

    it('should throw error if subscription limit reached', async () => {
      const userId = 'user-123';
      const data = {
        noteContent: 'Test content',
        duration: 'SHORT' as const,
      };

      // Mock subscription limit check to fail
      vi.spyOn(SubscriptionService, 'checkLimits').mockResolvedValue({
        allowed: false,
        reason: 'Limit reached',
      });

      await expect(PodcastService.create(userId, data)).rejects.toThrow(
        'Limit reached'
      );
    });
  });
});
```

### Integration Test Example (API Route)
```typescript
// apps/api/src/routes/podcast.routes.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../index';

describe('POST /api/v1/podcasts', () => {
  let authToken: string;

  beforeAll(async () => {
    // Create test user and get auth token
    authToken = await getTestAuthToken();
  });

  it('should create a podcast when authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/podcasts')
      .set('Cookie', `better-auth.session_token=${authToken}`)
      .send({
        noteContent: 'A'.repeat(150), // Min 100 chars
        duration: 'SHORT',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.status).toBe('QUEUED');
  });

  it('should return 401 when not authenticated', async () => {
    const response = await request(app)
      .post('/api/v1/podcasts')
      .send({
        noteContent: 'Test content',
        duration: 'SHORT',
      });

    expect(response.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    const response = await request(app)
      .post('/api/v1/podcasts')
      .set('Cookie', `better-auth.session_token=${authToken}`)
      .send({
        noteContent: 'Too short', // Less than 100 chars
        duration: 'SHORT',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
```

### Component Test Example
```typescript
// apps/web/src/components/PodcastCard.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PodcastCard } from './PodcastCard';

describe('PodcastCard', () => {
  const mockPodcast = {
    id: '1',
    title: 'Test Podcast',
    status: 'COMPLETED' as const,
    duration: 'SHORT' as const,
    audioDuration: 5,
    createdAt: new Date('2024-01-01'),
    audioUrl: 'https://example.com/audio.mp3',
  };

  it('should render podcast title', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    expect(screen.getByText('Test Podcast')).toBeInTheDocument();
  });

  it('should show completed status badge', () => {
    render(<PodcastCard podcast={mockPodcast} />);
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should show progress bar for processing podcasts', () => {
    const processingPodcast = {
      ...mockPodcast,
      status: 'PROCESSING' as const,
      progress: 50,
    };

    render(<PodcastCard podcast={processingPodcast} />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });
});
```

## Test Helpers

### Backend: `apps/api/src/test/helpers.ts`
```typescript
import { prisma } from '@repo/database';

export async function createTestUser() {
  return await prisma.user.create({
    data: {
      email: `test-${Date.now()}@example.com`,
      name: 'Test User',
    },
  });
}

export async function getTestAuthToken() {
  // Create session and return token
  // Implementation depends on Better Auth setup
}

export async function cleanupTestData() {
  await prisma.podcast.deleteMany();
  await prisma.user.deleteMany();
}
```

### Frontend: `apps/web/src/test/utils.tsx`
```typescript
import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions
) {
  const queryClient = createTestQueryClient();

  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
    options
  );
}
```

## Running Tests

### Package.json Scripts
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch"
  }
}
```

### Commands
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with UI
pnpm test:ui

# Generate coverage report
pnpm test:coverage

# Run specific test file
pnpm test podcast.service.test.ts

# Run tests matching pattern
pnpm test -t "should create podcast"
```

## Coverage Goals

- **Overall:** 70%+
- **Services:** 80%+
- **Routes:** 70%+
- **Components:** 60%+
- **Utils:** 90%+

## Best Practices

### Do's ✅
- Write tests alongside code
- Test behavior, not implementation
- Use descriptive test names
- Keep tests simple and focused
- Mock external dependencies
- Clean up after tests
- Test edge cases and errors

### Don'ts ❌
- Don't test implementation details
- Don't write brittle tests
- Don't skip error cases
- Don't use real database in unit tests
- Don't test third-party libraries
- Don't duplicate tests

## CI Integration

Tests will run automatically on:
- Pull requests
- Pushes to development/main
- Before deployment

See `.github/workflows/test.yml` for CI configuration.

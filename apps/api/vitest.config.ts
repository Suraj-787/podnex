import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/__tests__/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/__tests__/**", "src/workers/**"],
    },
    // Run test files sequentially to avoid port conflicts
    pool: "forks",
    poolOptions: {
      forks: { singleFork: true },
    },
  },
});

import { Redis } from "ioredis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

export const redis = new Redis(url, {
  maxRetriesPerRequest: null, // Let BullMQ manage retries
  enableReadyCheck: false,    // Don't block on ready check
  lazyConnect: false,
  retryStrategy(times) {
    // Stop retrying after 10 attempts to avoid flooding event loop
    if (times > 10) {
      console.error("❌ Redis: max retries reached, giving up reconnection");
      return null; // null = stop retrying
    }
    // Exponential backoff: 500ms, 1s, 2s … up to 30s
    const delay = Math.min(times * 500, 30000);
    console.log(`⏳ Redis reconnecting in ${delay}ms (attempt ${times})`);
    return delay;
  },
  // Required for Upstash TLS (rediss://)
  tls: url.startsWith("rediss://") ? {} : undefined,
});

redis.on("connect", () => {
  console.log("✅ Redis connected");
});

redis.on("ready", () => {
  console.log("✅ Redis ready");
});

redis.on("error", (err) => {
  // Log but don't crash — errors are expected on disconnect/reconnect
  console.error("❌ Redis error:", err.message);
});

redis.on("close", () => {
  console.log("⚠️  Redis connection closed");
});

redis.on("reconnecting", () => {
  console.log("🔄 Redis reconnecting...");
});

export default redis;

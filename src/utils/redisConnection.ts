import Redis from "ioredis";

const redisUrl = process.env.RedisURL as string;
const isTls = redisUrl && redisUrl.startsWith("rediss://");

const redisDatabase = new Redis(redisUrl, {
  ...(isTls ? { tls: {} } : {}),
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableReadyCheck: true,
  enableOfflineQueue: true,
  maxRetriesPerRequest: null,
});

// Connection event listeners
redisDatabase.on("connect", () => {
  console.log("✓ Redis Connected Successfully");
});
redisDatabase.on("error", (err) => {
  console.error("✗ Redis Connection Error:", err.message);
});

redisDatabase.on("reconnecting", () => {
  console.log("⟳ Redis Reconnecting...");
});

// Wait for connection before export
redisDatabase.on("ready", () => {
  console.log("✓ Redis Ready");
});

export default redisDatabase;

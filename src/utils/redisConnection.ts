import Redis from "ioredis";

const redisHost =
  process.env.REDIS_HOST || "storyboard-high-knot.cloud.layerbase.dev";

let redisDatabase: Redis | null = null;
let eventHandlersAttached = false;

const createRedisClient = () => {
  if (redisDatabase) return redisDatabase;

  redisDatabase = new Redis({
    host: redisHost,
    port: Number(process.env.REDIS_PORT) || 6379,
    username: process.env.REDIS_USERNAME || undefined,
    password: process.env.REDIS_PASSWORD, // Add your password variable here
    maxRetriesPerRequest: null,
    tls: {
      servername: redisHost,
    },
  });

  if (!eventHandlersAttached) {
    eventHandlersAttached = true;

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
  }

  return redisDatabase;
};

const shutdownRedis = async () => {
  if (redisDatabase) {
    try {
      await redisDatabase.quit();
    } catch (error) {
      console.error("✗ Redis shutdown error:", error);
    }
  }
};

process.on("SIGINT", shutdownRedis);
process.on("SIGTERM", shutdownRedis);
process.on("beforeExit", shutdownRedis);

export default createRedisClient();

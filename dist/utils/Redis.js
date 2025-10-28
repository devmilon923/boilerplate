"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = void 0;
// src/utils/redis.ts
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
const logger_1 = require("../logger/logger");
// Initialize Redis client
const redisClient = new ioredis_1.default({
    host: config_1.REDIS_HOST,
    port: Number(config_1.REDIS_PORT),
    password: config_1.REDIS_PASSWORD || undefined, // Optional
    db: Number(config_1.REDIS_DB) || 0, // Optional, default DB 0
    retryStrategy: (attempt) => {
        const delay = Math.min(attempt * 50, 2000); // Exponential backoff: 50ms, 100ms, ..., up to 2000ms
        logger_1.logger.warn(`Redis retry attempt ${attempt}. Reconnecting in ${delay}ms...`);
        return delay;
    },
    // Optional: Add more configurations as needed
});
// Event listeners for Redis
redisClient.on("connect", () => {
    logger_1.logger.info("📡 Redis connecting...");
});
redisClient.on("ready", () => {
    logger_1.logger.info("🔴 Redis client is ready to use");
});
redisClient.on("error", (err) => {
    logger_1.logger.error("Redis error:", err);
});
redisClient.on("close", () => {
    logger_1.logger.warn("Redis connection closed");
});
redisClient.on("reconnecting", (delay, attempt) => {
    logger_1.logger.info(`🔄 Reconnecting to Redis (Attempt ${attempt}, next retry in ${delay}ms)...`);
});
const connectRedis = () => {
    return new Promise((resolve, reject) => {
        redisClient.once("ready", () => {
            logger_1.logger.info("🚀 Redis connected successfully 🚀");
            resolve();
        });
        redisClient.once("error", (err) => {
            logger_1.logger.error("❌ Redis connection error during startup:", err);
            reject(err);
        });
    });
};
exports.connectRedis = connectRedis;
// export default redisClient;
//# sourceMappingURL=Redis.js.map
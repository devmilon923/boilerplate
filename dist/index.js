"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const socket_1 = require("./utils/socket");
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app")); // Express app
const config_1 = require("./config");
const DB_1 = __importStar(require("./DB")); // Seeding function
let server;
async function main() {
    try {
        const dbStartTime = Date.now();
        // Connect to MongoDB with a timeout
        await mongoose_1.default.connect(config_1.DATABASE_URL, {
            connectTimeoutMS: 10000, // 10 seconds timeout
        });
        console.log(`\r✅ Mongodb connected successfully in ${Date.now() - dbStartTime}ms`);
        // Start HTTP server
        server = (0, http_1.createServer)(app_1.default);
        const serverStartTime = Date.now();
        server.listen(config_1.PORT, () => {
            console.log(`🚀 Server is running on port ${config_1.PORT} and take ${Date.now() - serverStartTime}ms to start!`);
        });
        // Initialize Socket.IO
        (0, socket_1.initSocketIO)(server);
        // Start seeding in parallel after the server has started
        await Promise.all([
            (0, DB_1.default)(),
            (0, DB_1.seedPrivacy)(),
            (0, DB_1.seedTerms)(),
            (0, DB_1.seedAbout)(),
        ]);
    }
    catch (error) {
        console.error("Error in main function:", error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error("☠️ Unhandled error in main:", error);
    process.exit(1);
});
// Gracefully handle unhandled rejections and uncaught exceptions
process.on("unhandledRejection", (err) => {
    console.error(" ☠️ Unhandled promise rejection detected:", err);
    server.close(() => process.exit(1));
});
//no comment
process.on("uncaughtException", (error) => {
    console.error("☠️ Uncaught exception detected:", error);
    server.close(() => process.exit(1));
});
//# sourceMappingURL=index.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logHttpRequests = exports.logger = void 0;
const winston_1 = require("winston");
const colorette_1 = require("colorette");
exports.logger = (0, winston_1.createLogger)({
    level: "info", // Set the appropriate logging level
    format: winston_1.format.combine(winston_1.format.timestamp({ format: "DD-MM-YYYY HH:mm:ss" }), winston_1.format.errors({ stack: true }), winston_1.format.splat(), winston_1.format.json()),
    transports: [
        new winston_1.transports.Console({
            format: winston_1.format.combine(winston_1.format.colorize(), winston_1.format.simple()),
        }),
    ],
});
// Middleware to log HTTP requests
const logHttpRequests = (req, res, next) => {
    const startTime = Date.now();
    res.on("finish", () => {
        const colorizeByStatusCode = (statusCode) => {
            if (statusCode >= 200 && statusCode < 300) {
                return (0, colorette_1.green)(`${statusCode} 🎉`);
            }
            else if (statusCode >= 400 && statusCode < 500) {
                return (0, colorette_1.red)(`${statusCode} ⚠️`);
            }
            else if (statusCode >= 500) {
                return (0, colorette_1.yellowBright)(`${statusCode} 🔥`);
            }
            return (0, colorette_1.blue)(`${statusCode} ❗`);
        };
        const colorizeByMethod = (method) => {
            if (method === "GET") {
                return (0, colorette_1.green)(method + " 🔍");
            }
            else if (method === "POST") {
                return (0, colorette_1.blue)(method + " ✏️");
            }
            else if (method === "PATCH") {
                return (0, colorette_1.yellowBright)(method + " ✨");
            }
            else if (method === "PUT") {
                return (0, colorette_1.yellow)(method + " 🛠️");
            }
            else if (method === "DELETE") {
                return (0, colorette_1.red)(method + " ❌");
            }
            return (0, colorette_1.magenta)(method + " Unknown 😢☹️");
        };
        const clientIp = req.ip
            ? req.ip.startsWith("::ffff:")
                ? req.ip.substring(7)
                : req.ip
            : "Unknown IP";
        exports.logger.info({
            message: `🖥️ IP: ${clientIp} 🌐 ${colorizeByMethod(req.method)} ${colorizeByStatusCode(res.statusCode)} ${(0, colorette_1.magenta)(req.originalUrl)} ⏱️ Response Time: ${(0, colorette_1.yellowBright)(`${Date.now() - startTime} ms`)}`,
            size: res.get("Content-Length") || 0,
        });
    });
    next();
};
exports.logHttpRequests = logHttpRequests;
//# sourceMappingURL=logger.js.map
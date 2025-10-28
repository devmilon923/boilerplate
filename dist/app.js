"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const globalErrorHandler_1 = __importDefault(require("./middlewares/globalErrorHandler"));
const notFound_1 = __importDefault(require("./middlewares/notFound"));
const routes_1 = __importDefault(require("./routes"));
const logger_1 = require("./logger/logger");
const rootTemplate_1 = require("./rootTemplate");
const app = (0, express_1.default)();
app.use(logger_1.logHttpRequests);
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)({
    origin: "*",
    credentials: true,
}));
app.use(express_1.default.static("public"));
app.use(routes_1.default);
app.get("/", (req, res) => {
    logger_1.logger.info("Root endpoint hit 🌐 :");
    res.status(200).send(rootTemplate_1.template);
});
app.all("*", notFound_1.default);
app.use(globalErrorHandler_1.default);
// Log errors
app.use((err, req, res, next) => {
    logger_1.logger.error(`Error occurred: ${err.message}`, { stack: err.stack });
    next(err);
});
exports.default = app;
//# sourceMappingURL=app.js.map
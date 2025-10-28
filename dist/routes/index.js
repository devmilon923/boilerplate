"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const routesConfig_1 = require("./routesConfig");
const router = express_1.default.Router();
routesConfig_1.routesConfig.forEach(({ path, handler }) => router.use(path, handler));
exports.default = router;

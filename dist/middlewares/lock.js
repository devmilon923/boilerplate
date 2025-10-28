"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateUserLockStatus = void 0;
const http_status_1 = __importDefault(require("http-status"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const validateUserLockStatus = async (user) => {
    if (user?.blockStatus === null || user?.blockStatus <= new Date()) {
        return true;
    }
    else {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Your account is temporarily blocked");
    }
};
exports.validateUserLockStatus = validateUserLockStatus;

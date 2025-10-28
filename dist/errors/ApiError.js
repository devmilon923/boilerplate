"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ApiError extends Error {
    constructor(statusCode, message, errorDetails, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.errorDetails = errorDetails || { path: null, value: null };
        // Remove stack trace completely
        Object.defineProperty(this, "stack", { value: undefined });
    }
}
exports.default = ApiError;

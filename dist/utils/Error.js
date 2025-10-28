"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomError = void 0;
class CustomError extends Error {
    statusCode;
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.name = "CustomError";
        Object.setPrototypeOf(this, new.target.prototype); // Restore prototype chain
    }
}
exports.CustomError = CustomError;

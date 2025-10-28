"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendError = (res, { statusCode, success = false, message }) => {
    res.status(statusCode).send({
        success,
        status: statusCode,
        message: message,
    });
};
exports.default = sendError;
//# sourceMappingURL=sendError.js.map
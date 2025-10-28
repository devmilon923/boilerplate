"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlerDuplicateError = (err) => {
    const regex = /"(.*?)"/;
    const matches = err.message.match(regex);
    return {
        success: false,
        statusCode: 409,
        errorType: "Duplicate Error",
        errorMessage: `${matches[1]} is already exists!`,
        errorDetails: { err },
    };
};
exports.default = handlerDuplicateError;
//# sourceMappingURL=handleDuplicateError.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handlerCastError = (err) => {
    return {
        success: false,
        statusCode: 400,
        errorType: "Invalid Id",
        errorMessage: `${err.value} is not a valid ID!`,
        errorDetails: { ...err },
    };
};
exports.default = handlerCastError;
//# sourceMappingURL=handleCastError.js.map
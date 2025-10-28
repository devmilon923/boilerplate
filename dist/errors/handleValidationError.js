"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const handleValidationError = (err) => {
    const errorMessageArray = Object.values(err.errors).map((val) => (val === null || val === void 0 ? void 0 : val.path) + (val.name === "CastError" ? " will be " : " is ") + val.kind);
    return {
        success: false,
        statusCode: 400,
        errorType: "Validation Error",
        errorMessage: errorMessageArray.join(". "),
        errorDetails: Object.assign({}, err),
    };
};
exports.default = handleValidationError;

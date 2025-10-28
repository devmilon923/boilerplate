"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zod_1 = require("zod");
const handleZodError_1 = __importDefault(require("../errors/handleZodError"));
const mongoose_1 = __importDefault(require("mongoose"));
const handleValidationError_1 = __importDefault(require("../errors/handleValidationError"));
const handleCastError_1 = __importDefault(require("../errors/handleCastError"));
const handleDuplicateError_1 = __importDefault(require("../errors/handleDuplicateError"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const errorTypeMap = {
    400: "Bad Request",
    401: "Unauthorized",
    402: "Payment Required",
    403: "Forbidden",
    404: "Not Found",
    405: "Method Not Allowed",
    406: "Not Acceptable",
    407: "Proxy Authentication Required",
    408: "Request Timeout",
    409: "Conflict",
    410: "Gone",
    411: "Length Required",
    412: "Precondition Failed",
    413: "Payload Too Large",
    414: "URI Too Long",
    415: "Unsupported Media Type",
    416: "Range Not Satisfiable",
    417: "Expectation Failed",
    418: "I'm a Teapot",
    422: "Unprocessable Entity",
    423: "Locked",
    424: "Failed Dependency",
    425: "Too Early",
    426: "Upgrade Required",
    428: "Precondition Required",
    429: "Too Many Requests",
    431: "Request Header Fields Too Large",
    451: "Unavailable For Legal Reasons",
    498: "Session Expired",
    499: "Client Closed Request",
    500: "Internal Server Error",
    501: "Not Implemented",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
    505: "HTTP Version Not Supported",
    506: "Variant Also Negotiates",
    507: "Insufficient Storage",
    508: "Loop Detected",
    510: "Not Extended",
    511: "Network Authentication Required",
};
const globalErrorHandler = (error, req, res, next) => {
    let errorInfo = {
        success: false,
        statusCode: 500,
        errorType: "Invalid request",
        errorMessage: "",
        errorDetails: { path: null, value: null },
    };
    // 1. Check for ApiError first
    if (error instanceof ApiError_1.default) {
        errorInfo.statusCode = error.statusCode;
        errorInfo.errorMessage = error.message;
        errorInfo.errorDetails = error.errorDetails || { path: null, value: null };
        // 2. Then check the other known error types
    }
    else if (error instanceof zod_1.ZodError) {
        errorInfo = (0, handleZodError_1.default)(error);
    }
    else if (error instanceof mongoose_1.default.Error.ValidationError) {
        errorInfo = (0, handleValidationError_1.default)(error);
    }
    else if (error instanceof mongoose_1.default.Error.CastError) {
        errorInfo = (0, handleCastError_1.default)(error);
    }
    else if (error?.code === 11000) {
        errorInfo = (0, handleDuplicateError_1.default)(error);
        // 3. Finally, any generic errors
    }
    else if (error instanceof Error) {
        // console.log(error,"-----error")
        errorInfo.errorMessage = error.message;
    }
    // Dynamically set errorType based on statusCode
    errorInfo.errorType = errorTypeMap[errorInfo.statusCode] || "Unknown Error";
    // Return the JSON response
    //console.log(first)
    return res.status(errorInfo.statusCode).json({
        success: errorInfo.success,
        path: req.originalUrl,
        status: errorInfo.statusCode,
        errorType: errorInfo.errorType,
        message: errorInfo.errorMessage,
        // errorDetails: errorInfo.errorDetails,
        // stack is hidden unless in dev
        //stack: NODE_ENV === "development" ? error.stack : null,
    });
};
exports.default = globalErrorHandler;

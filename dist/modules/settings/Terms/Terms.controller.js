"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTerms = exports.getAllTerms = exports.createTerms = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendError_1 = __importDefault(require("../../../utils/sendError"));
const Terms_service_1 = require("./Terms.service");
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const user_utils_1 = require("../../user/user.utils");
const JwtToken_1 = require("../../../utils/JwtToken");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
exports.createTerms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error);
    }
    const userId = decoded.id; // Assuming the token contains the userId
    // Find the user by userId
    const user = yield (0, user_utils_1.findUserById)(userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const { description } = req.body;
    const sanitizedContent = (0, sanitize_html_1.default)(description);
    if (!description) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Description is required!");
    }
    const result = yield (0, Terms_service_1.createTermsInDB)({ sanitizedContent });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Terms created successfully.",
        data: result,
    });
}));
exports.getAllTerms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, Terms_service_1.getAllTermsFromDB)();
    const responseData = result[0];
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Terms retrieved successfully.",
        data: responseData,
    });
}));
exports.updateTerms = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error);
    }
    const userId = decoded.id;
    // Find the user by userId
    const user = yield (0, user_utils_1.findUserById)(userId);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    }
    const { description } = req.body;
    if (!description) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Description is required.");
    }
    const sanitizedDescription = (0, sanitize_html_1.default)(description);
    // Assume you're updating the terms based on the sanitized description
    const result = yield (0, Terms_service_1.updateTermsInDB)(sanitizedDescription);
    if (!result) {
        // return sendError(res, {
        //   statusCode: httpStatus.INTERNAL_SERVER_ERROR,
        //   message: "Failed to update terms.",
        // });
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Failed to update terms.");
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Terms updated successfully.",
        data: result,
    });
}));

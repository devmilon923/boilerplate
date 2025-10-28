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
exports.updateAbout = exports.getAllAbout = exports.createAbout = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendError_1 = __importDefault(require("../../../utils/sendError"));
const sendResponse_1 = __importDefault(require("../../../utils/sendResponse"));
const user_utils_1 = require("../../user/user.utils");
const catchAsync_1 = __importDefault(require("../../../utils/catchAsync"));
const sanitize_html_1 = __importDefault(require("sanitize-html"));
const About_service_1 = require("./About.service");
const JwtToken_1 = require("../../../utils/JwtToken");
exports.createAbout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            message: "User not found.",
        });
    }
    const { description } = req.body;
    const sanitizedContent = (0, sanitize_html_1.default)(description);
    if (!description) {
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Description is required!",
        });
    }
    const result = yield (0, About_service_1.createAboutInDB)({ sanitizedContent });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "About created successfully.",
        data: result,
    });
}));
exports.getAllAbout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield (0, About_service_1.getAllAboutFromDB)();
    const responseData = result[0];
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "About retrieved successfully.",
        data: responseData,
    });
}));
exports.updateAbout = (0, catchAsync_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            message: "User not found.",
        });
    }
    const { description } = req.body;
    if (!description) {
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Description is required.",
        });
    }
    const sanitizedDescription = (0, sanitize_html_1.default)(description);
    const result = yield (0, About_service_1.updateAboutInDB)(sanitizedDescription);
    if (!result) {
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.INTERNAL_SERVER_ERROR,
            message: "Failed to update terms.",
        });
    }
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "About updated successfully.",
        data: result,
    });
}));

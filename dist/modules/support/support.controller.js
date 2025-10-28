"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSupport = exports.getSupport = exports.needSupport = void 0;
const http_status_1 = __importDefault(require("http-status"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const sendError_1 = __importDefault(require("../../utils/sendError"));
const user_utils_1 = require("../user/user.utils");
const JwtToken_1 = require("../../utils/JwtToken");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const support_service_1 = require("./support.service");
const socket_1 = require("../../utils/socket");
const mongoose_1 = __importDefault(require("mongoose"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const paginationBuilder_1 = __importDefault(require("../../utils/paginationBuilder"));
exports.needSupport = (0, catchAsync_1.default)(async (req, res) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error);
    }
    const userId = decoded.id;
    const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
    const { supportMsg } = req.body;
    if (!supportMsg) {
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "What kind of support do you want?",
        });
    }
    // Find the user and their role
    const user = await (0, user_utils_1.findUserById)(userId);
    if (!user) {
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            message: "User not found.",
        });
    }
    const name = user.name;
    const email = user.email;
    const msg = supportMsg;
    await (0, support_service_1.createSupportService)(name, email, msg);
    // Success response
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Your support request has been received. We will review it and get back to you shortly.",
        data: null, // returning the updated user with the supportMsg field updated
    });
    //--------------------------> emit function <-------------------------
    // Define notification messages
    const userMsg = "💡 Our support team has received your message and will get back to you shortly. 🚀";
    const primaryMsg = `🌟 A user has requested support:👤Name:${name} ✉️ Email: ${email} `;
    await (0, socket_1.emitNotification)({
        userId: userObjectId, // Pass userId as required by your emitNotification function
        userMsg: userMsg,
        adminMsgTittle: "🔔 **Support Request Alert!**",
        userMsgTittle: "📬 Thank you for reaching out! ",
        adminMsg: primaryMsg,
    });
    //--------------------------> emit function <-------------------------
});
exports.getSupport = (0, catchAsync_1.default)(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { support, totalSupport } = await (0, support_service_1.supportList)(page, limit);
    const pagination = (0, paginationBuilder_1.default)({
        totalData: totalSupport,
        currentPage: page,
        limit,
    });
    // Patch: convert null to 0 for prevPage/nextPage to match expected type
    const patchedPagination = {
        ...pagination,
        prevPage: pagination.prevPage ?? 0,
        nextPage: pagination.nextPage ?? 0,
        limit,
        totalItem: pagination.totalData,
    };
    if (support.length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NO_CONTENT,
            success: false,
            message: "No support found in this area",
            data: [],
            pagination: patchedPagination,
        });
    }
    const responseData = support.map((support) => {
        return {
            _id: support._id,
            name: support.name,
            email: support.email,
            msg: support.msg,
            createdAt: support.createdAt,
        };
    });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "All supports retrived successfully",
        data: responseData,
        pagination: patchedPagination,
    });
});
exports.deleteSupport = (0, catchAsync_1.default)(async (req, res) => {
    const id = req.query?.supportId;
    const support = await (0, support_service_1.findSupportId)(id);
    if (!support) {
        // return sendError(res, {
        //   statusCode: httpStatus.NOT_FOUND,
        //   message: "support not found .",
        // });
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "support not found .");
    }
    if (support.isDeleted) {
        // return sendError(res, {
        //   statusCode: httpStatus.NOT_FOUND,
        //   message: "This support is  already deleted.",
        // });
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "This support is  already deleted.");
    }
    await (0, support_service_1.supportDelete)(id);
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "support deleted successfully",
        data: null,
    });
});
//# sourceMappingURL=support.controller.js.map
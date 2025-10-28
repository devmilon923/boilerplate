"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const mongoose_1 = require("mongoose");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const admin_service_1 = require("./admin.service");
const changeUserStatus = (0, catchAsync_1.default)(async (req, res) => {
    const { days } = req.query;
    if (!days)
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Days is required if you want to suspend anyone!");
    const updateStatus = await admin_service_1.AdminService.updateStatus(new mongoose_1.Types.ObjectId(req.params?.userId), Number(days));
    return (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "User suspention action perform.",
        data: updateStatus,
    });
});
exports.AdminController = {
    changeUserStatus,
};

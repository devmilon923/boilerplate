"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminSendPushNotification = exports.getUnreadBadgeCount = exports.getMyNotification = void 0;
const http_status_1 = __importDefault(require("http-status"));
const user_utils_1 = require("../user/user.utils");
const notification_model_1 = require("./notification.model");
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendError_1 = __importDefault(require("../../utils/sendError"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const pushNotification_controller_1 = require("./pushNotification/pushNotification.controller");
const paginationBuilder_1 = __importDefault(require("../../utils/paginationBuilder"));
// --- Role-based notification config ---
const roleNotificationConfig = {
    admin: {
        queryKey: "adminId",
        selectFields: "adminMsgTittle adminMsg createdAt updatedAt",
        readField: "isAdminRead",
        msgField: "adminMsg",
    },
    user: {
        queryKey: "userId",
        selectFields: "userMsg userMsgTittle createdAt updatedAt",
        readField: "isUserRead",
        msgField: "userMsg",
    },
};
exports.getMyNotification = (0, catchAsync_1.default)(async (req, res) => {
    const auth = req.user;
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    if (!auth)
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Unauthorized");
    const user = await (0, user_utils_1.findUserById)(auth.id);
    if (!user)
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found.");
    const config = roleNotificationConfig[user.role];
    if (!config) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid user role.");
    }
    const query = { [config.queryKey]: user._id };
    const selectFields = config.selectFields;
    const readField = config.readField;
    const msgField = config.msgField;
    // Fetch notifications
    const notifications = await notification_model_1.NotificationModel.find(query)
        .select(selectFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();
    const totalNotifications = await notification_model_1.NotificationModel.countDocuments(query).exec();
    const pagination = (0, paginationBuilder_1.default)({
        totalData: totalNotifications,
        currentPage: page,
        limit,
    });
    const formattedNotifications = notifications.map((notification) => ({
        _id: notification._id,
        isReadable: notification[readField],
        msg: notification[msgField],
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
    }));
    if (formattedNotifications.length === 0) {
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.NOT_FOUND,
            success: true,
            message: "You have no notifications.",
            data: { notifications: [], pagination },
        });
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Here are your notifications.",
        data: {
            notifications: formattedNotifications,
            pagination,
        },
    });
    // Mark notifications as read
    await notification_model_1.NotificationModel.updateMany({ ...query, [readField]: false }, { $set: { [readField]: true } });
});
exports.getUnreadBadgeCount = (0, catchAsync_1.default)(async (req, res) => {
    const auth = req.user;
    const user = await (0, user_utils_1.findUserById)(auth.id);
    if (!user)
        throw new ApiError_1.default(404, "User not found");
    const config = roleNotificationConfig[user.role];
    if (!config) {
        return (0, sendError_1.default)(res, {
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Invalid user role.",
        });
    }
    const unreadCount = await notification_model_1.NotificationModel.countDocuments({
        [config.queryKey]: user._id,
        [config.readField]: false,
    }).exec();
    const rawNotifications = await notification_model_1.NotificationModel.find({
        [config.queryKey]: user._id,
        [config.msgField]: { $exists: true },
    })
        .sort({ createdAt: -1 })
        .limit(3)
        .select(`${config.msgField} createdAt`)
        .exec();
    const latestNotifications = rawNotifications.map((notification) => ({
        msg: notification[config.msgField] || "",
        createdAt: notification.createdAt,
    }));
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Unread badge count and latest notifications retrieved successfully.",
        data: {
            unreadCount,
            latestNotifications,
        },
    });
});
const adminSendPushNotification = async (req, res, next) => {
    try {
        const { fcmTokens, title, body } = req.body;
        if (!fcmTokens || !title || !body) {
            return res.status(400).json({
                message: "Missing required fields: fcmTokens, title, and body.",
            });
        }
        // Ensure fcmTokens is an array of strings
        let tokens = [];
        if (typeof fcmTokens === "string") {
            tokens = [fcmTokens];
        }
        else if (Array.isArray(fcmTokens)) {
            tokens = fcmTokens;
        }
        else {
            return res.status(400).json({
                message: "fcmTokens must be a string or an array of strings.",
            });
        }
        // Use the multicast helper to send notifications to all provided tokens
        const response = await (0, pushNotification_controller_1.sendPushNotificationToMultiple)(tokens, {
            title,
            body,
        });
        return res
            .status(200)
            .json({ message: "Push notifications sent successfully.", response });
    }
    catch (error) {
        next(error);
    }
};
exports.adminSendPushNotification = adminSendPushNotification;
//# sourceMappingURL=notification.controller.js.map
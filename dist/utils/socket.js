"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNotification = exports.io = exports.initSocketIO = exports.connectedUsers = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const user_model_1 = require("../modules/user/user.model"); // User model
const notification_model_1 = require("../modules/notifications/notification.model");
const JwtToken_1 = require("./JwtToken");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
// Initialize the Socket.IO server
let io;
exports.connectedUsers = {};
const initSocketIO = async (server) => {
    console.log("🔧 Initializing Socket.IO server 🔧");
    const { Server } = await import("socket.io");
    exports.io = io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    console.log("🎉 Socket.IO server initialized! 🎉");
    io.use(async (socket, next) => {
        // Extract token from headers (ensure your client sends it in headers)
        const token = socket.handshake.headers.token || null;
        if (!token) {
            return next(new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Authentication error: Token missing"));
        }
        const userDetails = (0, JwtToken_1.verifySocketToken)(token);
        if (!userDetails) {
            return next(new Error("Authentication error: Invalid token"));
        }
        const user = await user_model_1.UserModel.findOne({
            _id: new mongoose_1.default.Types.ObjectId(userDetails.id || "n/a"),
            isDeleted: false,
            isVerified: true,
        }).select("name email role");
        if (!user) {
            return next(new Error("Authentication error: User not found"));
        }
        socket.user = user;
        next();
    });
    io.on("connection", (socket) => {
        if (socket.user && socket.user._id) {
            exports.connectedUsers[socket.user._id.toString()] = { socketID: socket.id };
            console.log("Socket just connected:", {
                socketId: socket.id,
                userId: socket.user?._id,
                name: socket.user?.name,
                email: socket.user?.email,
                role: socket.user?.role,
            });
        }
        socket.on("disconnect", () => {
            if (socket.user?._id) {
                console.log(`${socket.user?.name} || ${socket.user?.email} || ${socket.user?._id} just disconnected with socket ID: ${socket.id}`);
                delete exports.connectedUsers[socket.user?._id];
            }
        });
    });
};
exports.initSocketIO = initSocketIO;
const emitNotification = async ({ userId, adminMsgTittle, userMsgTittle, userMsg, adminMsg, }) => {
    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }
    // Get the socket ID of the specific user
    const userSocket = exports.connectedUsers[userId.toString()];
    // Get admin IDs
    const admins = await user_model_1.UserModel.find({ role: "admin" }).select("_id");
    const adminIds = admins.map((admin) => admin._id.toString());
    // Notify the specific user
    if (userMsg && userSocket) {
        io.to(userSocket.socketID).emit(`notification`, {
            userId,
            message: userMsg,
        });
    }
    // Notify all admins
    if (adminMsg) {
        adminIds.forEach((adminId) => {
            const adminSocket = exports.connectedUsers[adminId];
            if (adminSocket) {
                io.to(adminSocket.socketID).emit(`notification`, {
                    adminId,
                    message: adminMsg,
                });
            }
        });
    }
    // Save notification to the database
    await notification_model_1.NotificationModel.create({
        userId,
        userMsg,
        adminId: adminIds,
        adminMsg,
        adminMsgTittle,
        userMsgTittle,
    });
};
exports.emitNotification = emitNotification;

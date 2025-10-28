"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const initSocketIO = (server) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("🔧 Initializing Socket.IO server 🔧");
    const { Server } = yield Promise.resolve().then(() => __importStar(require("socket.io")));
    exports.io = io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    console.log("🎉 Socket.IO server initialized! 🎉");
    io.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        // Extract token from headers (ensure your client sends it in headers)
        const token = socket.handshake.headers.token || null;
        if (!token) {
            return next(new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Authentication error: Token missing"));
        }
        const userDetails = (0, JwtToken_1.verifySocketToken)(token);
        if (!userDetails) {
            return next(new Error("Authentication error: Invalid token"));
        }
        const user = yield user_model_1.UserModel.findOne({
            _id: new mongoose_1.default.Types.ObjectId(userDetails.id || "n/a"),
            isDeleted: false,
            isVerified: true,
        }).select("name email role");
        if (!user) {
            return next(new Error("Authentication error: User not found"));
        }
        socket.user = user;
        next();
    }));
    io.on("connection", (socket) => {
        var _a, _b, _c, _d;
        if (socket.user && socket.user._id) {
            exports.connectedUsers[socket.user._id.toString()] = { socketID: socket.id };
            console.log("Socket just connected:", {
                socketId: socket.id,
                userId: (_a = socket.user) === null || _a === void 0 ? void 0 : _a._id,
                name: (_b = socket.user) === null || _b === void 0 ? void 0 : _b.name,
                email: (_c = socket.user) === null || _c === void 0 ? void 0 : _c.email,
                role: (_d = socket.user) === null || _d === void 0 ? void 0 : _d.role,
            });
        }
        socket.on("disconnect", () => {
            var _a, _b, _c, _d, _e;
            if ((_a = socket.user) === null || _a === void 0 ? void 0 : _a._id) {
                console.log(`${(_b = socket.user) === null || _b === void 0 ? void 0 : _b.name} || ${(_c = socket.user) === null || _c === void 0 ? void 0 : _c.email} || ${(_d = socket.user) === null || _d === void 0 ? void 0 : _d._id} just disconnected with socket ID: ${socket.id}`);
                delete exports.connectedUsers[(_e = socket.user) === null || _e === void 0 ? void 0 : _e._id];
            }
        });
    });
});
exports.initSocketIO = initSocketIO;
const emitNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, adminMsgTittle, userMsgTittle, userMsg, adminMsg, }) {
    if (!io) {
        throw new Error("Socket.IO is not initialized");
    }
    // Get the socket ID of the specific user
    const userSocket = exports.connectedUsers[userId.toString()];
    // Get admin IDs
    const admins = yield user_model_1.UserModel.find({ role: "admin" }).select("_id");
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
    yield notification_model_1.NotificationModel.create({
        userId,
        userMsg,
        adminId: adminIds,
        adminMsg,
        adminMsgTittle,
        userMsgTittle,
    });
});
exports.emitNotification = emitNotification;

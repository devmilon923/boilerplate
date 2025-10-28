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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPModel = exports.UserModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const role_1 = require("../../config/role");
const UserSchema = new mongoose_1.Schema({
    name: { type: String, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, trim: true },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        required: false,
        default: null,
    },
    address: { type: String, trim: true, default: null },
    blockStatus: {
        type: Date,
        required: false,
        default: null,
    },
    image: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: role_1.ERole,
        required: false,
        default: null,
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    fcmToken: { type: String, trim: true },
    isRequest: {
        type: String,
        enum: ["approve", "deny", "send"],
        default: "send",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
exports.UserModel = mongoose_1.default.models.User || mongoose_1.default.model("User", UserSchema);
UserSchema.index({ name: "text" });
UserSchema.index({ createdAt: 1 });
exports.UserModel.schema.index({ role: 1 });
const OTPSchema = new mongoose_1.Schema({
    email: { type: String, required: true, trim: true, index: true },
    otp: { type: String, required: true, trim: true },
    expiresAt: { type: Date, required: true, index: { expires: "1m" } },
});
exports.OTPModel = mongoose_1.default.model("OTP", OTPSchema);
OTPSchema.index({ email: 1, expiresAt: 1 });

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_model_1 = require("./user.model");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const user_utils_1 = require("./user.utils");
const http_status_1 = __importDefault(require("http-status"));
const JwtToken_1 = require("../../utils/JwtToken");
const paginationBuilder_1 = __importDefault(require("../../utils/paginationBuilder"));
const registerUserService = async (email) => {
    const start = Date.now();
    // Check if user is already registered and get OTP record in parallel
    const [isUserRegistered, otpRecord] = await Promise.all([
        (0, user_utils_1.findUserByEmail)(email),
        user_model_1.OTPModel.findOne({ email }).lean(),
    ]);
    if (isUserRegistered) {
        throw new ApiError_1.default(http_status_1.default.CONFLICT, "This account is already registered. Please log in or use a different account.");
    }
    // OTP handling logic
    const now = new Date();
    if (otpRecord && otpRecord.expiresAt > now) {
        const remainingTime = Math.floor((otpRecord.expiresAt.getTime() - now.getTime()) / 1000);
        throw new ApiError_1.default(http_status_1.default.TOO_MANY_REQUESTS, `Please wait ${remainingTime} seconds before requesting a new OTP.`);
    }
    // Generate and save OTP
    const otp = (0, user_utils_1.generateOTP)();
    return { otp };
};
const createUser = async ({ name, email, image, hashedPassword, fcmToken, role, }) => {
    try {
        const createdUser = new user_model_1.UserModel({
            name,
            email,
            image,
            password: hashedPassword,
            fcmToken,
            role,
        });
        await createdUser.save();
        return { createdUser };
    }
    catch (error) {
        console.error("User creation failed:", error);
        throw new ApiError_1.default(500, "User creation failed");
    }
};
const updateUserById = async (id, updateData) => {
    return user_model_1.UserModel.findByIdAndUpdate(id, updateData, { new: true });
};
const userDelete = async (id, email) => {
    const baseDeletedEmail = `deleted-account-${email}`;
    let deletedEmail = baseDeletedEmail;
    for (let counter = 1; await user_model_1.UserModel.exists({ email: deletedEmail }); counter++) {
        deletedEmail = `${baseDeletedEmail}-${counter}`;
    }
    await user_model_1.UserModel.findByIdAndUpdate(id, {
        isDeleted: true,
        email: deletedEmail,
    });
};
const verifyForgotPasswordOTPService = async (email, otp) => {
    const user = await (0, user_utils_1.findUserByEmail)(email);
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    const otpRecord = await user_model_1.OTPModel.findOne({ email });
    if (!otpRecord) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "OTP record not found!");
    }
    const currentTime = new Date();
    if (otpRecord.expiresAt < currentTime) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "OTP has expired");
    }
    if (otpRecord.otp !== otp) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Wrong OTP");
    }
    const userId = user._id;
    const token = (0, JwtToken_1.generateToken)({
        id: userId,
        role: user.role,
        email: user.email,
    });
    return { token };
};
const getAdminList = async (skip, limit, name) => {
    const query = {
        isDeleted: { $ne: true },
        role: { $in: ["primary", "secondary", "junior"] },
    };
    if (name) {
        query.name = { $regex: name, $options: "i" };
    }
    const pipeline = [
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                image: 1,
                name: 1,
                role: 1,
                email: 1,
                createdAt: 1,
                phone: 1,
                address: 1,
                _id: 1,
            },
        },
    ];
    const admins = await user_model_1.UserModel.aggregate(pipeline);
    const totalAdmins = await user_model_1.UserModel.countDocuments(query);
    const currentPage = Math.floor(skip / limit) + 1;
    const pagination = (0, paginationBuilder_1.default)({
        totalData: totalAdmins,
        currentPage,
        limit,
    });
    return { admins, pagination };
};
const getUserList = async (skip, limit, date, name, email, role, requestStatus) => {
    const query = {
        $and: [{ isDeleted: { $ne: true } }, { role: { $nin: ["admin"] } }],
    };
    if (date) {
        const [year, month, day] = date.split("-").map(Number);
        const startDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
        query.createdAt = { $gte: startDate, $lte: endDate };
    }
    if (name)
        query.name = { $regex: name, $options: "i" };
    if (role)
        query.role = { $regex: role, $options: "i" };
    if (requestStatus) {
        query.isRequest = { $regex: requestStatus, $options: "i" };
    }
    const pipeline = [
        { $match: query },
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $project: {
                image: 1,
                name: 1,
                email: 1,
                role: 1,
                createdAt: 1,
                phone: 1,
                address: 1,
                isRequest: 1,
                managerInfoId: 1,
                _id: 1,
            },
        },
    ];
    const users = (await user_model_1.UserModel.aggregate(pipeline));
    const totalUsers = await user_model_1.UserModel.countDocuments(query);
    const currentPage = Math.floor(skip / limit) + 1;
    const pagination = (0, paginationBuilder_1.default)({
        totalData: totalUsers,
        currentPage,
        limit,
    });
    return { users, pagination };
};
const verifyOTPService = async (otp, authorizationHeader) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(authorizationHeader);
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token");
    }
    const email = decoded.email;
    const dbOTP = await user_model_1.OTPModel.findOne({ email: email });
    if (!dbOTP || dbOTP.otp !== otp) {
        throw new ApiError_1.default(http_status_1.default.BAD_REQUEST, "Invalid or expired OTP");
    }
    const user = await user_model_1.UserModel.findOne({ email });
    if (!user) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found!");
    }
    const token = (0, JwtToken_1.generateToken)({
        id: user._id,
        role: user.role,
        email: user.email,
    });
    return { token, email, name: user.name, phone: user?.phone };
};
const UserService = {
    registerUserService,
    createUser,
    updateUserById,
    userDelete,
    verifyForgotPasswordOTPService,
    getAdminList,
    getUserList,
    verifyOTPService,
};
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendError_1 = __importDefault(require("../../utils/sendError"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const user_service_1 = require("./user.service");
const user_model_1 = require("./user.model");
const socket_1 = require("../../utils/socket");
const http_status_1 = __importDefault(require("http-status"));
// import RegisterShowerModel from "../RegisterShower/RegisterShower.model";
const argon2_1 = __importDefault(require("argon2"));
const user_utils_1 = require("./user.utils");
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const JwtToken_1 = require("../../utils/JwtToken");
const pushNotification_controller_1 = require("../notifications/pushNotification/pushNotification.controller");
const lock_1 = require("../../middlewares/lock");
const registerUser = (0, catchAsync_1.default)(async (req, res) => {
    const { name, email, password, fcmToken, role } = req.body;
    const { otp } = await user_service_1.UserService.registerUserService(name);
    const token = (0, JwtToken_1.generateRegisterToken)({ email });
    (async () => {
        try {
            const hashedPassword = await (0, user_utils_1.hashPassword)(password);
            let image = "";
            if (req.file) {
                const publicFileURL = `/images/${req.file.filename}`;
                image = publicFileURL;
            }
            const createdUser = await user_service_1.UserService.createUser({
                name,
                email,
                image,
                hashedPassword,
                fcmToken,
                role,
            });
            (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "OTP sent to your email. Please verify to continue registration.",
                data: { token: token },
            });
            await (0, user_utils_1.sendOTPEmailRegister)(name, email, otp);
            // Calculate OTP expiration (60 seconds from now)
            const now = new Date();
            const expiresAt = new Date(now.getTime() + 60 * 1000);
            // Save or update the OTP in the database concurrently.
            await Promise.all([
                user_model_1.OTPModel.findOneAndUpdate({ email }, { otp, expiresAt }, { upsert: true }),
                (0, user_utils_1.saveOTP)(email, otp),
            ]);
            // --------> Emit notification <----------------
            const user = createdUser?.createdUser;
            const notificationPayload = {
                userId: user?._id,
                userMsgTittle: "🎉 Registation Completed",
                adminMsgTittle: "📢 New User Regisation",
                userMsg: `💫 Welcome to ${process.env.AppName}, ${user?.name}! 🎉 Your registration is complete, and we're thrilled to have you onboard. Start exploring and enjoy the experience! 🚀`,
                adminMsg: `New user registration! 🎉 A new user, ${user?.name}, has successfully registered with ${process.env.AppName}. Please welcome them aboard and ensure everything is set up for their journey.`,
            };
            await (0, socket_1.emitNotification)(notificationPayload);
            if (fcmToken) {
                try {
                    // Define the base push message.
                    const pushMessage = {
                        title: "🎉 Welcome to Sweepy!",
                        body: `Hi ${name}, 🎉 Welcome to ${process.env.AppName}! Your registration is complete. We're excited to have you onboard!`,
                    };
                    await (0, pushNotification_controller_1.sendPushNotification)(fcmToken, pushMessage);
                }
                catch (pushError) {
                    // Log any push notification errors without affecting the client response.
                    console.error("Error sending push notification:", pushError);
                }
            }
        }
        catch (backgroundError) {
            console.error("Error in background tasks:", backgroundError?.message);
            return (0, sendResponse_1.default)(res, {
                statusCode: backgroundError?.statusCode,
                success: false,
                data: backgroundError?.message,
            });
        }
    })();
});
const resendOTP = (0, catchAsync_1.default)(async (req, res) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Invalid token");
    }
    const email = decoded.email;
    const now = new Date();
    const otpRecord = await user_model_1.OTPModel.findOne({ email });
    if (otpRecord && otpRecord.expiresAt > now) {
        const remainingTime = Math.floor((otpRecord.expiresAt.getTime() - now.getTime()) / 1000);
        throw new ApiError_1.default(http_status_1.default.FORBIDDEN, `You can't request another OTP before ${remainingTime} seconds.`);
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "A new OTP has been sent to your email.",
        data: null,
    });
    const otp = (0, user_utils_1.generateOTP)();
    (0, user_utils_1.resendOTPEmail)(email, otp)
        .then((res) => {
        console.log("Email Send");
    })
        .catch((err) => {
        console.log("Email not send");
    });
    await (0, user_utils_1.saveOTP)(email, otp); // Save the new OTP with expiration
});
const loginUser = (0, catchAsync_1.default)(async (req, res) => {
    const { email, password, role, fcmToken } = req.body;
    const user = await (0, user_utils_1.findUserByEmail)(email);
    if (!user) {
        throw new ApiError_1.default(404, "This account does not exist.");
    }
    if (user.isDeleted) {
        throw new ApiError_1.default(404, "your account is deleted.");
    }
    await (0, lock_1.validateUserLockStatus)(user);
    const userId = user._id;
    const token = (0, JwtToken_1.generateToken)({
        id: userId,
        email: user.email,
        role: user.role,
    });
    if (!user.isVerified) {
        (0, sendResponse_1.default)(res, {
            statusCode: 401,
            success: false,
            message: "We've sent an OTP to your email to verify your profile.",
            data: {
                isVerified: user.isVerified ? true : false,
                role: user.role,
                token,
            },
        });
        const name = user.name;
        const otp = (0, user_utils_1.generateOTP)();
        (0, user_utils_1.sendOTPEmailVerification)(name, email, otp)
            .then(() => {
            console.log("Email sent");
        })
            .catch((err) => {
            console.error("Error sending OTP email:", err);
        });
        return await (0, user_utils_1.saveOTP)(email, otp);
    }
    const isPasswordValid = await argon2_1.default.verify(user.password, password);
    if (!isPasswordValid) {
        throw new ApiError_1.default(401, "Wrong password!");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Login complete!",
        data: {
            user: {
                _id: user._id,
                name: user?.name,
                email: user?.email,
                image: user?.image || "",
                role: user?.role,
            },
            isVerified: user.isVerified ? true : false,
            token,
        },
    });
    if (fcmToken?.trim()) {
        user.fcmToken = fcmToken;
        await user.save();
    }
});
const forgotPassword = (0, catchAsync_1.default)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new ApiError_1.default(400, "Please provide an email.");
    }
    // await delCache(email);
    const user = await (0, user_utils_1.findUserByEmail)(email);
    if (!user) {
        throw new ApiError_1.default(404, "This account does not exist.");
    }
    const now = new Date();
    // Check if there's a pending OTP request and if the 2-minute cooldown has passed
    const otpRecord = await user_model_1.OTPModel.findOne({ email });
    if (otpRecord && otpRecord.expiresAt > now) {
        const remainingTime = Math.floor((otpRecord.expiresAt.getTime() - now.getTime()) / 1000);
        throw new ApiError_1.default(403, `You can't request another OTP before ${remainingTime} seconds.`);
    }
    const token = (0, JwtToken_1.generateRegisterToken)({ email });
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "OTP sent to your email. Please check!",
        data: { token },
    });
    const otp = (0, user_utils_1.generateOTP)();
    // await setCache(email, otp, 300);
    await (0, user_utils_1.sendResetOTPEmail)(email, otp, user.name);
    await (0, user_utils_1.saveOTP)(email, otp); // Save OTP with expiration
});
const resetPassword = (0, catchAsync_1.default)(async (req, res) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error);
    }
    // if (!decoded.role) {
    //   throw new ApiError(401, "Invalid token. Please try again.");
    // }
    const email = decoded.email;
    const { password } = req.body;
    if (!password) {
        throw new ApiError_1.default(400, "Please provide  password ");
    }
    (0, sendResponse_1.default)(res, {
        statusCode: http_status_1.default.OK,
        success: true,
        message: "Password reset successfully.",
        data: null,
    });
    const user = await (0, user_utils_1.findUserByEmail)(email);
    if (!user) {
        throw new ApiError_1.default(404, "User not found. Are you attempting something sneaky?");
    }
    const newPassword = await (0, user_utils_1.hashPassword)(password);
    user.password = newPassword;
    await user.save();
});
const verifyOTP = (0, catchAsync_1.default)(async (req, res) => {
    const { otp } = req.body;
    try {
        const { token, name, email, phone } = await user_service_1.UserService.verifyOTPService(otp, req.headers.authorization);
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.CREATED,
            success: true,
            message: "OTP Verified successfully.",
            data: { name, email, phone, token },
        });
        const user = await user_model_1.UserModel.findOne({ email });
        // Mark user as verified, if needed
        if (!user.isVerified) {
            user.isVerified = true;
            await user.save();
        }
    }
    catch (error) {
        throw new ApiError_1.default(500, error.message || "Failed to verify otp");
    }
});
const updateUser = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { name, ageRange, address } = req.body;
        let decoded = req.user;
        const userId = decoded.id;
        const user = await (0, user_utils_1.findUserById)(userId);
        if (!user) {
            throw new ApiError_1.default(404, "User not found.");
        }
        const updateData = {};
        if (name)
            updateData.name = name;
        if (ageRange)
            updateData.ageRange = ageRange;
        if (address)
            updateData.address = address;
        if (req.file) {
            const imagePath = `public\\images\\${req.file.filename}`;
            const publicFileURL = `/images/${req.file.filename}`;
            updateData.image = {
                path: imagePath,
                publicFileURL: publicFileURL,
            };
        }
        const updatedUser = await user_service_1.UserService.updateUserById(userId, updateData);
        const responseData = {
            _id: updatedUser?._id,
            name: updatedUser?.name,
            email: updatedUser?.email,
            address: updatedUser?.address,
            image: updatedUser?.image || "",
        };
        if (updatedUser) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.OK,
                success: true,
                message: "Profile updated.",
                data: responseData,
            });
        }
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Unexpected error occurred while updating user.");
    }
});
const getSelfInfo = (0, catchAsync_1.default)(async (req, res) => {
    try {
        let decoded = req.user;
        const userId = decoded.id;
        // Find the user in DB
        const user = await (0, user_utils_1.findUserById)(userId);
        if (!user) {
            throw new ApiError_1.default(404, "User not found.");
        }
        // Prepare base response (common fields)
        const responseData = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user?.address || "",
            image: user?.image || "",
            isVerified: user?.isVerified,
        };
        // Send final response
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Profile information retrieved successfully",
            data: responseData,
            pagination: undefined,
        });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message ||
            "Unexpected error occurred while retrieving user information.");
    }
});
const deleteUser = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const id = req.query?.id;
        const deleteableuser = await (0, user_utils_1.findUserById)(id);
        if (!deleteableuser) {
            throw new ApiError_1.default(404, "User not found.");
        }
        if (deleteableuser.isDeleted) {
            throw new ApiError_1.default(404, "This account is already deleted.");
        }
        if (req.user?.id !== id ||
            req.user?.role !== "admin") {
            throw new ApiError_1.default(403, "You cannot delete this account. Please contact support");
        }
        await user_service_1.UserService.userDelete(id, deleteableuser.email);
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Account deleted successfully",
            data: null,
        });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Unexpected error occurred while deleting the user.");
    }
});
const changePassword = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            throw new Error("Please provide both old password and new password.");
        }
        let decoded = req.user;
        const email = decoded.email;
        const user = await (0, user_utils_1.findUserByEmail)(email);
        if (!user) {
            throw new Error("User not found.");
        }
        const isMatch = await argon2_1.default.verify(user.password, oldPassword);
        if (!isMatch) {
            throw new ApiError_1.default(http_status_1.default.UNAUTHORIZED, "Old password is incorrect.");
        }
        const hashedNewPassword = await argon2_1.default.hash(newPassword);
        user.password = hashedNewPassword;
        await user.save();
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "You have successfully changed your password.",
            data: null,
        });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Failed to change password.");
    }
});
const adminloginUser = (0, catchAsync_1.default)(async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await (0, user_utils_1.findUserByEmail)(email);
        if (!user) {
            throw new ApiError_1.default(404, "This account does not exist.");
        }
        if (user.role !== "admin") {
            throw new ApiError_1.default(403, "Only admins can login.");
        }
        // Check password validity
        const isPasswordValid = await argon2_1.default.verify(user.password, password);
        if (!isPasswordValid) {
            throw new ApiError_1.default(401, "Wrong password!");
        }
        const userId = user._id;
        // Generate new token for the logged-in user
        const token = (0, JwtToken_1.generateToken)({
            id: userId,
            email: user.email,
            role: user.role,
        });
        return (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "Login complete!",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user?.image || "",
                },
                token,
            },
        });
    }
    catch (error) {
        throw new ApiError_1.default(error.statusCode || 500, error.message || "An error occurred during admin login.");
    }
});
//admin dashboard----------------------------------------------------------------------------------------
const getAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    let decoded;
    try {
        decoded = (0, JwtToken_1.verifyToken)(req.headers.authorization);
    }
    catch (error) {
        return (0, sendError_1.default)(res, error); // If token verification fails, send error response.
    }
    const adminId = decoded.id;
    // Verify if admin exists
    const user = await (0, user_utils_1.findUserById)(adminId);
    if (!user) {
        throw new ApiError_1.default(404, "This admin account does not exist.");
    }
    // Pagination and filters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { date, name, email, role, requestStatus } = req.query;
    try {
        // Get the user list based on pagination and filters
        const { users, pagination } = await user_service_1.UserService.getUserList(skip, limit, date, name, email, role, requestStatus);
        if (users.length === 0) {
            return (0, sendResponse_1.default)(res, {
                statusCode: http_status_1.default.NO_CONTENT,
                success: true,
                message: "No user found based on your search.",
                data: [],
                pagination: {
                    ...pagination,
                    prevPage: pagination.prevPage ?? 0,
                    nextPage: pagination.nextPage ?? 0,
                },
            });
        }
        // Populate manager info for each user
        const usersWithManagerInfo = await user_model_1.UserModel.populate(users, {
            path: "managerInfoId",
            select: "type businessAddress websiteLink governMentImage.publicFileURL",
        });
        // Format response data
        const responseData = usersWithManagerInfo.map((user) => ({
            _id: user._id,
            image: user.image?.publicFileURL,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            address: user.address,
            //isRequest: user.isRequest,
            managerInfo: user.managerInfoId
                ? {
                    type: user.managerInfoId.type,
                    businessAddress: user.managerInfoId.businessAddress,
                    websiteLink: user.managerInfoId.websiteLink,
                    governMentImage: user.managerInfoId.governMentImage?.publicFileURL,
                    isRequest: user.isRequest,
                }
                : null,
            createdAt: user.createdAt,
        }));
        // Send response with pagination details
        (0, sendResponse_1.default)(res, {
            statusCode: http_status_1.default.OK,
            success: true,
            message: "User list retrieved successfully",
            data: responseData,
            pagination: {
                ...pagination,
                prevPage: pagination.prevPage ?? 0,
                nextPage: pagination.nextPage ?? 0,
            },
        });
    }
    catch (error) {
        // Handle any errors during the user fetching or manager population
        throw new ApiError_1.default(error.statusCode || 500, error.message || "Failed to retrieve users.");
    }
});
const UserController = {
    registerUser,
    resendOTP,
    loginUser,
    forgotPassword,
    resetPassword,
    verifyOTP,
    updateUser,
    getSelfInfo,
    deleteUser,
    changePassword,
    adminloginUser,
    getAllUsers,
};
exports.UserController = UserController;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guardRole = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const guardRole = (roles) => {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            throw new ApiError_1.default(401, "Access denied. No token provided.");
        }
        try {
            // Decode token and cast it to IUserPayload
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
            // Attach the decoded payload to the request object
            req.user = decoded;
            const userRole = decoded.role;
            // Check if the user has one of the allowed roles
            if ((Array.isArray(roles) && roles.includes(userRole)) ||
                roles === userRole) {
                return next();
            }
            throw new ApiError_1.default(403, "You are not authorized to access this resource.");
        }
        catch (error) {
            throw new ApiError_1.default(498, "Session Expired");
        }
    };
};
exports.guardRole = guardRole;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRegisterToken = exports.verifyToken = void 0;
exports.generateToken = generateToken;
exports.verifySocketToken = verifySocketToken;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const http_status_1 = __importDefault(require("http-status"));
const jsonwebtoken_2 = __importDefault(require("jsonwebtoken"));
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const secret = config_1.JWT_SECRET_KEY;
if (!secret)
    throw new Error("JWT_SECRET is not defined");
function generateToken({ id, role, email, }) {
    return (0, jsonwebtoken_1.sign)({ id, role, email }, config_1.JWT_SECRET_KEY, {
        expiresIn: "7d",
    });
}
function verifySocketToken(token) {
    try {
        return (0, jsonwebtoken_1.verify)(token, secret);
    }
    catch (error) {
        console.error(error);
        return null;
    }
}
const verifyToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        const errorMessage = "No token provided or invalid format.";
        throw { statusCode: http_status_1.default.UNAUTHORIZED, message: errorMessage };
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_2.default.verify(token, config_1.JWT_SECRET_KEY);
        return decoded;
    }
    catch (error) {
        throw new ApiError_1.default(498, "Invalid or expired token.");
    }
};
exports.verifyToken = verifyToken;
const generateRegisterToken = (payload) => {
    return jsonwebtoken_2.default.sign(payload, config_1.JWT_SECRET_KEY, { expiresIn: "1h" });
};
exports.generateRegisterToken = generateRegisterToken;
//# sourceMappingURL=JwtToken.js.map
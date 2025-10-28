"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supportDelete = exports.findSupportId = exports.supportList = exports.createSupportService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const support_model_1 = __importDefault(require("./support.model"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const createSupportService = async (name, email, msg) => {
    try {
        const createdSupport = await support_model_1.default.create({
            name,
            email,
            msg,
        });
        return createdSupport;
    }
    catch (error) {
        // console.error(error, "---------->>");
        const statusCode = error.statusCode || http_status_1.default.INTERNAL_SERVER_ERROR;
        const message = error.message || "An error occurred while submitting the support msg.";
        throw new ApiError_1.default(statusCode, message);
    }
};
exports.createSupportService = createSupportService;
const supportList = async (page, limit) => {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };
    const support = await support_model_1.default
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by most recent
    const totalSupport = await support_model_1.default.countDocuments(filter);
    const totalPages = Math.ceil(totalSupport / limit);
    return { support, totalSupport, totalPages };
};
exports.supportList = supportList;
const findSupportId = async (id) => {
    return support_model_1.default.findById(id);
};
exports.findSupportId = findSupportId;
const supportDelete = async (id) => {
    await support_model_1.default.findByIdAndUpdate(id, {
        isDeleted: true,
    });
};
exports.supportDelete = supportDelete;
//# sourceMappingURL=support.service.js.map
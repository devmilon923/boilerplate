"use strict";
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
exports.supportDelete = exports.findSupportId = exports.supportList = exports.createSupportService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const support_model_1 = __importDefault(require("./support.model"));
const ApiError_1 = __importDefault(require("../../errors/ApiError"));
const createSupportService = (name, email, msg) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const createdSupport = yield support_model_1.default.create({
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
});
exports.createSupportService = createSupportService;
const supportList = (page, limit) => __awaiter(void 0, void 0, void 0, function* () {
    const skip = (page - 1) * limit;
    const filter = { isDeleted: false };
    const support = yield support_model_1.default
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }); // Sort by most recent
    const totalSupport = yield support_model_1.default.countDocuments(filter);
    const totalPages = Math.ceil(totalSupport / limit);
    return { support, totalSupport, totalPages };
});
exports.supportList = supportList;
const findSupportId = (id) => __awaiter(void 0, void 0, void 0, function* () {
    return support_model_1.default.findById(id);
});
exports.findSupportId = findSupportId;
const supportDelete = (id) => __awaiter(void 0, void 0, void 0, function* () {
    yield support_model_1.default.findByIdAndUpdate(id, {
        isDeleted: true,
    });
});
exports.supportDelete = supportDelete;

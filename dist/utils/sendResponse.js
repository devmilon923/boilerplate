"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sendResponse = (res, data) => {
    res.status(data.statusCode).json({
        success: data.success,
        status: data.statusCode,
        message: data?.message,
        pagination: data.pagination,
        data: data.data,
    });
};
exports.default = sendResponse;
//# sourceMappingURL=sendResponse.js.map
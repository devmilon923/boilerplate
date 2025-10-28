"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const notFound = (req, res) => {
    return res.status(404).json({
        status: "fail",
        statusCode: 404,
        message: `Route Not Found for ${req.originalUrl}`,
    });
};
exports.default = notFound;
//# sourceMappingURL=notFound.js.map
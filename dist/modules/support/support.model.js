"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define RegisterShowerSchema
const supportSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    msg: { type: String, required: true },
    isDeleted: { type: Boolean, default: false },
}, { timestamps: true });
// Create the RegisterShower model
const supportModel = (0, mongoose_1.model)("support", supportSchema);
exports.default = supportModel;
//# sourceMappingURL=support.model.js.map
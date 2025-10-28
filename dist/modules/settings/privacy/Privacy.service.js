"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePrivacyInDB = exports.getAllPrivacyFromDB = exports.createPrivacyInDB = void 0;
const Privacy_model_1 = require("./Privacy.model");
const createPrivacyInDB = async (privacyData) => {
    const newPrivacy = new Privacy_model_1.PrivacyModel({
        description: privacyData.sanitizedContent,
    });
    const savedPrivacy = await newPrivacy.save();
    return savedPrivacy;
};
exports.createPrivacyInDB = createPrivacyInDB;
const getAllPrivacyFromDB = async () => {
    const privacy = await Privacy_model_1.PrivacyModel.find().sort({ createdAt: -1 });
    return privacy;
};
exports.getAllPrivacyFromDB = getAllPrivacyFromDB;
const updatePrivacyInDB = async (newData) => {
    const updatedPrivacy = await Privacy_model_1.PrivacyModel.findOneAndUpdate({}, { description: newData }, { new: true, upsert: true });
    return updatedPrivacy;
};
exports.updatePrivacyInDB = updatePrivacyInDB;
//# sourceMappingURL=Privacy.service.js.map
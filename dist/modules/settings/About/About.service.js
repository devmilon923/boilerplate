"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateAboutInDB = exports.getAllAboutFromDB = exports.createAboutInDB = void 0;
const About_model_1 = require("./About.model");
const createAboutInDB = async (aboutData) => {
    const newAbout = new About_model_1.AboutModel({ description: aboutData.sanitizedContent });
    const savedAbout = await newAbout.save();
    return savedAbout;
};
exports.createAboutInDB = createAboutInDB;
const getAllAboutFromDB = async () => {
    const about = await About_model_1.AboutModel.find().sort({ createdAt: -1 });
    return about;
};
exports.getAllAboutFromDB = getAllAboutFromDB;
const updateAboutInDB = async (newData) => {
    const updatedAbout = await About_model_1.AboutModel.findOneAndUpdate({}, { description: newData }, { new: true, upsert: true });
    return updatedAbout;
};
exports.updateAboutInDB = updateAboutInDB;
//# sourceMappingURL=About.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTermsInDB = exports.getAllTermsFromDB = exports.createTermsInDB = void 0;
const Terms_model_1 = require("./Terms.model");
const createTermsInDB = async (termsData) => {
    const newTerms = new Terms_model_1.TermsModel({ description: termsData.sanitizedContent });
    const savedTerms = await newTerms.save();
    return savedTerms;
};
exports.createTermsInDB = createTermsInDB;
const getAllTermsFromDB = async () => {
    const terms = await Terms_model_1.TermsModel.find().sort({ createdAt: -1 });
    return terms;
};
exports.getAllTermsFromDB = getAllTermsFromDB;
const updateTermsInDB = async (newData) => {
    const updatedTerms = await Terms_model_1.TermsModel.findOneAndUpdate({}, { description: newData }, { new: true, upsert: true });
    return updatedTerms;
};
exports.updateTermsInDB = updateTermsInDB;

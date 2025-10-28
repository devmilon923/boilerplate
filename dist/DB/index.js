"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedAbout = exports.seedTerms = exports.seedPrivacy = exports.seedSuperAdmin = void 0;
const About_model_1 = require("../modules/settings/About/About.model");
const Privacy_model_1 = require("../modules/settings/privacy/Privacy.model");
const Terms_model_1 = require("../modules/settings/Terms/Terms.model");
const user_model_1 = require("../modules/user/user.model");
const user_utils_1 = require("../modules/user/user.utils");
const admin = {
    name: "admin",
    email: "admin@gmail.com",
    password: "1qazxsw2",
    role: "admin",
    isVerified: true,
    isDeleted: false,
};
const dummyPrivacy = {
    description: "dummy privacy and policy",
};
const dummyAbout = {
    description: "dummy about us ",
};
const dummyTerms = {
    description: "dummy terms and conditions",
};
const seedSuperAdmin = async () => {
    const admins = [admin];
    for (const adminData of admins) {
        const isAdminExists = await user_model_1.UserModel.findOne({ email: adminData.email });
        if (!isAdminExists) {
            const hashedPassword = await (0, user_utils_1.hashPassword)(adminData.password);
            const adminWithHashedPassword = {
                ...adminData,
                password: hashedPassword,
            };
            await user_model_1.UserModel.create(adminWithHashedPassword);
            console.log(`Admin created: ${adminData.email}`);
        }
        else {
            console.log(`Admin already exists: ${adminData.email}`);
        }
    }
};
exports.seedSuperAdmin = seedSuperAdmin;
const seedPrivacy = async () => {
    const privacy = await Privacy_model_1.PrivacyModel.findOne();
    if (!privacy) {
        await Privacy_model_1.PrivacyModel.create(dummyPrivacy);
        // console.log("Banner News created");
    }
};
exports.seedPrivacy = seedPrivacy;
const seedTerms = async () => {
    const terms = await Terms_model_1.TermsModel.findOne();
    if (!terms) {
        await Terms_model_1.TermsModel.create(dummyTerms);
        // console.log("Banner News created");
    }
};
exports.seedTerms = seedTerms;
const seedAbout = async () => {
    const about = await About_model_1.AboutModel.findOne();
    if (!about) {
        await About_model_1.AboutModel.create(dummyAbout);
        // console.log("Banner News created");
    }
};
exports.seedAbout = seedAbout;
exports.default = exports.seedSuperAdmin;
//# sourceMappingURL=index.js.map
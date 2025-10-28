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
const seedSuperAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    const admins = [admin];
    for (const adminData of admins) {
        const isAdminExists = yield user_model_1.UserModel.findOne({ email: adminData.email });
        if (!isAdminExists) {
            const hashedPassword = yield (0, user_utils_1.hashPassword)(adminData.password);
            const adminWithHashedPassword = Object.assign(Object.assign({}, adminData), { password: hashedPassword });
            yield user_model_1.UserModel.create(adminWithHashedPassword);
            console.log(`Admin created: ${adminData.email}`);
        }
        else {
            console.log(`Admin already exists: ${adminData.email}`);
        }
    }
});
exports.seedSuperAdmin = seedSuperAdmin;
const seedPrivacy = () => __awaiter(void 0, void 0, void 0, function* () {
    const privacy = yield Privacy_model_1.PrivacyModel.findOne();
    if (!privacy) {
        yield Privacy_model_1.PrivacyModel.create(dummyPrivacy);
        // console.log("Banner News created");
    }
});
exports.seedPrivacy = seedPrivacy;
const seedTerms = () => __awaiter(void 0, void 0, void 0, function* () {
    const terms = yield Terms_model_1.TermsModel.findOne();
    if (!terms) {
        yield Terms_model_1.TermsModel.create(dummyTerms);
        // console.log("Banner News created");
    }
});
exports.seedTerms = seedTerms;
const seedAbout = () => __awaiter(void 0, void 0, void 0, function* () {
    const about = yield About_model_1.AboutModel.findOne();
    if (!about) {
        yield About_model_1.AboutModel.create(dummyAbout);
        // console.log("Banner News created");
    }
});
exports.seedAbout = seedAbout;
exports.default = exports.seedSuperAdmin;

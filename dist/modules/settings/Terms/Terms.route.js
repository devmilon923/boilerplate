"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TermsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const roleGuard_1 = require("../../../middlewares/roleGuard");
const Terms_controller_1 = require("./Terms.controller");
const router = express_1.default.Router();
router.post("/create", (0, roleGuard_1.guardRole)("admin"), Terms_controller_1.createTerms);
router.get("/", Terms_controller_1.getAllTerms);
router.patch("/update", Terms_controller_1.updateTerms);
exports.TermsRoutes = router;
//# sourceMappingURL=Terms.route.js.map
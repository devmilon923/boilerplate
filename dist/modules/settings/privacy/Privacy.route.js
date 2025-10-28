"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivacyRoutes = void 0;
const express_1 = __importDefault(require("express"));
const roleGuard_1 = require("../../../middlewares/roleGuard");
const Privacy_controller_1 = require("./Privacy.controller");
const router = express_1.default.Router();
router.post("/create", (0, roleGuard_1.guardRole)("admin"), Privacy_controller_1.createPrivacy);
router.get("/", Privacy_controller_1.getAllPrivacy);
router.patch("/update", (0, roleGuard_1.guardRole)("admin"), Privacy_controller_1.updatePrivacy);
exports.PrivacyRoutes = router;
//# sourceMappingURL=Privacy.route.js.map
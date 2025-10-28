"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportRoutes = void 0;
const express_1 = __importDefault(require("express"));
const roleGuard_1 = require("../../middlewares/roleGuard");
const support_controller_1 = require("./support.controller");
const router = express_1.default.Router();
router.post("/need", support_controller_1.needSupport);
//router.post("/update", guardRole("primary"), updateCategory);
router.get("/", (0, roleGuard_1.guardRole)("admin"), support_controller_1.getSupport);
router.post("/delete", (0, roleGuard_1.guardRole)("admin"), support_controller_1.deleteSupport);
exports.SupportRoutes = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutRoutes = void 0;
const express_1 = __importDefault(require("express"));
const roleGuard_1 = require("../../../middlewares/roleGuard");
const About_controller_1 = require("./About.controller");
const router = express_1.default.Router();
router.post("/create", (0, roleGuard_1.guardRole)("admin"), About_controller_1.createAbout);
router.get("/", About_controller_1.getAllAbout);
router.patch("/update", About_controller_1.updateAbout);
exports.AboutRoutes = router;
//# sourceMappingURL=About.route.js.map
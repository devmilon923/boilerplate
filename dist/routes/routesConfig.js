"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesConfig = void 0;
const user_route_1 = require("../modules/user/user.route");
const Terms_route_1 = require("../modules/settings/Terms/Terms.route");
const About_route_1 = require("../modules/settings/About/About.route");
const Privacy_route_1 = require("../modules/settings/privacy/Privacy.route");
const notification_route_1 = require("../modules/notifications/notification.route");
const support_route_1 = require("../modules/support/support.route");
const Privacy_controller_1 = require("../modules/settings/privacy/Privacy.controller");
const admin_route_1 = require("../modules/admin/admin.route");
exports.routesConfig = [
    { path: "/api/v1/auth", handler: user_route_1.UserRoutes },
    { path: "/api/v1/terms", handler: Terms_route_1.TermsRoutes },
    { path: "/api/v1/about", handler: About_route_1.AboutRoutes },
    { path: "/api/v1/privacy", handler: Privacy_route_1.PrivacyRoutes },
    { path: "/api/v1/notification", handler: notification_route_1.NotificationRoutes },
    { path: "/api/v1/support", handler: support_route_1.SupportRoutes },
    { path: "/api/v1/admin", handler: admin_route_1.AdminRoutes },
    //------>publishing app <--------------
    { path: "/privacy-policy-page", handler: Privacy_controller_1.htmlRoute },
    { path: "/app-instruction", handler: Privacy_controller_1.AppInstruction },
];
//# sourceMappingURL=routesConfig.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const user_model_1 = require("../user/user.model");
// admin.service.ts
const updateStatus = async (userId, days) => {
    let extendDays = new Date();
    extendDays.setDate(extendDays.getDate() + days);
    const user = await user_model_1.UserModel.findByIdAndUpdate(userId, {
        lockUntil: days ? extendDays : null,
    }, { new: true }).select("lockUntil");
    return user;
};
const getUsers = async (query) => {
    console.log(query);
    const clients = await user_model_1.UserModel.find(query).select("frist_name last_name email phone city");
    return clients;
};
// Helper function to calculate the start and end of the current week
function getCurrentWeekDates() {
    const currentDate = new Date();
    // Convert current date to Bangladesh Standard Time (UTC+6)
    const bangladeshTime = new Date(currentDate.toLocaleString("en-US", { timeZone: "Asia/Dhaka" }));
    // Set the start of the week (Sunday) at midnight in BST
    const startOfWeek = new Date(bangladeshTime);
    startOfWeek.setDate(bangladeshTime.getDate() - bangladeshTime.getDay()); // Sunday
    startOfWeek.setHours(0, 0, 0, 0); // Set to midnight (start of Sunday)
    // Set the end of the week (Saturday) at 23:59:59.999 in BST
    const endOfWeek = new Date(bangladeshTime);
    endOfWeek.setDate(bangladeshTime.getDate() + (6 - bangladeshTime.getDay())); // Saturday
    endOfWeek.setHours(23, 59, 59, 999); // Set to the end of the day (11:59:59.999 PM)
    console.log({ startOfWeek, endOfWeek });
    return { startOfWeek, endOfWeek };
}
exports.AdminService = {
    getUsers,
    updateStatus,
};

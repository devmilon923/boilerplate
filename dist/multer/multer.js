"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const http_errors_1 = __importDefault(require("http-errors"));
const config_1 = require("../config");
const UPLOAD_PATH = config_1.UPLOAD_FOLDER || "public/images"; // Default images folder
const MAX_FILE_SIZE = Number(config_1.max_file_size) || 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".mp3",
    ".wav",
    ".ogg",
    ".mp4",
    ".avi",
    ".mov",
    ".mkv",
    ".webm",
    ".svg",
];
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // Determine the folder based on file type
        const extName = path_1.default.extname(file.originalname).toLowerCase();
        let folder = UPLOAD_PATH;
        // Check if the file is an audio or video type
        if ([
            ".mp3",
            ".wav",
            ".ogg",
            ".mp4",
            ".avi",
            ".mov",
            ".mkv",
            ".webm",
        ].includes(extName)) {
            folder = "public/media"; // Move audio/video files to the sound folder
        }
        cb(null, folder);
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.replace(/\s+/g, "_");
        // const fileName = `${Date.now()}-${file.originalname.replace(extName, "")}${extName}`;
        cb(null, fileName);
    },
});
const fileFilter = (req, file, cb) => {
    const extName = path_1.default.extname(file.originalname).toLocaleLowerCase();
    const isAllowedFileType = ALLOWED_FILE_TYPES.includes(extName);
    if (!isAllowedFileType) {
        return cb((0, http_errors_1.default)(400, "File type not allowed"));
    }
    cb(null, true);
};
const upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
});
exports.default = upload;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.multerUploadMiddleware = multerUploadMiddleware;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./public/");
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname + "-" + Date.now() + path_1.default.extname(file.originalname));
    },
});
function multerUploadMiddleware(fieldName) {
    return (req, res, next) => {
        const upload = (0, multer_1.default)({
            storage: storage,
            fileFilter(req, file, cb) {
                const filetypes = /jpeg|jpg|png|/;
                const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
                const mimetype = filetypes.test(file.mimetype);
                if (mimetype && extname) {
                    cb(null, true);
                }
                else {
                    cb(new Error("file format not supported"));
                }
            },
        }).single(fieldName);
        upload(req, res, (err) => {
            if (err) {
                if (err instanceof multer_1.default.MulterError) {
                    return res
                        .status(400)
                        .json({ message: `Multer error: ${err.message}` });
                }
                else {
                    return res.status(400).json({ message: `${err.message}` });
                }
            }
            next();
        });
    };
}

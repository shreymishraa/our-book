import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PDF storage configuration
const storage = multer.diskStorage({

    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "../private-books"));
    },

    filename: (req, file, cb) => {
        const uniqueName = `${randomUUID()}.pdf`;
        cb(null, uniqueName);
    }

});

// Validate uploaded file
const fileFilter = (req, file, cb) => {

    const extension = path.extname(file.originalname).toLowerCase();

    if (
        extension === ".pdf" &&
        file.mimetype === "application/pdf"
    ) {
        return cb(null, true);
    }

    cb(new Error("Only PDF files are allowed"));
};

// Multer configuration
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 20 * 1024 * 1024
    }
});

export default upload;
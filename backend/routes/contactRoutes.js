import express from "express";
import rateLimit from "express-rate-limit";
import { submitContact } from "../controllers/contactController.js";

const router = express.Router();

// Rate limiting on contact submissions (max 5 per 15 minutes per IP to avoid spam)
const contactLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 5,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many contact submissions. Please wait before sending another message."
    }
});

router.post("/", contactLimiter, submitContact);

export default router;

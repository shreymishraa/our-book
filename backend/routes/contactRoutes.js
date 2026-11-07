import express from "express";
import rateLimit from "express-rate-limit";
import { 
    submitContact, 
    getAllContacts, 
    deleteContact 
} from "../controllers/contactController.js";
import { 
    authenticateUser, 
    authorizeAdmin 
} from "../middleware/authMiddleware.js";

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

// Public contact submission
router.post("/", contactLimiter, submitContact);

// Admin-only endpoints to view and manage inquiries
router.get("/admin", authenticateUser, authorizeAdmin, getAllContacts);
router.delete("/admin/:id", authenticateUser, authorizeAdmin, deleteContact);

export default router;

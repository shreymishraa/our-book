import express from "express";

import {
    registerUser,
    sendOTP,
    verifyUserOTP,
    getAllUsers
} from "../controllers/authController.js";
import {
    authenticateUser,
    authorizeAdmin
} from "../middleware/authMiddleware.js";

const router = express.Router();

// User registration
router.post("/register", registerUser);

// Generate OTP
router.post("/send-otp", sendOTP);

// Verify OTP
router.post("/verify-otp", verifyUserOTP);

// Admin: Get all registered users
router.get("/users", authenticateUser, authorizeAdmin, getAllUsers);

export default router;


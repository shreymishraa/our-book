import express from "express";

import {
    registerUser,
    sendOTP,
    verifyUserOTP
} from "../controllers/authController.js";

const router = express.Router();

// User registration
router.post("/register", registerUser);

// Generate OTP
router.post("/send-otp", sendOTP);

// Verify OTP
router.post("/verify-otp", verifyUserOTP);

export default router;


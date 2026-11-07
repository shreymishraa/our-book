import db from "../config/database.js";
import jwt from "jsonwebtoken";

import {
    generateOTP,
    verifyOTP
} from "../services/otpService.js";

// Register new user

export const registerUser = (req, res) => {

    try {

        // Get user details

        const { name, email, mobile } = req.body;

        // Validate empty fields

        if (!name || !email || !mobile) {

            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });

        }

        // Normalize input

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanMobile = mobile.trim();

        // Validate email

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {

            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });

        }

        // Validate mobile number

        if (!/^[0-9]{10}$/.test(cleanMobile)) {

            return res.status(400).json({
                success: false,
                message: "Enter a valid 10-digit mobile number"
            });

        }

        // Insert user into database

        const result = db.prepare(`
            INSERT INTO users (name, email, mobile)
            VALUES (?, ?, ?)
        `).run(cleanName, cleanEmail, cleanMobile);

        return res.status(201).json({

            success: true,
            message: "User registered successfully",

            user: {
                id: result.lastInsertRowid,
                name: cleanName,
                email: cleanEmail,
                mobile: cleanMobile
            }

        });

    } catch (error) {

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(409).json({
                success: false,
                message: "Email or mobile number already registered"
            });

        }

        console.error("Registration error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }

};
// Generate OTP for user
export const sendOTP = (req, res) => {

    try {

        // Step 1: Get user ID
        const { userId } = req.body;

        // Step 2: Validate user ID
        if (!Number.isInteger(userId) || userId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Valid user ID is required"
            });

        }

        // Step 3: Find user in database
        const user = db.prepare(`
            SELECT id, name, email, mobile, is_verified
            FROM users
            WHERE id = ?
        `).get(userId);

        // Step 4: Check user existence
        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Step 5: Check verification status
        if (user.is_verified === 1) {

            return res.status(400).json({
                success: false,
                message: "User is already verified"
            });

        }

        // Step 6: Generate OTP
        const { otp, expiresAt } = generateOTP(userId);

        // Step 7: Display OTP during development
        if (process.env.NODE_ENV === "development") {

            console.log(`Development OTP for user ${userId}: ${otp}`);

        }

        // Step 8: Return success response
        return res.status(200).json({

            success: true,
            message: "OTP generated successfully",
            expiresAt

        });

    } catch (error) {

        // Handle errors
        console.error("OTP generation error:", error);

        return res.status(500).json({

            success: false,
            message: "Unable to generate OTP"

        });

    }

};
// Verify OTP and generate JWT

export const verifyUserOTP = (req, res) => {

    try {

        // Step 1: Get user ID and OTP

        const { userId, otp } = req.body;

        // Step 2: Validate input

        if (!userId || !otp) {

            return res.status(400).json({
                success: false,
                message: "User ID and OTP are required"
            });

        }

        const parsedUserId = Number(userId);

        if (
            !Number.isInteger(parsedUserId) ||
            parsedUserId <= 0 ||
            typeof otp !== "string" ||
            !/^\d{6}$/.test(otp)
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid user ID or OTP format"
            });

        }

        // Step 3: Find user

        const user = db.prepare(`
            SELECT id, name, email, mobile, is_verified
            FROM users
            WHERE id = ?
        `).get(parsedUserId);

        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Step 4: Check verification status

        if (user.is_verified === 1) {

            return res.status(400).json({
                success: false,
                message: "User already verified"
            });

        }

        // Step 5: Verify OTP

        const result = verifyOTP(parsedUserId, otp);

        if (!result.success) {

            return res.status(400).json({
                success: false,
                message: result.message,
                attemptsRemaining: result.attemptsRemaining
            });

        }

        // Step 6: Generate JWT

        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Step 7: Return response

        return res.status(200).json({

            success: true,

            message: "OTP verified successfully",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                mobile: user.mobile
            }

        });

    } catch (error) {

        console.error("OTP verification error:", error);

        return res.status(500).json({
            success: false,
            message: "OTP verification failed"
        });

    }

};
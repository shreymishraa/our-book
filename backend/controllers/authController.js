import db from "../config/database.js";
import jwt from "jsonwebtoken";

import {
    sendVerification,
    checkVerification
} from "../services/twilioService.js";

// ==========================================
// HELPERS
// ==========================================

/**
 * Normalize a phone number to E.164 format.
 * @param {string} countryCode - e.g. "+91"
 * @param {string} mobile      - e.g. "9876543210"
 * @returns {string} E.164 phone number e.g. "+919876543210"
 */
const toE164 = (countryCode, mobile) => {
    // Ensure country code starts with +
    const code = countryCode.startsWith("+")
        ? countryCode
        : `+${countryCode}`;

    // Remove any leading zeros from mobile
    const cleanMobile = mobile.replace(/^0+/, "");

    return `${code}${cleanMobile}`;
};

// ==========================================
// 1. REGISTER USER
// ==========================================

export const registerUser = (req, res) => {

    try {

        // Get user details
        const { name, email, mobile, countryCode } = req.body;

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
        let rawCountry = (countryCode || "+91").trim();
        const cleanCountryCode = rawCountry.startsWith("+") ? rawCountry : `+${rawCountry}`;

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {

            return res.status(400).json({
                success: false,
                message: "Invalid email address"
            });

        }

        // Validate mobile number (allow 7-15 digits for international support)
        if (!/^[0-9]{7,15}$/.test(cleanMobile)) {

            return res.status(400).json({
                success: false,
                message: "Enter a valid mobile number"
            });

        }

        // Validate country code (must start with + followed by 1-4 digits)
        if (!/^\+[1-9]\d{0,3}$/.test(cleanCountryCode)) {

            return res.status(400).json({
                success: false,
                message: "Enter a valid country code (e.g. +91)"
            });

        }

        // Check if user already exists and is verified
        const existingUser = db.prepare(`
            SELECT id, is_verified
            FROM users
            WHERE email = ? OR mobile = ?
        `).get(cleanEmail, cleanMobile);

        if (existingUser && existingUser.is_verified === 1) {

            return res.status(409).json({
                success: false,
                message: "Email or mobile number already registered and verified"
            });

        }

        // If user exists but is not verified, return their ID to proceed with OTP
        if (existingUser && existingUser.is_verified === 0) {

            // Update user details in case they changed
            db.prepare(`
                UPDATE users
                SET name = ?, email = ?, mobile = ?, country_code = ?
                WHERE id = ?
            `).run(cleanName, cleanEmail, cleanMobile, cleanCountryCode, existingUser.id);

            return res.status(200).json({

                success: true,
                message: "User found. Please verify your account.",

                user: {
                    id: existingUser.id,
                    name: cleanName,
                    email: cleanEmail,
                    mobile: cleanMobile,
                    countryCode: cleanCountryCode
                }

            });

        }

        // Insert new user into database
        const result = db.prepare(`
            INSERT INTO users (name, email, mobile, country_code)
            VALUES (?, ?, ?, ?)
        `).run(cleanName, cleanEmail, cleanMobile, cleanCountryCode);

        return res.status(201).json({

            success: true,
            message: "User registered successfully",

            user: {
                id: result.lastInsertRowid,
                name: cleanName,
                email: cleanEmail,
                mobile: cleanMobile,
                countryCode: cleanCountryCode
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

// ==========================================
// 2. SEND OTP VIA TWILIO VERIFY
// ==========================================

export const sendOTP = async (req, res) => {

    try {

        // Step 1: Get user ID and channel
        const { userId, channel } = req.body;

        // Step 2: Validate user ID
        if (!Number.isInteger(userId) || userId <= 0) {

            return res.status(400).json({
                success: false,
                message: "Valid user ID is required"
            });

        }

        // Step 3: Validate channel
        const deliveryChannel = channel || "sms";

        if (!["sms", "whatsapp"].includes(deliveryChannel)) {

            return res.status(400).json({
                success: false,
                message: "Channel must be 'sms' or 'whatsapp'"
            });

        }

        // Step 4: Find user in database
        const user = db.prepare(`
            SELECT id, name, email, mobile, country_code, is_verified
            FROM users
            WHERE id = ?
        `).get(userId);

        // Step 5: Check user existence
        if (!user) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }

        // Step 6: Check verification status
        if (user.is_verified === 1) {

            return res.status(400).json({
                success: false,
                message: "User is already verified"
            });

        }

        // Step 7: Build E.164 phone number
        const phoneE164 = toE164(user.country_code, user.mobile);

        // Step 8: Send verification via Twilio Verify
        const result = await sendVerification(phoneE164, deliveryChannel);

        if (!result.success) {

            return res.status(400).json({
                success: false,
                message: result.message
            });

        }

        // Step 9: Return success response (never expose OTP)
        return res.status(200).json({

            success: true,
            message: result.message,
            channel: deliveryChannel

        });

    } catch (error) {

        // Handle errors
        console.error("OTP generation error:", error);

        return res.status(500).json({

            success: false,
            message: "Unable to send verification code"

        });

    }

};

// ==========================================
// 3. VERIFY OTP VIA TWILIO VERIFY
// ==========================================

export const verifyUserOTP = async (req, res) => {

    try {

        // Step 1: Get user ID and OTP code
        const { userId, otp } = req.body;

        // Step 2: Validate input
        if (!userId || !otp) {

            return res.status(400).json({
                success: false,
                message: "User ID and verification code are required"
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
                message: "Invalid user ID or verification code format"
            });

        }

        // Step 3: Find user
        const user = db.prepare(`
            SELECT id, name, email, mobile, country_code, is_verified
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

        // Step 5: Build E.164 phone number
        const phoneE164 = toE164(user.country_code, user.mobile);

        // Step 6: Verify OTP via Twilio Verify
        const result = await checkVerification(phoneE164, otp);

        if (!result.success) {

            return res.status(400).json({
                success: false,
                message: result.message
            });

        }

        // Step 7: Update user verification status
        db.prepare(`
            UPDATE users
            SET is_verified = 1,
                verified_at = unixepoch()
            WHERE id = ?
        `).run(parsedUserId);

        // Step 8: Generate JWT
        const token = jwt.sign(
            {
                userId: user.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d"
            }
        );

        // Step 9: Return response
        return res.status(200).json({

            success: true,

            message: "Verification successful",

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
            message: "Verification failed. Please try again."
        });

    }

};

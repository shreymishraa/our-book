import { randomInt, createHmac, timingSafeEqual } from "crypto";
import db from "../config/database.js";

// ==========================================
// HASH OTP
// ==========================================

const hashOTP = (otp) => {
    return createHmac("sha256", process.env.OTP_HASH_SECRET)
        .update(otp)
        .digest("hex");
};

// ==========================================
// GENERATE OTP
// ==========================================

export const generateOTP = (userId) => {

    // Generate a 6-digit OTP
    const otp = randomInt(100000, 1000000).toString();

    // Hash OTP before storing it
    const otpHash = hashOTP(otp);

    // OTP expires after 30 seconds
    const expiresAt = Math.floor(Date.now() / 1000) + 30;

    // Perform both database operations atomically
    const createOTP = db.transaction(() => {

        // Invalidate previous unused OTPs
        db.prepare(`
            UPDATE otps
            SET consumed_at = unixepoch()
            WHERE user_id = ?
            AND consumed_at IS NULL
        `).run(userId);

        // Insert new OTP
        db.prepare(`
            INSERT INTO otps (
                user_id,
                otp_hash,
                expires_at
            )
            VALUES (?, ?, ?)
        `).run(userId, otpHash, expiresAt);

    });

    createOTP();

    return {
        otp,
        expiresAt
    };
};

// ==========================================
// VERIFY OTP
// ==========================================

export const verifyOTP = (userId, submittedOTP) => {

    // Step 1: Find latest unused OTP
    const otpRecord = db.prepare(`
        SELECT id, otp_hash, expires_at, attempts
        FROM otps
        WHERE user_id = ?
        AND consumed_at IS NULL
        ORDER BY id DESC
        LIMIT 1
    `).get(userId);

    // Step 2: Check OTP existence
    if (!otpRecord) {
        return {
            success: false,
            message: "OTP not found. Please request a new OTP."
        };
    }

    // Step 3: Check maximum attempts
    if (otpRecord.attempts >= 5) {

        db.prepare(`
            UPDATE otps
            SET consumed_at = unixepoch()
            WHERE id = ?
        `).run(otpRecord.id);

        return {
            success: false,
            message: "Maximum attempts reached. Please request a new OTP."
        };
    }

    // Step 4: Check OTP expiry
    if (Math.floor(Date.now() / 1000) >= otpRecord.expires_at) {

        db.prepare(`
            UPDATE otps
            SET consumed_at = unixepoch()
            WHERE id = ?
        `).run(otpRecord.id);

        return {
            success: false,
            message: "OTP has expired. Please request a new OTP."
        };
    }

    // Step 5: Hash submitted OTP
    const submittedHash = hashOTP(submittedOTP);

    // Step 6: Compare hashes securely
    const storedBuffer = Buffer.from(otpRecord.otp_hash, "hex");
    const submittedBuffer = Buffer.from(submittedHash, "hex");

    const isValid =
        storedBuffer.length === submittedBuffer.length &&
        timingSafeEqual(storedBuffer, submittedBuffer);

    // Step 7: Handle incorrect OTP
    if (!isValid) {

        const newAttempts = otpRecord.attempts + 1;

        db.prepare(`
            UPDATE otps
            SET attempts = ?,
                consumed_at = CASE
                    WHEN ? >= 5 THEN unixepoch()
                    ELSE consumed_at
                END
            WHERE id = ?
            AND consumed_at IS NULL
        `).run(newAttempts, newAttempts, otpRecord.id);

        return {
            success: false,
            message: "Invalid OTP",
            attemptsRemaining: Math.max(0, 5 - newAttempts)
        };
    }

    // Step 8: Complete verification atomically
    const completeVerification = db.transaction(() => {

        // Consume OTP only if it is still valid and unused
        const consumedOTP = db.prepare(`
            UPDATE otps
            SET consumed_at = unixepoch()
            WHERE id = ?
            AND consumed_at IS NULL
            AND expires_at > unixepoch()
            AND attempts < 5
        `).run(otpRecord.id);

        // Prevent reuse or simultaneous verification
        if (consumedOTP.changes !== 1) {
            return false;
        }

        // Verify user
        const verifiedUser = db.prepare(`
            UPDATE users
            SET is_verified = 1,
                verified_at = unixepoch()
            WHERE id = ?
        `).run(userId);

        return verifiedUser.changes === 1;
    });

    const verified = completeVerification();

    // Step 9: Return result
    if (!verified) {
        return {
            success: false,
            message: "OTP expired or already used. Please request a new OTP."
        };
    }

    return {
        success: true,
        message: "OTP verified successfully"
    };
};
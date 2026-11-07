import twilio from "twilio";

// ==========================================
// TWILIO VERIFY CLIENT
// ==========================================

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Validate Twilio credentials at startup
if (!accountSid || !authToken || !verifyServiceSid) {
    console.error(
        "WARNING: Twilio credentials are missing. " +
        "Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_VERIFY_SERVICE_SID in .env"
    );
}

const client = twilio(accountSid, authToken);

// ==========================================
// SUPPORTED CHANNELS
// ==========================================

const SUPPORTED_CHANNELS = ["sms", "whatsapp"];

// ==========================================
// SEND VERIFICATION CODE
// ==========================================

/**
 * Send an OTP verification code via Twilio Verify.
 *
 * @param {string} phoneE164 - Phone number in E.164 format (e.g. "+919876543210")
 * @param {string} channel   - Delivery channel: "sms" or "whatsapp"
 * @returns {Promise<{success: boolean, message: string, status?: string}>}
 */
export const sendVerification = async (phoneE164, channel = "sms") => {

    // Validate channel
    if (!SUPPORTED_CHANNELS.includes(channel)) {
        return {
            success: false,
            message: `Unsupported channel. Use: ${SUPPORTED_CHANNELS.join(", ")}`
        };
    }

    try {
        const verification = await client.verify.v2
            .services(verifyServiceSid)
            .verifications.create({
                to: phoneE164,
                channel
            });

        return {
            success: true,
            message: `Verification code sent via ${channel}`,
            status: verification.status
        };

    } catch (error) {

        console.error("Twilio send verification error:", error.message);

        // Return user-friendly messages for common Twilio errors
        if (error.code === 60200) {
            return {
                success: false,
                message: "Invalid phone number. Please check and try again."
            };
        }

        if (error.code === 60203) {
            return {
                success: false,
                message: "Too many verification attempts. Please wait before trying again."
            };
        }

        if (error.code === 60205) {
            return {
                success: false,
                message: `The ${channel} channel is not available. Please try a different channel.`
            };
        }

        return {
            success: false,
            message: "Unable to send verification code. Please try again later."
        };
    }
};

// ==========================================
// CHECK VERIFICATION CODE
// ==========================================

/**
 * Verify an OTP code submitted by the user.
 *
 * @param {string} phoneE164 - Phone number in E.164 format
 * @param {string} code      - 6-digit verification code
 * @returns {Promise<{success: boolean, message: string, status?: string}>}
 */
export const checkVerification = async (phoneE164, code) => {

    try {
        const verificationCheck = await client.verify.v2
            .services(verifyServiceSid)
            .verificationChecks.create({
                to: phoneE164,
                code
            });

        if (verificationCheck.status === "approved") {
            return {
                success: true,
                message: "Verification successful",
                status: verificationCheck.status
            };
        }

        return {
            success: false,
            message: "Invalid verification code",
            status: verificationCheck.status
        };

    } catch (error) {

        console.error("Twilio check verification error:", error.message);

        if (error.code === 60200) {
            return {
                success: false,
                message: "Invalid phone number format."
            };
        }

        if (error.code === 20404) {
            return {
                success: false,
                message: "Verification code expired or not found. Please request a new code."
            };
        }

        if (error.code === 60202) {
            return {
                success: false,
                message: "Too many incorrect attempts. Please request a new code."
            };
        }

        return {
            success: false,
            message: "Verification failed. Please try again."
        };
    }
};


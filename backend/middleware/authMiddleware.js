import jwt from "jsonwebtoken";
import db from "../config/database.js";

// Authentication Middleware

export const authenticateUser = (req, res, next) => {

    try {

        // Step 1: Get Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token required"
            });
        }

        // Step 2: Extract JWT token
        const token = authHeader.split(" ")[1];

        // Step 3: Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 4: Find user in database
        const user = db.prepare(`
            SELECT id, name, email, mobile, is_verified , role
            FROM users
            WHERE id = ?
        `).get(decoded.userId);

        // Step 5: Check user existence
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User not found"
            });
        }

        // Step 6: Check OTP verification status
        if (user.is_verified !== 1) {
            return res.status(403).json({
                success: false,
                message: "Please verify your account first"
            });
        }

        // Step 7: Attach user to request
        req.user = user;

        // Step 8: Continue to next function
        next();

    } catch (error) {

        return res.status(401).json({
            success: false,
            message: "Invalid or expired authentication token"
        });

    }

}
// Admin authorization middleware
export const authorizeAdmin = (req, res, next) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin privileges required."
        });
    }

    next();
};
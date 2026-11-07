import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import db from "./config/database.js";
import "./database/schema.js";

import authRoutes from "./routes/authRoutes.js";
import bookRoutes from "./routes/bookRoutes.js";

const app = express();

// ========================================
// 1. SECURITY MIDDLEWARE
// ========================================

app.use(helmet());

// Allow both Vite frontend ports
app.use(
    cors({
        origin: [
            "http://localhost:5173",
            "http://localhost:5174"
        ],
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

// Parse JSON requests
app.use(express.json());

// ========================================
// 2. RATE LIMITING
// ========================================

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later."
    }
});

app.use("/api", limiter);

// ========================================
// 3. API ROUTES
// ========================================

app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

// ========================================
// 4. HEALTH CHECK
// ========================================

app.get("/", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to OUR BOOK API"
    });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "OUR BOOK server is running"
    });
});

// ========================================
// 5. DATABASE CHECK
// ========================================

const databaseCheck = db.prepare("SELECT 1 AS connected").get();

console.log("Database status:", databaseCheck.connected);

const tables = db.prepare(`
    SELECT name
    FROM sqlite_master
    WHERE type = 'table'
    AND name NOT LIKE 'sqlite_%'
`).all();

console.log("Database Tables:", tables);

// ========================================
// 6. START SERVER
// ========================================

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log("--------------------------------");
    console.log("OUR BOOK BACKEND STARTED");
    console.log(`Server: http://localhost:${PORT}`);
    console.log(`Health: http://localhost:${PORT}/api/health`);
    console.log("--------------------------------");
});
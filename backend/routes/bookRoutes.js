import express from "express";
import upload from "../middleware/uploadMiddleware.js";

import {
    getAllBooks,
    createBook,
    readBook,
    uploadBook,
    updateBook,
    deleteBook
} from "../controllers/bookController.js";

import {
    authenticateUser,
    authorizeAdmin
} from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all books
router.get("/", authenticateUser, getAllBooks);

// Create book (Admin only)
router.post("/", authenticateUser, authorizeAdmin, createBook);

// Read book PDF
router.get("/:id/read", authenticateUser, readBook);
// Upload PDF (Admin only)
router.post(
    "/upload",
    authenticateUser,
    authorizeAdmin,
    upload.single("book"),
    uploadBook
);
// Update book (Admin only)
router.put(
    "/:id",
    authenticateUser,
    authorizeAdmin,
    updateBook
);
// Delete book (Admin only)
router.delete(
    "/:id",
    authenticateUser,
    authorizeAdmin,
    deleteBook
);

export default router;
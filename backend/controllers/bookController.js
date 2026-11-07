import db from "../config/database.js";
import path from "path";
import { existsSync, createReadStream, unlinkSync } from "fs";
import { fileURLToPath } from "url";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========================================
// 1. GET ALL BOOKS
// ========================================

export const getAllBooks = (req, res) => {
    try {
        const books = db.prepare(`
            SELECT id, title, subject, description
            FROM books
            ORDER BY id DESC
        `).all();

        return res.status(200).json({
            success: true,
            totalBooks: books.length,
            books
        });

    } catch (error) {
        console.error("Get books error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to fetch books"
        });
    }
};

// ========================================
// 2. CREATE A NEW BOOK (ADMIN)
// ========================================

export const createBook = (req, res) => {
    try {
        const { title, subject, description, file_path } = req.body;

        if (
            typeof title !== "string" || !title.trim() ||
            typeof subject !== "string" || !subject.trim() ||
            typeof description !== "string" || !description.trim() ||
            typeof file_path !== "string" || !file_path.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "All book fields are required"
            });
        }

        const result = db.prepare(`
            INSERT INTO books (title, subject, description, file_path)
            VALUES (?, ?, ?, ?)
        `).run(
            title.trim(),
            subject.trim(),
            description.trim(),
            file_path.trim()
        );

        return res.status(201).json({
            success: true,
            message: "Book created successfully",
            bookId: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Create book error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to create book"
        });
    }
};

// ========================================
// 3. READ BOOK PDF
// ========================================

export const readBook = (req, res) => {
    try {
        const bookId = Number(req.params.id);

        if (!Number.isInteger(bookId) || bookId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        const book = db.prepare(`
            SELECT id, title, file_path
            FROM books
            WHERE id = ?
        `).get(bookId);

        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        const fileName = path.basename(book.file_path);

        if (path.extname(fileName).toLowerCase() !== ".pdf") {
            return res.status(400).json({
                success: false,
                message: "Invalid book file format"
            });
        }

        const pdfPath = path.join(
            __dirname,
            "../private-books",
            fileName
        );

        if (!existsSync(pdfPath)) {
            return res.status(404).json({
                success: false,
                message: "PDF file not found"
            });
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `inline; filename="${fileName}"`
        );

        const pdfStream = createReadStream(pdfPath);

        pdfStream.on("error", (error) => {
            console.error("PDF streaming error:", error);

            if (!res.headersSent) {
                res.status(500).json({
                    success: false,
                    message: "Unable to stream PDF"
                });
            } else {
                res.destroy(error);
            }
        });

        pdfStream.pipe(res);

    } catch (error) {
        console.error("Read book error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to open book"
        });
    }
};

// ========================================
// 4. UPLOAD BOOK PDF (ADMIN)
// ========================================

export const uploadBook = (req, res) => {
    try {

        // Check uploaded file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Please upload a PDF file"
            });
        }

        const { title, subject, description } = req.body;

        // Validate book details
        if (
            typeof title !== "string" || !title.trim() ||
            typeof subject !== "string" || !subject.trim() ||
            typeof description !== "string" || !description.trim()
        ) {
            unlinkSync(req.file.path);

            return res.status(400).json({
                success: false,
                message: "Valid title, subject and description are required"
            });
        }

        // Insert book into database
        const result = db.prepare(`
            INSERT INTO books (title, subject, description, file_path)
            VALUES (?, ?, ?, ?)
        `).run(
            title.trim(),
            subject.trim(),
            description.trim(),
            req.file.filename
        );

        return res.status(201).json({
            success: true,
            message: "Book uploaded successfully",
            bookId: result.lastInsertRowid,
            fileName: req.file.filename
        });

    } catch (error) {

        // Delete uploaded file if database operation fails
        if (req.file && existsSync(req.file.path)) {
            unlinkSync(req.file.path);
        }

        console.error("Book upload error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to upload book"
        });
    }
};
// ========================================
// UPDATE BOOK (ADMIN ONLY)
// ========================================

export const updateBook = (req, res) => {
    try {
        const bookId = Number(req.params.id);

        const { title, subject, description } = req.body;

        // Validate book ID
        if (!Number.isInteger(bookId) || bookId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        // Validate fields
        if (
            typeof title !== "string" || !title.trim() ||
            typeof subject !== "string" || !subject.trim() ||
            typeof description !== "string" || !description.trim()
        ) {
            return res.status(400).json({
                success: false,
                message: "Title, subject and description are required"
            });
        }

        // Check whether book exists
        const existingBook = db.prepare(`
            SELECT id FROM books WHERE id = ?
        `).get(bookId);

        if (!existingBook) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Update book
        db.prepare(`
            UPDATE books
            SET title = ?, subject = ?, description = ?
            WHERE id = ?
        `).run(
            title.trim(),
            subject.trim(),
            description.trim(),
            bookId
        );

        return res.status(200).json({
            success: true,
            message: "Book updated successfully"
        });

    } catch (error) {
        console.error("Update book error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to update book"
        });
    }
};
// ========================================
// DELETE BOOK (ADMIN ONLY)
// ========================================

export const deleteBook = (req, res) => {
    try {
        // Get book ID from URL
        const bookId = Number(req.params.id);

        // Validate book ID
        if (!Number.isInteger(bookId) || bookId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid book ID"
            });
        }

        // Find book in database
        const book = db.prepare(`
            SELECT id, file_path
            FROM books
            WHERE id = ?
        `).get(bookId);

        // Check whether book exists
        if (!book) {
            return res.status(404).json({
                success: false,
                message: "Book not found"
            });
        }

        // Get the PDF filename
        const fileName = path.basename(book.file_path);

        // Construct PDF path inside private-books
        const pdfPath = path.join(
            __dirname,
            "../private-books",
            fileName
        );

        // Delete book record from database
        db.prepare(`
            DELETE FROM books
            WHERE id = ?
        `).run(bookId);

        // Delete associated PDF file if it exists
        if (existsSync(pdfPath)) {
            unlinkSync(pdfPath);
        }

        return res.status(200).json({
            success: true,
            message: "Book deleted successfully"
        });

    } catch (error) {
        console.error("Delete book error:", error);

        return res.status(500).json({
            success: false,
            message: "Unable to delete book"
        });
    }
};
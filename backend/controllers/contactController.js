import db from "../config/database.js";
import { sendContactEmails } from "../services/mailService.js";

/**
 * Handle new contact form submissions.
 */
export const submitContact = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields (name, email, subject, message) are required"
            });
        }

        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();
        const cleanSubject = subject.trim();
        const cleanMessage = message.trim();

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address format"
            });
        }

        if (cleanMessage.length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must be at least 10 characters long"
            });
        }

        // 1. Store in database
        const insertStmt = db.prepare(`
            INSERT INTO contacts (name, email, subject, message)
            VALUES (?, ?, ?, ?)
        `);
        const result = insertStmt.run(cleanName, cleanEmail, cleanSubject, cleanMessage);

        // 2. Dispatch emails (notification to admin + confirmation to user)
        sendContactEmails({
            name: cleanName,
            email: cleanEmail,
            subject: cleanSubject,
            message: cleanMessage
        }).catch(err => {
            console.error("Background email dispatch error:", err.message);
        });

        return res.status(201).json({
            success: true,
            message: "Thank you! Your message has been sent. A confirmation email has been dispatched.",
            contactId: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Submit contact error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to process your contact inquiry. Please try again later."
        });
    }
};

/**
 * Retrieve all contact inquiries (Admin only).
 */
export const getAllContacts = (req, res) => {
    try {
        const contacts = db.prepare(`
            SELECT 
                id, 
                name, 
                email, 
                subject, 
                message, 
                datetime(created_at, 'unixepoch', 'localtime') AS created_at
            FROM contacts
            ORDER BY id DESC
        `).all();

        return res.status(200).json({
            success: true,
            totalContacts: contacts.length,
            contacts
        });
    } catch (error) {
        console.error("Get contacts error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch contact messages"
        });
    }
};

/**
 * Delete a contact inquiry (Admin only).
 */
export const deleteContact = (req, res) => {
    try {
        const contactId = Number(req.params.id);

        if (!Number.isInteger(contactId) || contactId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid contact ID"
            });
        }

        const result = db.prepare(`DELETE FROM contacts WHERE id = ?`).run(contactId);

        if (result.changes === 0) {
            return res.status(404).json({
                success: false,
                message: "Contact message not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Contact message deleted successfully"
        });
    } catch (error) {
        console.error("Delete contact error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to delete contact message"
        });
    }
};

import nodemailer from "nodemailer";

/**
 * Configure email transporter using SMTP.
 * Defaults to Gmail or custom SMTP via environment variables.
 */
const createTransporter = () => {
    // If SMTP credentials provided, use standard SMTP
    if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });
    }

    // Default to Gmail service if GMAIL_USER is configured
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }

    return null;
};

/**
 * Send contact notification to Admin and confirmation to User.
 *
 * @param {Object} contactDetails
 * @param {string} contactDetails.name
 * @param {string} contactDetails.email
 * @param {string} contactDetails.subject
 * @param {string} contactDetails.message
 */
export const sendContactEmails = async ({ name, email, subject, message }) => {
    const transporter = createTransporter();

    const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || process.env.SMTP_USER || "admin@ourbook.com";
    const senderEmail = process.env.GMAIL_USER || process.env.SMTP_USER || "no-reply@ourbook.com";

    // If no email provider is configured, log details gracefully in development
    if (!transporter) {
        console.warn("⚠️ Email service not fully configured in .env. Message saved to DB; logging emails locally:");
        console.log(`[Admin Notification] To: ${adminEmail} | From: ${name} (${email}) | Subject: ${subject}`);
        console.log(`[User Confirmation] To: ${email} | "Thank you for contacting OUR BOOK"`);
        return {
            delivered: false,
            mock: true,
            message: "Message received and logged. Email credentials required for live dispatch."
        };
    }

    // 1. Email to Admin
    const adminMailOptions = {
        from: `"OUR BOOK Contact Form" <${senderEmail}>`,
        to: adminEmail,
        replyTo: email,
        subject: `[New Contact Inquiry] ${subject} - from ${name}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 8px;">New Message from OUR BOOK Contact Form</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <div style="margin-top: 15px; padding: 15px; background-color: #f9fafb; border-left: 4px solid #2563eb; border-radius: 4px;">
                    <strong>Message:</strong>
                    <p style="white-space: pre-wrap; margin-top: 8px;">${message}</p>
                </div>
                <hr style="margin-top: 25px; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #6b7280;">This email was sent via the OUR BOOK platform contact portal.</p>
            </div>
        `
    };

    // 2. Confirmation Email to User
    const userMailOptions = {
        from: `"OUR BOOK Team" <${senderEmail}>`,
        to: email,
        subject: `Thank you for contacting OUR BOOK: ${subject}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #2563eb; margin: 0;">OUR BOOK 📚</h1>
                    <p style="color: #6b7280; margin-top: 5px;">Your Digital Learning Companion</p>
                </div>
                <h3 style="color: #1f2937;">Hello ${name},</h3>
                <p>Thank you for reaching out to us. We have received your inquiry regarding <strong>"${subject}"</strong>.</p>
                <p>Our team is reviewing your message and will respond to you as soon as possible.</p>
                <div style="margin: 20px 0; padding: 15px; background-color: #f3f4f6; border-radius: 6px;">
                    <p style="margin: 0; font-size: 14px; color: #4b5563;"><strong>A copy of your message:</strong></p>
                    <p style="margin-top: 8px; font-style: italic; color: #374151;">"${message}"</p>
                </div>
                <p>Warm regards,<br><strong>The OUR BOOK Team</strong></p>
                <hr style="margin-top: 25px; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 12px; color: #9ca3af; text-align: center;">© ${new Date().getFullYear()} OUR BOOK. All rights reserved.</p>
            </div>
        `
    };

    // Send both emails in parallel
    await Promise.all([
        transporter.sendMail(adminMailOptions),
        transporter.sendMail(userMailOptions)
    ]);

    return { delivered: true };
};

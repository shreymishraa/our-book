import db from "../config/database.js";

//users table

db.exec(`
    CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT ,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE ,
    mobile TEXT NOT NULL UNIQUE,
    country_code TEXT NOT NULL DEFAULT '+91',
    role TEXT NOT NULL DEFAULT 'user'
         CHECK(role IN ('admin', 'user')),
    is_verified INTEGER NOT NULL DEFAULT 0,
    verified_at INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()) )`);

// Add country_code column if it does not exist (safe migration for existing data)
const userColumns = db.prepare("PRAGMA table_info(users)").all();
const hasCountryCode = userColumns.some(col => col.name === "country_code");

if (!hasCountryCode) {
    db.exec(`ALTER TABLE users ADD COLUMN country_code TEXT NOT NULL DEFAULT '+91'`);
    console.log("Added country_code column to users table");
}

    //OTP table

db.exec(`
    CREATE TABLE IF NOT EXISTS otps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        otp_hash TEXT NOT NULL,
        expires_at INTEGER NOT NULL,
        attempts INTEGER NOT NULL DEFAULT 0,
        consumed_at INTEGER,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),

        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
    )
`);

//book table 
db.exec(`
    CREATE TABLE IF NOT EXISTS books (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        subject TEXT NOT NULL,
        description TEXT NOT NULL,
        file_path TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch()),

        CHECK (
            subject IN (
                'English',
                'Hindi',
                'Mathematics',
                'History',
                'Civics',
                'Geography'
            )
        )
    )
`);

// contacts table
db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at INTEGER NOT NULL DEFAULT (unixepoch())
    )
`);

    console.log("our book database tables created successfully")

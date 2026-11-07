import Database from "better-sqlite3";
import path from "path";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, "../database/our-book.db");

const db = new Database(dbPath);

db.pragma("foreign_keys=ON");

db.pragma("journal_mode = WAL");

db.pragma("busy_timeout = 5000");
console.log("our book SQLite database connected successfully");

export default db;
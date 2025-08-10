// backend/database/db.js
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const DB_FILE = process.env.DB_FILE || path.join(path.dirname(new URL(import.meta.url).pathname), "data", "blueprints.db");

export async function initDb() {
  // ensure folder exists
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // open and create table if not exists
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS blueprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT,
      materials TEXT,
      climate TEXT,
      culture TEXT,
      budget TEXT,
      plan TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.close();
  console.log("✅ SQLite DB initialized at:", DB_FILE);
}

// Export a regular sqlite3 Database instance for simple queries in model
const sqlite3db = sqlite3.verbose();
const db = new sqlite3db.Database(DB_FILE);

export default db;

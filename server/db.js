import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'analytics.db');

let dbInstance = null;

// SHA-256 helper for simple, dependency-free secure passwords
export function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function getDb() {
  if (dbInstance) return dbInstance;

  dbInstance = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys
  await dbInstance.get('PRAGMA foreign_keys = ON');

  // Initialize tables
  await dbInstance.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('agency_admin', 'client_user')),
      company_name TEXT,
      logo_url TEXT,
      primary_color TEXT DEFAULT '#3b82f6',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS stands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      short_code TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('redirect', 'review_filter', 'wifi')),
      target_url TEXT NOT NULL,
      backup_url TEXT, -- Used for lower reviews in 'review_filter'
      client_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS scans (
      id TEXT PRIMARY KEY,
      stand_id TEXT NOT NULL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      device_os TEXT,
      device_type TEXT,
      browser TEXT,
      country TEXT,
      city TEXT,
      referrer TEXT,
      FOREIGN KEY (stand_id) REFERENCES stands(id) ON DELETE CASCADE
    );
  `);

  // Seed default admin user if database is empty
  const adminEmail = 'admin@agency.com';
  const existingAdmin = await dbInstance.get('SELECT * FROM users WHERE email = ?', [adminEmail]);
  if (!existingAdmin) {
    const adminId = crypto.randomUUID();
    const defaultHash = hashPassword('admin123'); // Default password, change in settings
    await dbInstance.run(
      'INSERT INTO users (id, email, password_hash, role, company_name) VALUES (?, ?, ?, ?, ?)',
      [adminId, adminEmail, defaultHash, 'agency_admin', 'Creative Agency Admin']
    );
    console.log(`Default admin created: ${adminEmail} / admin123`);
  }

  return dbInstance;
}

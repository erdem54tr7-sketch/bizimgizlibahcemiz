import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'garden.sqlite');
export const db = new DatabaseSync(dbPath);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'partner')),
    avatar_emoji TEXT NOT NULL DEFAULT '🌿',
    ribbon_color TEXT NOT NULL DEFAULT '#34d399',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    login_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    logout_at TEXT,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    user_agent TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS wishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'fulfilled')),
    branch_slot INTEGER NOT NULL DEFAULT 0,
    ribbon_color TEXT NOT NULL DEFAULT '#f9a8d4',
    created_at TEXT NOT NULL,
    fulfilled_at TEXT,
    fulfilled_by INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fulfilled_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS letters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_id INTEGER NOT NULL,
    recipient_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    mood TEXT NOT NULL DEFAULT '💌',
    is_read INTEGER NOT NULL DEFAULT 0,
    read_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    flower_id TEXT NOT NULL,
    nickname TEXT,
    planted_at TEXT NOT NULL,
    growth_points INTEGER NOT NULL DEFAULT 0,
    growth_days_required INTEGER NOT NULL DEFAULT 4,
    water_level INTEGER NOT NULL DEFAULT 65,
    sun_exposure TEXT NOT NULL DEFAULT 'Tam Güneş',
    last_watered_at TEXT,
    last_watered_date TEXT,
    water_count INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS pot_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pot_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (pot_id) REFERENCES pots(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );
`);

export function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return { hash, salt };
}

export function verifyPassword(password, salt, expectedHash) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(expectedHash, 'hex'));
}

export function getTodayDateString() {
  // Türkiye saati (Europe/Istanbul) bazlı gün anahtarı
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function seedInitialData() {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (userCount > 0) return;

  const now = new Date().toISOString();

  const adminUsername = (process.env.ADMIN_USER || 'erdem').trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASS || 'bahce2026';
  const adminName = process.env.ADMIN_NAME || 'Erdem';

  const partnerUsername = (process.env.PARTNER_USER || 'zeynep').trim().toLowerCase();
  const partnerPassword = process.env.PARTNER_PASS || '11.11.2026';
  const partnerName = process.env.PARTNER_NAME || 'Zeynep';

  const adminCreds = hashPassword(adminPassword);
  const partnerCreds = hashPassword(partnerPassword);

  const insertUser = db.prepare(`
    INSERT INTO users (username, password_hash, salt, display_name, role, avatar_emoji, ribbon_color, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const adminRes = insertUser.run(
    adminUsername,
    adminCreds.hash,
    adminCreds.salt,
    adminName,
    'admin',
    '🌿',
    '#6ee7b7',
    now
  );
  const partnerRes = insertUser.run(
    partnerUsername,
    partnerCreds.hash,
    partnerCreds.salt,
    partnerName,
    'partner',
    '🌸',
    '#fda4af',
    now
  );

  const adminId = Number(adminRes.lastInsertRowid);
  const partnerId = Number(partnerRes.lastInsertRowid);

  // Söğüt ağacının başlangıçta romantik görünmesi için 2 örnek dilek
  const insertWish = db.prepare(`
    INSERT INTO wishes (user_id, content, status, branch_slot, ribbon_color, created_at, fulfilled_at, fulfilled_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertWish.run(
    adminId,
    'Seninle el ele yürürken zamanın hep böyle huzurlu akmasını diliyorum.',
    'pending',
    1,
    '#6ee7b7',
    now,
    null,
    null
  );
  insertWish.run(
    partnerId,
    'Birlikte kurduğumuz bu küçük bahçede her hayalimizin çiçek açmasını diliyorum.',
    'fulfilled',
    4,
    '#fda4af',
    now,
    now,
    adminId
  );

  // Gizli mektup kutusuna hoş geldin mektubu
  db.prepare(`
    INSERT INTO letters (sender_id, recipient_id, title, content, mood, is_read, created_at)
    VALUES (?, ?, ?, ?, ?, 0, ?)
  `).run(
    adminId,
    partnerId,
    'Zeynep’e Söğüt Ağacının Altındaki İlk Mektup',
    'Bu küçük cennet bahçesi sadece ikimize ait. Ne zaman aklına bir dilek düşse dallara as, ne zaman kalbinden bir cümle geçse bu mektup kutusuna bırak. Seni çok seviyorum.',
    '💚',
    now
  );

  // Örnek bir başlangıç saksısı (Tohum evresinde)
  db.prepare(`
    INSERT INTO pots (user_id, flower_id, nickname, planted_at, growth_points, growth_days_required, water_level, sun_exposure, last_watered_at, last_watered_date, water_count)
    VALUES (?, 'kirmizi-gul', 'İlk Gülümüz', ?, 0, 4, 55, 'Tam Güneş', NULL, NULL, 0)
  `).run(partnerId, now);
}

seedInitialData();

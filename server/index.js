import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { db, verifyPassword, getTodayDateString } from './db.js';
import { FLOWERS, getFlowerById } from './catalog.js';
import { buildRuleBasedAdvice, generateAiAdvice, getGrowthStage } from './aiAdvisor.js';
import { restoreFromCloud, scheduleBackup, backupNow } from './cloudBackup.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT || 3001);

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.text({ type: 'text/plain', limit: '64kb' }));

function extractToken(req) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }
  if (typeof req.body === 'string') {
    try {
      const parsed = JSON.parse(req.body);
      if (parsed?.token) return String(parsed.token);
    } catch {
      return null;
    }
  }
  if (req.body && typeof req.body === 'object' && req.body.token) {
    return String(req.body.token);
  }
  return null;
}

function authMiddleware(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({ error: 'Oturum anahtarı bulunamadı. Lütfen giriş yapın.' });
  }

  const row = db
    .prepare(
      `SELECT s.id as session_id, s.user_id, s.login_at, s.is_active,
              u.username, u.display_name, u.role, u.avatar_emoji, u.ribbon_color
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ?`
    )
    .get(token);

  if (!row || !row.is_active) {
    return res.status(401).json({ error: 'Oturum süresi dolmuş veya kapatılmış.' });
  }

  req.user = {
    id: row.user_id,
    username: row.username,
    displayName: row.display_name,
    role: row.role,
    avatarEmoji: row.avatar_emoji,
    ribbonColor: row.ribbon_color,
    sessionId: row.session_id,
    loginAt: row.login_at,
  };
  next();
}

function computeDynamicWaterLevel(pot) {
  const refDate = pot.last_watered_at || pot.planted_at;
  if (!refDate) return pot.water_level;
  const elapsedHours = Math.max(0, (Date.now() - new Date(refDate).getTime()) / (1000 * 60 * 60));
  const flower = getFlowerById(pot.flower_id);
  const decayPerHour = flower?.waterNeed === 'Yüksek' ? 1.8 : flower?.waterNeed === 'Az' ? 0.7 : 1.15;
  const decayed = Math.round(Math.max(10, Math.min(100, pot.water_level - elapsedHours * decayPerHour)));
  return decayed;
}

function enrichPot(pot, currentUserId) {
  const flower = getFlowerById(pot.flower_id) || FLOWERS[0];
  const today = getTodayDateString();
  const wateredToday = pot.last_watered_date === today;
  const effectiveWaterLevel = wateredToday ? Math.max(pot.water_level, 92) : computeDynamicWaterLevel(pot);
  const stageInfo = getGrowthStage(pot.growth_points, pot.growth_days_required);

  const notes = db
    .prepare(
      `SELECT n.id, n.pot_id, n.user_id, n.content, n.created_at, u.display_name as author_name
       FROM pot_notes n
       JOIN users u ON u.id = n.user_id
       WHERE n.pot_id = ?
       ORDER BY n.created_at DESC`
    )
    .all(pot.id);

  const owner = db
    .prepare('SELECT id, display_name, avatar_emoji, role FROM users WHERE id = ?')
    .get(pot.user_id);

  const aiAdvice = buildRuleBasedAdvice({
    pot: { ...pot, water_level: effectiveWaterLevel },
    flower,
    wateredToday,
    latestNote: notes[0] || null,
  });

  return {
    id: pot.id,
    userId: pot.user_id,
    ownerName: owner?.display_name || 'Bahçıvan',
    ownerEmoji: owner?.avatar_emoji || '🌿',
    isMine: pot.user_id === currentUserId,
    flowerId: pot.flower_id,
    nickname: pot.nickname || flower.name,
    plantedAt: pot.planted_at,
    growthPoints: pot.growth_points,
    growthDaysRequired: pot.growth_days_required,
    waterLevel: effectiveWaterLevel,
    sunExposure: pot.sun_exposure,
    lastWateredAt: pot.last_watered_at,
    lastWateredDate: pot.last_watered_date,
    waterCount: pot.water_count,
    wateredToday,
    stageInfo,
    flower,
    notes,
    aiAdvice,
  };
}

// --- AUTH ROUTES ---
app.post('/api/auth/login', (req, res) => {
  const username = String(req.body?.username || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!username || !password) {
    return res.status(400).json({ error: 'Kullanıcı adı ve şifre gereklidir.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user || !verifyPassword(password, user.salt, user.password_hash)) {
    return res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı.' });
  }

  const now = new Date().toISOString();
  const sessionId = crypto.randomBytes(24).toString('hex');
  const userAgent = String(req.headers['user-agent'] || 'Bilinmeyen Cihaz').slice(0, 240);

  db.prepare(
    `INSERT INTO sessions (id, user_id, login_at, last_seen_at, logout_at, duration_seconds, user_agent, is_active)
     VALUES (?, ?, ?, ?, NULL, 0, ?, 1)`
  ).run(sessionId, user.id, now, now, userAgent);

  scheduleBackup(db);

  res.json({
    token: sessionId,
    user: {
      id: user.id,
      username: user.username,
      displayName: user.display_name,
      role: user.role,
      avatarEmoji: user.avatar_emoji,
      ribbonColor: user.ribbon_color,
    },
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.post('/api/auth/heartbeat', authMiddleware, (req, res) => {
  const now = new Date();
  const loginTime = new Date(req.user.loginAt);
  const durationSeconds = Math.max(0, Math.floor((now.getTime() - loginTime.getTime()) / 1000));

  db.prepare(
    `UPDATE sessions
     SET last_seen_at = ?, duration_seconds = ?
     WHERE id = ? AND is_active = 1`
  ).run(now.toISOString(), durationSeconds, req.user.sessionId);

  res.json({ ok: true, durationSeconds });
});

app.post('/api/auth/logout', (req, res) => {
  const token = extractToken(req);
  if (!token) {
    return res.status(200).json({ ok: true });
  }

  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(token);
  if (session && session.is_active) {
    const now = new Date();
    const loginTime = new Date(session.login_at);
    const durationSeconds = Math.max(0, Math.floor((now.getTime() - loginTime.getTime()) / 1000));

    db.prepare(
      `UPDATE sessions
       SET last_seen_at = ?, logout_at = ?, duration_seconds = ?, is_active = 0
       WHERE id = ?`
    ).run(now.toISOString(), now.toISOString(), durationSeconds, token);
    scheduleBackup(db, 600);
  }

  res.json({ ok: true });
});

// --- WISHES ROUTES ---
app.get('/api/wishes', authMiddleware, (_req, res) => {
  const rows = db
    .prepare(
      `SELECT w.id, w.user_id, w.content, w.status, w.branch_slot, w.ribbon_color,
              w.created_at, w.fulfilled_at, w.fulfilled_by,
              u.display_name as author_name, u.avatar_emoji as author_emoji,
              f.display_name as fulfilled_by_name
       FROM wishes w
       JOIN users u ON u.id = w.user_id
       LEFT JOIN users f ON f.id = w.fulfilled_by
       ORDER BY w.created_at DESC`
    )
    .all();

  res.json({ wishes: rows });
});

app.post('/api/wishes', authMiddleware, (req, res) => {
  const content = String(req.body?.content || '').trim();
  if (!content || content.length < 2) {
    return res.status(400).json({ error: 'Lütfen söğüde asmak için güzel bir dilek yaz.' });
  }
  if (content.length > 320) {
    return res.status(400).json({ error: 'Dilek en fazla 320 karakter olabilir.' });
  }

  const count = db.prepare('SELECT COUNT(*) as c FROM wishes').get().c;
  const branchSlot = count % 12;
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO wishes (user_id, content, status, branch_slot, ribbon_color, created_at)
       VALUES (?, ?, 'pending', ?, ?, ?)`
    )
    .run(req.user.id, content, branchSlot, req.user.ribbonColor, now);

  const wish = db
    .prepare(
      `SELECT w.*, u.display_name as author_name, u.avatar_emoji as author_emoji, NULL as fulfilled_by_name
       FROM wishes w
       JOIN users u ON u.id = w.user_id
       WHERE w.id = ?`
    )
    .get(Number(result.lastInsertRowid));

  scheduleBackup(db, 400);
  res.status(201).json({ wish });
});

app.patch('/api/wishes/:id/fulfill', authMiddleware, (req, res) => {
  const wishId = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM wishes WHERE id = ?').get(wishId);
  if (!existing) {
    return res.status(404).json({ error: 'Dilek bulunamadı.' });
  }
  if (existing.status === 'fulfilled') {
    return res.status(400).json({ error: 'Bu dilek zaten gerçekleşmiş!' });
  }

  const now = new Date().toISOString();
  db.prepare(
    `UPDATE wishes
     SET status = 'fulfilled', fulfilled_at = ?, fulfilled_by = ?
     WHERE id = ?`
  ).run(now, req.user.id, wishId);

  const updated = db
    .prepare(
      `SELECT w.*, u.display_name as author_name, u.avatar_emoji as author_emoji,
              f.display_name as fulfilled_by_name
       FROM wishes w
       JOIN users u ON u.id = w.user_id
       LEFT JOIN users f ON f.id = w.fulfilled_by
       WHERE w.id = ?`
    )
    .get(wishId);

  scheduleBackup(db, 400);
  res.json({ wish: updated });
});

// --- LETTERS (SECRET MAILBOX) ROUTES ---
app.get('/api/letters', authMiddleware, (req, res) => {
  const letters = db
    .prepare(
      `SELECT l.*, s.display_name as sender_name, s.avatar_emoji as sender_emoji,
              r.display_name as recipient_name
       FROM letters l
       JOIN users s ON s.id = l.sender_id
       JOIN users r ON r.id = l.recipient_id
       ORDER BY l.created_at DESC`
    )
    .all();

  const unreadCount = letters.filter((l) => l.recipient_id === req.user.id && !l.is_read).length;
  res.json({ letters, unreadCount });
});

app.post('/api/letters', authMiddleware, (req, res) => {
  const title = String(req.body?.title || '').trim() || 'Kalbimden Sana';
  const content = String(req.body?.content || '').trim();
  const mood = String(req.body?.mood || '💌').trim().slice(0, 8);

  if (!content) {
    return res.status(400).json({ error: 'Mektup içeriği boş olamaz.' });
  }

  const partner = db.prepare('SELECT id FROM users WHERE id != ? LIMIT 1').get(req.user.id);
  const recipientId = partner ? partner.id : req.user.id;
  const now = new Date().toISOString();

  const result = db
    .prepare(
      `INSERT INTO letters (sender_id, recipient_id, title, content, mood, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, 0, ?)`
    )
    .run(req.user.id, recipientId, title.slice(0, 120), content.slice(0, 2000), mood, now);

  const letter = db
    .prepare(
      `SELECT l.*, s.display_name as sender_name, s.avatar_emoji as sender_emoji,
              r.display_name as recipient_name
       FROM letters l
       JOIN users s ON s.id = l.sender_id
       JOIN users r ON r.id = l.recipient_id
       WHERE l.id = ?`
    )
    .get(Number(result.lastInsertRowid));

  scheduleBackup(db, 400);
  res.status(201).json({ letter });
});

app.patch('/api/letters/:id/read', authMiddleware, (req, res) => {
  const letterId = Number(req.params.id);
  const letter = db.prepare('SELECT * FROM letters WHERE id = ?').get(letterId);
  if (!letter) {
    return res.status(404).json({ error: 'Mektup bulunamadı.' });
  }

  if (letter.recipient_id === req.user.id && !letter.is_read) {
    db.prepare('UPDATE letters SET is_read = 1, read_at = ? WHERE id = ?').run(
      new Date().toISOString(),
      letterId
    );
    scheduleBackup(db);
  }

  res.json({ ok: true });
});

// --- CATALOG & POTS ROUTES ---
app.get('/api/catalog', authMiddleware, (_req, res) => {
  res.json({ flowers: FLOWERS });
});

app.get('/api/pots', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM pots ORDER BY planted_at DESC').all();
  const pots = rows.map((row) => enrichPot(row, req.user.id));
  res.json({ pots });
});

app.post('/api/pots', authMiddleware, (req, res) => {
  const flowerId = String(req.body?.flowerId || '');
  const nickname = String(req.body?.nickname || '').trim().slice(0, 60);

  const flower = getFlowerById(flowerId);
  if (!flower) {
    return res.status(404).json({ error: 'Seçilen çiçek katalogda bulunamadı.' });
  }

  const now = new Date().toISOString();
  const result = db
    .prepare(
      `INSERT INTO pots (user_id, flower_id, nickname, planted_at, growth_points, growth_days_required, water_level, sun_exposure, last_watered_at, last_watered_date, water_count)
       VALUES (?, ?, ?, ?, 0, ?, 55, ?, NULL, NULL, 0)`
    )
    .run(req.user.id, flower.id, nickname || flower.name, now, flower.growthDaysRequired, flower.sunlight);

  const potRow = db.prepare('SELECT * FROM pots WHERE id = ?').get(Number(result.lastInsertRowid));
  scheduleBackup(db, 500);
  res.status(201).json({ pot: enrichPot(potRow, req.user.id) });
});

app.post('/api/pots/:id/water', authMiddleware, (req, res) => {
  const potId = Number(req.params.id);
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  if (!pot) {
    return res.status(404).json({ error: 'Saksı bulunamadı.' });
  }
  if (pot.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sadece kendi saksılarını sulayabilirsin.' });
  }

  const today = getTodayDateString();
  if (pot.last_watered_date === today) {
    return res.status(400).json({
      error: 'Bu çiçeği bugün zaten suladın! Köklerinin suyu sindirmesine izin verelim.',
      alreadyWateredToday: true,
    });
  }

  const now = new Date().toISOString();
  const prevStage = getGrowthStage(pot.growth_points, pot.growth_days_required).stage;
  const newGrowthPoints = Math.min(pot.growth_days_required, pot.growth_points + 1);
  const newStage = getGrowthStage(newGrowthPoints, pot.growth_days_required).stage;
  const justBloomed = prevStage < 3 && newStage === 3;

  db.prepare(
    `UPDATE pots
     SET growth_points = ?, water_level = 100, last_watered_at = ?, last_watered_date = ?, water_count = water_count + 1
     WHERE id = ?`
  ).run(newGrowthPoints, now, today, potId);

  const updated = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  scheduleBackup(db, 500);
  res.json({
    pot: enrichPot(updated, req.user.id),
    justBloomed,
  });
});

app.patch('/api/pots/:id/sun', authMiddleware, (req, res) => {
  const potId = Number(req.params.id);
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  if (!pot) {
    return res.status(404).json({ error: 'Saksı bulunamadı.' });
  }
  if (pot.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sadece kendi saksının konumunu değiştirebilirsin.' });
  }

  const allowed = ['Tam Güneş', 'Yarı Gölge', 'Dolaylı Işık'];
  const sunExposure = String(req.body?.sunExposure || '');
  if (!allowed.includes(sunExposure)) {
    return res.status(400).json({ error: 'Geçersiz güneş konumu.' });
  }

  db.prepare('UPDATE pots SET sun_exposure = ? WHERE id = ?').run(sunExposure, potId);
  const updated = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  scheduleBackup(db);
  res.json({ pot: enrichPot(updated, req.user.id) });
});

app.post('/api/pots/:id/notes', authMiddleware, (req, res) => {
  const potId = Number(req.params.id);
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  if (!pot) {
    return res.status(404).json({ error: 'Saksı bulunamadı.' });
  }

  const content = String(req.body?.content || '').trim();
  if (!content) {
    return res.status(400).json({ error: 'Not alanı boş olamaz.' });
  }

  db.prepare('INSERT INTO pot_notes (pot_id, user_id, content, created_at) VALUES (?, ?, ?, ?)').run(
    potId,
    req.user.id,
    content.slice(0, 400),
    new Date().toISOString()
  );

  const updated = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  scheduleBackup(db, 500);
  res.status(201).json({ pot: enrichPot(updated, req.user.id) });
});

app.delete('/api/pots/:id/notes/:noteId', authMiddleware, (req, res) => {
  const potId = Number(req.params.id);
  const noteId = Number(req.params.noteId);
  const note = db.prepare('SELECT * FROM pot_notes WHERE id = ? AND pot_id = ?').get(noteId, potId);
  if (!note) {
    return res.status(404).json({ error: 'Not bulunamadı.' });
  }
  if (note.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Sadece kendi notunu silebilirsin.' });
  }

  db.prepare('DELETE FROM pot_notes WHERE id = ?').run(noteId);
  const updated = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  scheduleBackup(db, 500);
  res.json({ pot: enrichPot(updated, req.user.id) });
});

app.get('/api/pots/:id/advice', authMiddleware, async (req, res) => {
  const potId = Number(req.params.id);
  const pot = db.prepare('SELECT * FROM pots WHERE id = ?').get(potId);
  if (!pot) {
    return res.status(404).json({ error: 'Saksı bulunamadı.' });
  }
  const flower = getFlowerById(pot.flower_id) || FLOWERS[0];
  const today = getTodayDateString();
  const wateredToday = pot.last_watered_date === today;
  const latestNote = db
    .prepare('SELECT content, created_at FROM pot_notes WHERE pot_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(potId);

  const advice = await generateAiAdvice({
    pot: { ...pot, water_level: wateredToday ? 100 : computeDynamicWaterLevel(pot) },
    flower,
    wateredToday,
    latestNote,
  });

  res.json({ advice });
});

// --- ADMIN TRACKING PANEL ROUTE ---
app.get('/api/admin/logs', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bu alana yalnızca yönetici erişebilir.' });
  }

  // 2 dakikadan uzun süredir heartbeat almayan aktif oturumları otomatik pasifleştir
  const staleCutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  db.prepare(
    `UPDATE sessions
     SET is_active = 0, logout_at = COALESCE(logout_at, last_seen_at)
     WHERE is_active = 1 AND last_seen_at < ?`
  ).run(staleCutoff);

  const partner = db
    .prepare('SELECT id, username, display_name, avatar_emoji FROM users WHERE role = ? LIMIT 1')
    .get('partner');

  const partnerLogs = partner
    ? db
        .prepare(
          `SELECT id, login_at, last_seen_at, logout_at, duration_seconds, user_agent, is_active
           FROM sessions
           WHERE user_id = ?
           ORDER BY login_at DESC
           LIMIT 100`
        )
        .all(partner.id)
    : [];

  const totalVisits = partnerLogs.length;
  const totalDurationSeconds = partnerLogs.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);
  const isCurrentlyOnline = partnerLogs.some((s) => s.is_active === 1);
  const lastVisit = partnerLogs[0] || null;

  res.json({
    partner: partner
      ? {
          id: partner.id,
          username: partner.username,
          displayName: partner.display_name,
          avatarEmoji: partner.avatar_emoji,
        }
      : null,
    summary: {
      totalVisits,
      totalDurationSeconds,
      isCurrentlyOnline,
      lastLoginAt: lastVisit?.login_at || null,
      lastSeenAt: lastVisit?.last_seen_at || null,
    },
    logs: partnerLogs,
  });
});

// Serve production build if available
const distDir = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile('index.html', { root: distDir });
  });
}

await restoreFromCloud(db);

app.listen(PORT, () => {
  console.log(`Dilek Söğüdü sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});

async function handleShutdown() {
  await backupNow(db);
  process.exit(0);
}
process.on('SIGTERM', handleShutdown);
process.on('SIGINT', handleShutdown);

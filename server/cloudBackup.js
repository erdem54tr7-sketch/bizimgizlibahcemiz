const TOKEN = process.env.GITHUB_BACKUP_TOKEN || '';
const REPO = process.env.GITHUB_BACKUP_REPO || '';
const FILE_PATH = process.env.GITHUB_BACKUP_PATH || 'garden-backup.json';

let lastSha = null;
let backupTimer = null;
let inFlight = false;
let pendingAgain = false;

export function isCloudBackupEnabled() {
  return Boolean(TOKEN && REPO);
}

function getHeaders() {
  return {
    Authorization: `token ${TOKEN}`,
    'User-Agent': 'bizimgizlibahcemiz-backup',
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
  };
}

export function exportDatabaseSnapshot(db) {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    users: db.prepare('SELECT * FROM users').all(),
    sessions: db.prepare('SELECT * FROM sessions ORDER BY login_at DESC LIMIT 300').all(),
    wishes: db.prepare('SELECT * FROM wishes').all(),
    letters: db.prepare('SELECT * FROM letters').all(),
    pots: db.prepare('SELECT * FROM pots').all(),
    pot_notes: db.prepare('SELECT * FROM pot_notes').all(),
  };
}

export async function restoreFromCloud(db) {
  if (!isCloudBackupEnabled()) return false;

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
      headers: getHeaders(),
      signal: AbortSignal.timeout(8000),
    });

    if (res.status === 404) {
      console.log('[Backup] Henüz bulut yedeği yok, ilk yedek oluşturulacak.');
      await backupNow(db);
      return false;
    }

    if (!res.ok) {
      console.warn('[Backup] Bulut yedeği okunamadı:', res.status);
      return false;
    }

    const fileData = await res.json();
    lastSha = fileData.sha || null;
    const rawJson = Buffer.from(fileData.content || '', 'base64').toString('utf8');
    const snapshot = JSON.parse(rawJson);

    if (!snapshot || !Array.isArray(snapshot.users) || snapshot.users.length === 0) {
      return false;
    }

    db.exec('BEGIN TRANSACTION;');
    try {
      db.exec(`
        DELETE FROM pot_notes;
        DELETE FROM pots;
        DELETE FROM letters;
        DELETE FROM wishes;
        DELETE FROM sessions;
        DELETE FROM users;
      `);

      const insUser = db.prepare(`
        INSERT INTO users (id, username, password_hash, salt, display_name, role, avatar_emoji, ribbon_color, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const u of snapshot.users) {
        insUser.run(
          u.id,
          u.username,
          u.password_hash,
          u.salt,
          u.display_name,
          u.role,
          u.avatar_emoji,
          u.ribbon_color,
          u.created_at
        );
      }

      const insSession = db.prepare(`
        INSERT INTO sessions (id, user_id, login_at, last_seen_at, logout_at, duration_seconds, user_agent, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const s of snapshot.sessions || []) {
        insSession.run(
          s.id,
          s.user_id,
          s.login_at,
          s.last_seen_at,
          s.logout_at,
          s.duration_seconds,
          s.user_agent,
          s.is_active
        );
      }

      const insWish = db.prepare(`
        INSERT INTO wishes (id, user_id, content, status, branch_slot, ribbon_color, created_at, fulfilled_at, fulfilled_by)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const w of snapshot.wishes || []) {
        insWish.run(
          w.id,
          w.user_id,
          w.content,
          w.status,
          w.branch_slot,
          w.ribbon_color,
          w.created_at,
          w.fulfilled_at,
          w.fulfilled_by
        );
      }

      const insLetter = db.prepare(`
        INSERT INTO letters (id, sender_id, recipient_id, title, content, mood, is_read, read_at, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const l of snapshot.letters || []) {
        insLetter.run(
          l.id,
          l.sender_id,
          l.recipient_id,
          l.title,
          l.content,
          l.mood,
          l.is_read,
          l.read_at,
          l.created_at
        );
      }

      const insPot = db.prepare(`
        INSERT INTO pots (id, user_id, flower_id, nickname, planted_at, growth_points, growth_days_required, water_level, sun_exposure, last_watered_at, last_watered_date, water_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      for (const p of snapshot.pots || []) {
        insPot.run(
          p.id,
          p.user_id,
          p.flower_id,
          p.nickname,
          p.planted_at,
          p.growth_points,
          p.growth_days_required,
          p.water_level,
          p.sun_exposure,
          p.last_watered_at,
          p.last_watered_date,
          p.water_count
        );
      }

      const insNote = db.prepare(`
        INSERT INTO pot_notes (id, pot_id, user_id, content, created_at)
        VALUES (?, ?, ?, ?, ?)
      `);
      for (const n of snapshot.pot_notes || []) {
        insNote.run(n.id, n.pot_id, n.user_id, n.content, n.created_at);
      }

      db.exec('COMMIT;');
      console.log(
        `[Backup] Buluttan geri yüklendi: ${(snapshot.wishes || []).length} dilek, ${(snapshot.letters || []).length} mektup, ${(snapshot.pots || []).length} saksı.`
      );
      return true;
    } catch (err) {
      db.exec('ROLLBACK;');
      throw err;
    }
  } catch (err) {
    console.error('[Backup] Geri yükleme hatası:', err);
    return false;
  }
}

async function fetchLatestSha() {
  const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
    headers: getHeaders(),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.sha || null;
}

export async function backupNow(db) {
  if (!isCloudBackupEnabled()) return;
  if (inFlight) {
    pendingAgain = true;
    return;
  }
  inFlight = true;

  try {
    const snapshot = exportDatabaseSnapshot(db);
    const contentB64 = Buffer.from(JSON.stringify(snapshot, null, 2), 'utf8').toString('base64');

    const doPut = async (sha) => {
      const body = {
        message: `backup ${new Date().toISOString()}`,
        content: contentB64,
        ...(sha ? { sha } : {}),
      };
      return fetch(`https://api.github.com/repos/${REPO}/contents/${FILE_PATH}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(8000),
      });
    };

    let res = await doPut(lastSha);
    if (res.status === 409 || res.status === 422) {
      lastSha = await fetchLatestSha();
      res = await doPut(lastSha);
    }

    if (res.ok) {
      const data = await res.json();
      lastSha = data?.content?.sha || lastSha;
    } else {
      console.warn('[Backup] Buluta kaydetme hatası:', res.status);
    }
  } catch (err) {
    console.warn('[Backup] Bulut yedekleme başarısız:', err?.message || err);
  } finally {
    inFlight = false;
    if (pendingAgain) {
      pendingAgain = false;
      backupNow(db);
    }
  }
}

export function scheduleBackup(db, delayMs = 1200) {
  if (!isCloudBackupEnabled()) return;
  if (backupTimer) clearTimeout(backupTimer);
  backupTimer = setTimeout(() => {
    backupTimer = null;
    backupNow(db);
  }, delayMs);
}

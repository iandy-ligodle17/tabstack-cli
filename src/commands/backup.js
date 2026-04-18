const path = require('path');
const fs = require('fs');
const { listSessions, loadSession } = require('../storage');

async function backupSessions(backupPath, options = {}) {
  const sessions = await listSessions();

  if (sessions.length === 0) {
    return { count: 0, backupFile: null };
  }

  const backup = {
    version: 1,
    createdAt: new Date().toISOString(),
    sessions: {}
  };

  for (const name of sessions) {
    try {
      const data = await loadSession(name);
      backup.sessions[name] = data;
    } catch (err) {
      if (!options.skipErrors) throw err;
    }
  }

  const outFile = backupPath.endsWith('.json')
    ? backupPath
    : path.join(backupPath, `tabstack-backup-${Date.now()}.json`);

  const dir = path.dirname(outFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  fs.writeFileSync(outFile, JSON.stringify(backup, null, 2));

  return { count: Object.keys(backup.sessions).length, backupFile: outFile };
}

async function restoreBackup(backupFile, options = {}) {
  if (!fs.existsSync(backupFile)) {
    throw new Error(`Backup file not found: ${backupFile}`);
  }

  const raw = fs.readFileSync(backupFile, 'utf8');
  const backup = JSON.parse(raw);

  if (!backup.sessions || typeof backup.sessions !== 'object') {
    throw new Error('Invalid backup file format');
  }

  const { saveSession, listSessions: list } = require('../storage');
  const existing = await list();
  const restored = [];
  const skipped = [];

  for (const [name, data] of Object.entries(backup.sessions)) {
    if (existing.includes(name) && !options.overwrite) {
      skipped.push(name);
      continue;
    }
    await saveSession(name, data);
    restored.push(name);
  }

  return { restored, skipped };
}

module.exports = { backupSessions, restoreBackup };

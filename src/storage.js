const fs = require('fs');
const path = require('path');
const os = require('os');

const SESSIONS_DIR = path.join(os.homedir(), '.tabstack', 'sessions');

function ensureSessionsDir() {
  if (!fs.existsSync(SESSIONS_DIR)) {
    fs.mkdirSync(SESSIONS_DIR, { recursive: true });
  }
}

function saveSession(name, tabs) {
  ensureSessionsDir();
  const sessionFile = path.join(SESSIONS_DIR, `${name}.json`);
  const session = {
    name,
    savedAt: new Date().toISOString(),
    tabs,
  };
  fs.writeFileSync(sessionFile, JSON.stringify(session, null, 2));
  return sessionFile;
}

function loadSession(name) {
  const sessionFile = path.join(SESSIONS_DIR, `${name}.json`);
  if (!fs.existsSync(sessionFile)) {
    throw new Error(`Session "${name}" not found.`);
  }
  const raw = fs.readFileSync(sessionFile, 'utf-8');
  return JSON.parse(raw);
}

function listSessions() {
  ensureSessionsDir();
  return fs
    .readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace('.json', ''));
}

function deleteSession(name) {
  const sessionFile = path.join(SESSIONS_DIR, `${name}.json`);
  if (!fs.existsSync(sessionFile)) {
    throw new Error(`Session "${name}" not found.`);
  }
  fs.unlinkSync(sessionFile);
}

module.exports = { saveSession, loadSession, listSessions, deleteSession, SESSIONS_DIR };

const fs = require('fs');
const path = require('path');
const os = require('os');
const { saveSession, loadSession, listSessions, deleteSession } = require('./storage');

const SESSIONS_DIR = path.join(os.homedir(), '.tabstack', 'sessions');

const TEST_SESSION = 'test-session';
const TEST_TABS = [
  { url: 'https://example.com', title: 'Example' },
  { url: 'https://github.com', title: 'GitHub' },
];

afterEach(() => {
  const file = path.join(SESSIONS_DIR, `${TEST_SESSION}.json`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
});

test('saveSession writes a JSON file', () => {
  const filePath = saveSession(TEST_SESSION, TEST_TABS);
  expect(fs.existsSync(filePath)).toBe(true);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  expect(data.name).toBe(TEST_SESSION);
  expect(data.tabs).toHaveLength(2);
  expect(data.savedAt).toBeDefined();
});

test('loadSession returns saved session data', () => {
  saveSession(TEST_SESSION, TEST_TABS);
  const session = loadSession(TEST_SESSION);
  expect(session.name).toBe(TEST_SESSION);
  expect(session.tabs[0].url).toBe('https://example.com');
});

test('loadSession throws for missing session', () => {
  expect(() => loadSession('nonexistent')).toThrow('Session "nonexistent" not found.');
});

test('listSessions includes saved session', () => {
  saveSession(TEST_SESSION, TEST_TABS);
  const sessions = listSessions();
  expect(sessions).toContain(TEST_SESSION);
});

test('deleteSession removes the session file', () => {
  saveSession(TEST_SESSION, TEST_TABS);
  deleteSession(TEST_SESSION);
  expect(() => loadSession(TEST_SESSION)).toThrow();
});

test('deleteSession throws for missing session', () => {
  expect(() => deleteSession('ghost')).toThrow('Session "ghost" not found.');
});

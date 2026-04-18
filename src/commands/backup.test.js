const fs = require('fs');
const path = require('path');
const os = require('os');
const { backupSessions, restoreBackup } = require('./backup');

jest.mock('../storage');
const storage = require('../storage');

describe('backupSessions', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabstack-backup-'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns count 0 when no sessions exist', async () => {
    storage.listSessions.mockResolvedValue([]);
    const result = await backupSessions(tmpDir);
    expect(result.count).toBe(0);
    expect(result.backupFile).toBeNull();
  });

  it('writes backup file with all sessions', async () => {
    storage.listSessions.mockResolvedValue(['work', 'personal']);
    storage.loadSession
      .mockResolvedValueOnce({ tabs: ['https://a.com'] })
      .mockResolvedValueOnce({ tabs: ['https://b.com'] });

    const result = await backupSessions(tmpDir);
    expect(result.count).toBe(2);
    expect(fs.existsSync(result.backupFile)).toBe(true);

    const contents = JSON.parse(fs.readFileSync(result.backupFile, 'utf8'));
    expect(contents.version).toBe(1);
    expect(contents.sessions).toHaveProperty('work');
    expect(contents.sessions).toHaveProperty('personal');
  });

  it('accepts a direct .json file path', async () => {
    storage.listSessions.mockResolvedValue(['alpha']);
    storage.loadSession.mockResolvedValue({ tabs: [] });
    const outFile = path.join(tmpDir, 'my-backup.json');
    const result = await backupSessions(outFile);
    expect(result.backupFile).toBe(outFile);
  });
});

describe('restoreBackup', () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabstack-restore-'));
    jest.clearAllMocks();
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('throws if backup file does not exist', async () => {
    await expect(restoreBackup('/nonexistent/file.json')).rejects.toThrow('not found');
  });

  it('restores sessions from backup', async () => {
    const backupFile = path.join(tmpDir, 'backup.json');
    const backup = { version: 1, createdAt: new Date().toISOString(), sessions: { work: { tabs: ['https://x.com'] } } };
    fs.writeFileSync(backupFile, JSON.stringify(backup));

    storage.listSessions.mockResolvedValue([]);
    storage.saveSession.mockResolvedValue();

    const result = await restoreBackup(backupFile);
    expect(result.restored).toContain('work');
    expect(result.skipped).toHaveLength(0);
  });

  it('skips existing sessions without overwrite flag', async () => {
    const backupFile = path.join(tmpDir, 'backup.json');
    const backup = { version: 1, createdAt: new Date().toISOString(), sessions: { work: { tabs: [] } } };
    fs.writeFileSync(backupFile, JSON.stringify(backup));

    storage.listSessions.mockResolvedValue(['work']);
    storage.saveSession.mockResolvedValue();

    const result = await restoreBackup(backupFile);
    expect(result.skipped).toContain('work');
    expect(result.restored).toHaveLength(0);
  });
});

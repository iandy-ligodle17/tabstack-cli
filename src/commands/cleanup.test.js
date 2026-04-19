const { cleanupSessions, formatCleanupResult } = require('./cleanup');
const storage = require('../storage');

jest.mock('../storage');

describe('cleanupSessions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('removes sessions with fewer tabs than minTabs', async () => {
    storage.listSessions.mockResolvedValue(['empty', 'full']);
    storage.loadSession.mockImplementation(name =>
      Promise.resolve({ tabs: name === 'empty' ? [] : [{ url: 'https://example.com' }] })
    );
    storage.deleteSession.mockResolvedValue();

    const result = await cleanupSessions({ minTabs: 1 });
    expect(result.removed).toHaveLength(1);
    expect(result.removed[0].name).toBe('empty');
    expect(storage.deleteSession).toHaveBeenCalledWith('empty');
    expect(storage.deleteSession).not.toHaveBeenCalledWith('full');
  });

  it('does not delete in dry-run mode', async () => {
    storage.listSessions.mockResolvedValue(['tiny']);
    storage.loadSession.mockResolvedValue({ tabs: [] });

    const result = await cleanupSessions({ dryRun: true, minTabs: 1 });
    expect(result.removed).toHaveLength(1);
    expect(result.dryRun).toBe(true);
    expect(storage.deleteSession).not.toHaveBeenCalled();
  });

  it('collects errors for unreadable sessions', async () => {
    storage.listSessions.mockResolvedValue(['bad']);
    storage.loadSession.mockRejectedValue(new Error('file not found'));

    const result = await cleanupSessions();
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].name).toBe('bad');
  });
});

describe('formatCleanupResult', () => {
  it('shows nothing to clean up when empty', () => {
    const out = formatCleanupResult({ removed: [], errors: [], dryRun: false });
    expect(out).toContain('nothing to clean up');
  });

  it('shows dry-run prefix', () => {
    const out = formatCleanupResult({ removed: [{ name: 'x', tabCount: 0 }], errors: [], dryRun: true });
    expect(out).toContain('[dry-run]');
  });

  it('shows error details', () => {
    const out = formatCleanupResult({ removed: [], errors: [{ name: 'bad', error: 'oops' }], dryRun: false });
    expect(out).toContain('bad: oops');
  });
});

const { getRecentSessions, formatRecent } = require('./recent');
const storage = require('../storage');

jest.mock('../storage');

describe('getRecentSessions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns sessions sorted by savedAt descending', () => {
    storage.listSessions.mockReturnValue(['alpha', 'beta', 'gamma']);
    storage.loadSession.mockImplementation(name => ({
      savedAt: { alpha: '2024-01-03', beta: '2024-01-01', gamma: '2024-01-02' }[name],
      tabs: [1, 2]
    }));

    const result = getRecentSessions(3);
    expect(result[0].name).toBe('alpha');
    expect(result[1].name).toBe('gamma');
    expect(result[2].name).toBe('beta');
  });

  it('respects limit', () => {
    storage.listSessions.mockReturnValue(['a', 'b', 'c', 'd']);
    storage.loadSession.mockImplementation(name => ({
      savedAt: new Date().toISOString(),
      tabs: []
    }));

    const result = getRecentSessions(2);
    expect(result.length).toBe(2);
  });

  it('skips sessions with no savedAt', () => {
    storage.listSessions.mockReturnValue(['x', 'y']);
    storage.loadSession.mockImplementation(() => ({ tabs: [] }));

    const result = getRecentSessions(5);
    expect(result.length).toBe(0);
  });
});

describe('formatRecent', () => {
  it('returns message when empty', () => {
    expect(formatRecent([])).toBe('No recent sessions found.');
  });

  it('formats sessions correctly', () => {
    const sessions = [{ name: 'work', tabCount: 4, savedAt: '2024-06-01T10:00:00Z' }];
    const output = formatRecent(sessions);
    expect(output).toContain('work');
    expect(output).toContain('4 tab(s)');
  });
});

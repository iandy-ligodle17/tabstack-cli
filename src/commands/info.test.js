const { infoCommand } = require('./info');
const { loadSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub' },
  ],
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T12:00:00.000Z',
};

describe('infoCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('throws if no session name provided', async () => {
    await expect(infoCommand()).rejects.toThrow('Session name is required');
  });

  it('throws if session not found', async () => {
    loadSession.mockResolvedValue(null);
    await expect(infoCommand('missing')).rejects.toThrow('Session "missing" not found');
  });

  it('returns formatted string by default', async () => {
    loadSession.mockResolvedValue(mockSession);
    const result = await infoCommand('work');
    expect(typeof result).toBe('string');
    expect(result).toContain('Session: work');
    expect(result).toContain('Tabs: 2');
    expect(result).toContain('https://example.com');
    expect(result).toContain('https://github.com');
  });

  it('returns json object when json option is set', async () => {
    loadSession.mockResolvedValue(mockSession);
    const result = await infoCommand('work', { json: true });
    expect(result).toMatchObject({
      name: 'work',
      tabCount: 2,
      tabs: mockSession.tabs,
    });
  });

  it('handles session with no tabs', async () => {
    loadSession.mockResolvedValue({ tabs: [], createdAt: null, updatedAt: null });
    const result = await infoCommand('empty');
    expect(result).toContain('Tabs: 0');
    expect(result).toContain('Created: unknown');
  });
});

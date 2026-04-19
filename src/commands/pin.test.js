const { pinTab, getPinnedTabs } = require('./pin');
const storage = require('../storage');

jest.mock('../storage');

const mockSession = () => ({
  tabs: [
    { url: 'https://example.com', title: 'Example', pinned: false },
    { url: 'https://github.com', title: 'GitHub', pinned: false },
    { url: 'https://news.ycombinator.com', title: 'HN', pinned: true },
  ]
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('pinTab', () => {
  it('pins an unpinned tab', async () => {
    storage.loadSession.mockResolvedValue(mockSession());
    storage.saveSession.mockResolvedValue();

    const result = await pinTab('work', 0);
    expect(result.pinned).toBe(true);
    expect(result.tab.url).toBe('https://example.com');
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({
      tabs: expect.arrayContaining([
        expect.objectContaining({ url: 'https://example.com', pinned: true })
      ])
    }));
  });

  it('unpins an already pinned tab', async () => {
    storage.loadSession.mockResolvedValue(mockSession());
    storage.saveSession.mockResolvedValue();

    const result = await pinTab('work', 2);
    expect(result.pinned).toBe(false);
  });

  it('throws on invalid index', async () => {
    storage.loadSession.mockResolvedValue(mockSession());
    await expect(pinTab('work', 99)).rejects.toThrow('Invalid tab index');
  });

  it('throws if session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(pinTab('ghost', 0)).rejects.toThrow('not found');
  });
});

describe('getPinnedTabs', () => {
  it('returns only pinned tabs', async () => {
    storage.loadSession.mockResolvedValue(mockSession());
    const pinned = await getPinnedTabs('work');
    expect(pinned).toHaveLength(1);
    expect(pinned[0].url).toBe('https://news.ycombinator.com');
  });

  it('returns empty array when no tabs are pinned', async () => {
    const session = mockSession();
    session.tabs.forEach(t => t.pinned = false);
    storage.loadSession.mockResolvedValue(session);
    const pinned = await getPinnedTabs('work');
    expect(pinned).toHaveLength(0);
  });
});

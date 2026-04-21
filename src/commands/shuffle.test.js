const { shuffleTabs, shuffleSession } = require('./shuffle');
const storage = require('../storage');

jest.mock('../storage');

const makeTabs = () => [
  { url: 'https://a.com', title: 'A' },
  { url: 'https://b.com', title: 'B' },
  { url: 'https://c.com', title: 'C' },
  { url: 'https://d.com', title: 'D' },
  { url: 'https://e.com', title: 'E' },
];

describe('shuffleTabs', () => {
  it('returns same number of tabs', () => {
    const tabs = makeTabs();
    const result = shuffleTabs(tabs);
    expect(result).toHaveLength(tabs.length);
  });

  it('contains all original tabs', () => {
    const tabs = makeTabs();
    const result = shuffleTabs(tabs);
    const urls = result.map(t => t.url).sort();
    expect(urls).toEqual(tabs.map(t => t.url).sort());
  });

  it('does not mutate original array', () => {
    const tabs = makeTabs();
    const copy = [...tabs];
    shuffleTabs(tabs);
    expect(tabs).toEqual(copy);
  });

  it('produces deterministic output with a seed', () => {
    const tabs = makeTabs();
    const r1 = shuffleTabs(tabs, 42);
    const r2 = shuffleTabs(tabs, 42);
    expect(r1.map(t => t.url)).toEqual(r2.map(t => t.url));
  });

  it('produces different output for different seeds', () => {
    const tabs = makeTabs();
    const r1 = shuffleTabs(tabs, 1);
    const r2 = shuffleTabs(tabs, 9999);
    expect(r1.map(t => t.url)).not.toEqual(r2.map(t => t.url));
  });
});

describe('shuffleSession', () => {
  const mockSession = {
    name: 'work',
    tabs: makeTabs(),
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    storage.loadSession.mockResolvedValue({ ...mockSession, tabs: makeTabs() });
    storage.saveSession.mockResolvedValue();
  });

  it('saves shuffled session and returns it', async () => {
    const result = await shuffleSession('work', { seed: 7 });
    expect(storage.saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ name: 'work' }));
    expect(result.tabs).toHaveLength(mockSession.tabs.length);
    expect(result.updatedAt).toBeDefined();
  });

  it('throws if session has no tabs', async () => {
    storage.loadSession.mockResolvedValue({ name: 'empty', tabs: [] });
    await expect(shuffleSession('empty')).rejects.toThrow('no tabs to shuffle');
  });
});

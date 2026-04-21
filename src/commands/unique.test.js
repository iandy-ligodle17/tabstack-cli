const { uniqueCommand, uniqueTabs, formatUniqueResult } = require('./unique');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(urls) {
  return {
    name: 'test',
    tabs: urls.map(url => ({ url, title: url }))
  };
}

describe('uniqueTabs', () => {
  it('removes duplicate URLs', () => {
    const session = makeSession(['https://a.com', 'https://b.com', 'https://a.com']);
    const result = uniqueTabs(session);
    expect(result.tabs).toHaveLength(2);
    expect(result.tabs.map(t => t.url)).toEqual(['https://a.com', 'https://b.com']);
  });

  it('is case-insensitive for URLs', () => {
    const session = makeSession(['https://A.com', 'https://a.com']);
    const result = uniqueTabs(session);
    expect(result.tabs).toHaveLength(1);
  });

  it('returns session unchanged when no duplicates', () => {
    const session = makeSession(['https://a.com', 'https://b.com']);
    const result = uniqueTabs(session);
    expect(result.tabs).toHaveLength(2);
  });

  it('handles empty tabs array', () => {
    const result = uniqueTabs({ tabs: [] });
    expect(result.tabs).toHaveLength(0);
  });
});

describe('formatUniqueResult', () => {
  it('reports no duplicates found', () => {
    expect(formatUniqueResult(3, 3)).toMatch(/No duplicate/);
  });

  it('reports removed count and remaining', () => {
    const msg = formatUniqueResult(5, 3);
    expect(msg).toMatch(/Removed 2/);
    expect(msg).toMatch(/3 unique/);
  });

  it('uses singular for one removed', () => {
    expect(formatUniqueResult(2, 1)).toMatch(/duplicate[^s]/);
  });
});

describe('uniqueCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('saves deduped session and returns message', async () => {
    const session = makeSession(['https://a.com', 'https://a.com', 'https://b.com']);
    loadSession.mockResolvedValue(session);
    saveSession.mockResolvedValue();

    const msg = await uniqueCommand('test');
    expect(saveSession).toHaveBeenCalledWith('test', expect.objectContaining({
      tabs: expect.arrayContaining([expect.objectContaining({ url: 'https://a.com' })])
    }));
    expect(msg).toMatch(/Removed 1/);
  });

  it('does not save on dryRun', async () => {
    const session = makeSession(['https://x.com', 'https://x.com']);
    loadSession.mockResolvedValue(session);

    await uniqueCommand('test', { dryRun: true });
    expect(saveSession).not.toHaveBeenCalled();
  });

  it('throws if session not found', async () => {
    loadSession.mockResolvedValue(null);
    await expect(uniqueCommand('missing')).rejects.toThrow('not found');
  });
});

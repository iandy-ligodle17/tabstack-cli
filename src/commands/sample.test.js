const { sampleSession, sampleTabs, formatSampleResult } = require('./sample');
const storage = require('../storage');

jest.mock('../storage');

function makeSession(n) {
  return {
    name: 'test',
    tabs: Array.from({ length: n }, (_, i) => ({
      url: `https://example.com/page${i + 1}`,
      title: `Page ${i + 1}`,
    })),
  };
}

describe('sampleTabs', () => {
  test('returns n tabs from a larger set', () => {
    const tabs = makeSession(10).tabs;
    const result = sampleTabs(tabs, 3);
    expect(result).toHaveLength(3);
  });

  test('returns all tabs if n >= length', () => {
    const tabs = makeSession(4).tabs;
    const result = sampleTabs(tabs, 10);
    expect(result).toHaveLength(4);
  });

  test('does not mutate original array', () => {
    const tabs = makeSession(5).tabs;
    const copy = [...tabs];
    sampleTabs(tabs, 2);
    expect(tabs).toEqual(copy);
  });
});

describe('formatSampleResult', () => {
  test('includes session name and counts', () => {
    const sampled = makeSession(2).tabs;
    const out = formatSampleResult(10, sampled, 'mysession', null);
    expect(out).toContain('mysession');
    expect(out).toContain('Original tabs: 10');
    expect(out).toContain('Sampled tabs: 2');
  });

  test('includes output name when provided', () => {
    const sampled = makeSession(1).tabs;
    const out = formatSampleResult(5, sampled, 'src', 'dest');
    expect(out).toContain('Saved as: dest');
  });
});

describe('sampleSession', () => {
  beforeEach(() => jest.clearAllMocks());

  test('samples tabs and returns result', async () => {
    storage.loadSession.mockResolvedValue(makeSession(8));
    const result = await sampleSession('test', 3, null);
    expect(result.sampled).toHaveLength(3);
    expect(result.original).toBe(8);
    expect(storage.saveSession).not.toHaveBeenCalled();
  });

  test('saves to output session when outputName given', async () => {
    storage.loadSession.mockResolvedValue(makeSession(6));
    storage.saveSession.mockResolvedValue();
    await sampleSession('test', 2, 'out');
    expect(storage.saveSession).toHaveBeenCalledWith('out', expect.objectContaining({ name: 'out', sampledFrom: 'test' }));
  });

  test('throws on invalid sample size', async () => {
    storage.loadSession.mockResolvedValue(makeSession(5));
    await expect(sampleSession('test', 0, null)).rejects.toThrow('Invalid sample size');
  });

  test('throws when session not found', async () => {
    storage.loadSession.mockResolvedValue(null);
    await expect(sampleSession('ghost', 2, null)).rejects.toThrow('not found');
  });
});

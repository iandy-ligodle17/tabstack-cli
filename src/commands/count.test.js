const { countTabs, formatCount } = require('./count');
const { loadSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  tabs: [
    { url: 'https://github.com/foo', title: 'GitHub', pinned: true },
    { url: 'https://github.com/bar', title: 'GitHub 2', pinned: false },
    { url: 'https://news.ycombinator.com', title: 'HN', pinned: false },
    { url: 'not-a-url', title: 'Bad', pinned: false },
  ],
};

describe('countTabs', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns correct counts', () => {
    loadSession.mockReturnValue(mockSession);
    const result = countTabs('work');
    expect(result.total).toBe(4);
    expect(result.pinned).toBe(1);
    expect(result.unpinned).toBe(3);
    expect(result.uniqueDomains).toBe(3);
  });

  test('counts domain occurrences', () => {
    loadSession.mockReturnValue(mockSession);
    const result = countTabs('work');
    expect(result.domains['github.com']).toBe(2);
    expect(result.domains['news.ycombinator.com']).toBe(1);
    expect(result.domains['unknown']).toBe(1);
  });

  test('throws if session not found', () => {
    loadSession.mockReturnValue(null);
    expect(() => countTabs('missing')).toThrow('Session "missing" not found');
  });
});

describe('formatCount', () => {
  test('formats output correctly', () => {
    const result = { total: 4, pinned: 1, unpinned: 3, uniqueDomains: 3, domains: {} };
    const output = formatCount(result, 'work');
    expect(output).toContain('Session: work');
    expect(output).toContain('Total tabs:     4');
    expect(output).toContain('Pinned:         1');
    expect(output).toContain('Unique domains: 3');
  });
});

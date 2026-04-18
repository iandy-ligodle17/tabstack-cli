const filterByTag = require('./filter-by-tag');
const { loadSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'mixed',
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://news.ycombinator.com', title: 'HN' },
  ],
  tags: ['work', 'reading'],
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(JSON.parse(JSON.stringify(mockSession)));
});

test('returns session when tag matches', async () => {
  const results = await filterByTag('work', ['mixed']);
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('mixed');
});

test('returns empty array when tag does not match', async () => {
  const results = await filterByTag('nonexistent', ['mixed']);
  expect(results).toHaveLength(0);
});

test('handles session with no tags', async () => {
  loadSession.mockResolvedValue({ name: 'notags', tabs: [] });
  const results = await filterByTag('work', ['notags']);
  expect(results).toHaveLength(0);
});

test('filters multiple sessions correctly', async () => {
  const noTagSession = { name: 'empty', tabs: [], tags: [] };
  loadSession
    .mockResolvedValueOnce(JSON.parse(JSON.stringify(mockSession)))
    .mockResolvedValueOnce(noTagSession);
  const results = await filterByTag('reading', ['mixed', 'empty']);
  expect(results).toHaveLength(1);
  expect(results[0].name).toBe('mixed');
});

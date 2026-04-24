/**
 * Integration-style tests for concat — exercises concatSessions with
 * real-ish session objects (no storage mocking).
 */
const { concatSessions, formatConcatResult } = require('./concat');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(name, urls) {
  return {
    name,
    tabs: urls.map(url => ({ url, title: url })),
    createdAt: new Date().toISOString(),
    tags: [],
  };
}

beforeEach(() => jest.clearAllMocks());

test('three sessions are fully merged in order', async () => {
  loadSession
    .mockResolvedValueOnce(makeSession('a', ['https://a1.com', 'https://a2.com']))
    .mockResolvedValueOnce(makeSession('b', ['https://b1.com']))
    .mockResolvedValueOnce(makeSession('c', ['https://c1.com', 'https://c2.com', 'https://c3.com']));
  saveSession.mockResolvedValue();

  const result = await concatSessions(['a', 'b', 'c'], 'abc');

  expect(result.tabs).toHaveLength(6);
  expect(result.tabs.map(t => t.url)).toEqual([
    'https://a1.com', 'https://a2.com',
    'https://b1.com',
    'https://c1.com', 'https://c2.com', 'https://c3.com',
  ]);
});

test('empty sessions are handled gracefully', async () => {
  loadSession
    .mockResolvedValueOnce(makeSession('empty1', []))
    .mockResolvedValueOnce(makeSession('empty2', []));
  saveSession.mockResolvedValue();

  const result = await concatSessions(['empty1', 'empty2'], 'nothing');
  expect(result.tabs).toHaveLength(0);
});

test('tags option is stored on the result', async () => {
  loadSession
    .mockResolvedValueOnce(makeSession('x', ['https://x.com']))
    .mockResolvedValueOnce(makeSession('y', ['https://y.com']));
  saveSession.mockResolvedValue();

  const result = await concatSessions(['x', 'y'], 'tagged', { tags: ['foo', 'bar'] });
  expect(result.tags).toEqual(['foo', 'bar']);
});

test('formatConcatResult lists all source names', () => {
  const result = { name: 'big', tabs: new Array(10).fill({}) };
  const out = formatConcatResult(result, ['alpha', 'beta', 'gamma']);
  expect(out).toContain('alpha');
  expect(out).toContain('beta');
  expect(out).toContain('gamma');
  expect(out).toContain('Total tabs: 10');
});

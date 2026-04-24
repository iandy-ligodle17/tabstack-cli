const { zipSessions, formatZipResult } = require('./zip');

jest.mock('../storage', () => ({
  loadSession: jest.fn(),
  saveSession: jest.fn(),
}));

const { loadSession, saveSession } = require('../storage');

const makeSession = (tabs, tags = []) => ({ tabs, tags });

beforeEach(() => jest.clearAllMocks());

test('zipSessions combines tabs from multiple sessions', () => {
  loadSession
    .mockReturnValueOnce(makeSession([{ url: 'https://a.com' }]))
    .mockReturnValueOnce(makeSession([{ url: 'https://b.com' }, { url: 'https://c.com' }]));

  const result = zipSessions(['alpha', 'beta'], 'merged', '/sessions');

  expect(result.name).toBe('merged');
  expect(result.session.tabs).toHaveLength(3);
  expect(result.session.zipped).toHaveLength(2);
  expect(saveSession).toHaveBeenCalledWith('merged', expect.objectContaining({ tabs: expect.any(Array) }), '/sessions');
});

test('zipSessions throws if fewer than two names given', () => {
  expect(() => zipSessions(['only'], 'out', '/sessions')).toThrow('At least two');
});

test('zipSessions throws if a session is not found', () => {
  loadSession.mockReturnValueOnce(null);
  expect(() => zipSessions(['missing', 'other'], 'out', '/sessions')).toThrow('Session not found: missing');
});

test('zipSessions uses auto-generated name when outputName omitted', () => {
  loadSession
    .mockReturnValueOnce(makeSession([{ url: 'https://x.com' }]))
    .mockReturnValueOnce(makeSession([{ url: 'https://y.com' }]));

  const result = zipSessions(['s1', 's2'], null, '/sessions');
  expect(result.name).toMatch(/^zip-/);
});

test('formatZipResult returns readable summary', () => {
  const result = {
    name: 'merged',
    session: {
      tabs: [{}, {}, {}],
      zipped: [
        { name: 'alpha', tabCount: 1 },
        { name: 'beta', tabCount: 2 },
      ],
    },
  };
  const output = formatZipResult(result);
  expect(output).toContain('merged');
  expect(output).toContain('Total tabs: 3');
  expect(output).toContain('alpha (1 tabs)');
  expect(output).toContain('beta (2 tabs)');
});

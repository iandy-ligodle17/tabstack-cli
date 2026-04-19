const { diffSessions, formatDiff } = require('./diff');
const { loadSession } = require('../storage');

jest.mock('../storage');

const sessionA = {
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://shared.com', title: 'Shared' }
  ]
};

const sessionB = {
  tabs: [
    { url: 'https://other.com', title: 'Other' },
    { url: 'https://shared.com', title: 'Shared' }
  ]
};

beforeEach(() => {
  loadSession.mockReset();
});

test('returns tabs only in A, only in B, and shared', () => {
  loadSession.mockImplementation(name => name === 'a' ? sessionA : sessionB);
  const diff = diffSessions('a', 'b');
  expect(diff.onlyInA).toHaveLength(1);
  expect(diff.onlyInA[0].url).toBe('https://example.com');
  expect(diff.onlyInB).toHaveLength(1);
  expect(diff.onlyInB[0].url).toBe('https://other.com');
  expect(diff.inBoth).toHaveLength(1);
});

test('throws if session A not found', () => {
  loadSession.mockReturnValue(null);
  expect(() => diffSessions('missing', 'b')).toThrow('"missing" not found');
});

test('throws if session B not found', () => {
  loadSession.mockImplementation(name => name === 'a' ? sessionA : null);
  expect(() => diffSessions('a', 'missing')).toThrow('"missing" not found');
});

test('formatDiff shows identical message when no differences', () => {
  loadSession.mockReturnValue(sessionA);
  const diff = diffSessions('a', 'a');
  const output = formatDiff('a', 'a', diff);
  expect(output).toContain('identical');
});

test('formatDiff includes section headers and counts', () => {
  loadSession.mockImplementation(name => name === 'a' ? sessionA : sessionB);
  const diff = diffSessions('a', 'b');
  const output = formatDiff('a', 'b', diff);
  expect(output).toContain('Only in "a"');
  expect(output).toContain('Only in "b"');
  expect(output).toContain('Shared tabs: 1');
});

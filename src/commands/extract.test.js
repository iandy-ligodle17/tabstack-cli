const { extractTabs, formatExtractResult } = require('./extract');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

const makeSession = (tabs) => ({ name: 'src', tabs });

beforeEach(() => jest.clearAllMocks());

test('extracts tabs matching a substring pattern', async () => {
  loadSession.mockResolvedValue(
    makeSession([
      { url: 'https://github.com/foo', title: 'GitHub' },
      { url: 'https://example.com', title: 'Example' },
      { url: 'https://github.com/bar', title: 'GitHub Bar' },
    ])
  );
  saveSession.mockResolvedValue();

  const result = await extractTabs('src', 'github', 'github-tabs', {});

  expect(result.extracted).toBe(2);
  expect(result.remaining).toBe(1);
  expect(saveSession).toHaveBeenCalledWith(
    'github-tabs',
    expect.objectContaining({ tabs: expect.arrayContaining([expect.objectContaining({ url: 'https://github.com/foo' })]) })
  );
});

test('returns zero when no tabs match', async () => {
  loadSession.mockResolvedValue(makeSession([{ url: 'https://example.com', title: 'Example' }]));
  const result = await extractTabs('src', 'github', 'dest', {});
  expect(result.extracted).toBe(0);
  expect(saveSession).not.toHaveBeenCalled();
});

test('removes matched tabs from source when remove option is set', async () => {
  loadSession.mockResolvedValue(
    makeSession([
      { url: 'https://github.com', title: 'GitHub' },
      { url: 'https://example.com', title: 'Example' },
    ])
  );
  saveSession.mockResolvedValue();

  await extractTabs('src', 'github', 'dest', { remove: true });

  expect(saveSession).toHaveBeenCalledWith('src', expect.objectContaining({ tabs: [{ url: 'https://example.com', title: 'Example' }] }));
});

test('supports regex pattern matching', async () => {
  loadSession.mockResolvedValue(
    makeSession([
      { url: 'https://docs.example.com', title: 'Docs' },
      { url: 'https://blog.example.com', title: 'Blog' },
      { url: 'https://other.io', title: 'Other' },
    ])
  );
  saveSession.mockResolvedValue();

  const result = await extractTabs('src', '^https://(docs|blog)', 'example-tabs', { regex: true });
  expect(result.extracted).toBe(2);
});

test('formatExtractResult without remove', () => {
  const out = formatExtractResult({ extracted: 3, remaining: 5 }, 'dest', false);
  expect(out).toContain('3 tab(s)');
  expect(out).not.toContain('remain');
});

test('formatExtractResult with remove', () => {
  const out = formatExtractResult({ extracted: 2, remaining: 4 }, 'dest', true);
  expect(out).toContain('4 tab(s) remain');
});

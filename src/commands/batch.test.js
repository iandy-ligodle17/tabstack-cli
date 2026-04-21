const { batchApply, formatBatchResult } = require('./batch');
const storage = require('../storage');

jest.mock('../storage');

const makeSession = (tabs = [], tags = []) => ({ tabs, tags });

beforeEach(() => jest.clearAllMocks());

test('batchApply tag adds tag to each session', async () => {
  const s1 = makeSession([{ url: 'https://a.com' }]);
  const s2 = makeSession([{ url: 'https://b.com' }]);
  storage.loadSession
    .mockResolvedValueOnce(s1)
    .mockResolvedValueOnce(s2);
  storage.saveSession.mockResolvedValue();

  const results = await batchApply(['s1', 's2'], 'tag', { tag: 'work' });

  expect(storage.saveSession).toHaveBeenCalledTimes(2);
  expect(s1.tags).toContain('work');
  expect(s2.tags).toContain('work');
  expect(results.every(r => r.success)).toBe(true);
});

test('batchApply dedupe removes duplicate urls', async () => {
  const session = makeSession([
    { url: 'https://a.com' },
    { url: 'https://a.com' },
    { url: 'https://b.com' },
  ]);
  storage.loadSession.mockResolvedValue(session);
  storage.saveSession.mockResolvedValue();

  await batchApply(['sess'], 'dedupe');

  expect(session.tabs).toHaveLength(2);
});

test('batchApply trim limits tabs', async () => {
  const tabs = Array.from({ length: 30 }, (_, i) => ({ url: `https://site${i}.com` }));
  storage.loadSession.mockResolvedValue(makeSession(tabs));
  storage.saveSession.mockResolvedValue();

  const results = await batchApply(['big'], 'trim', { max: 10 });

  expect(storage.saveSession.mock.calls[0][1].tabs).toHaveLength(10);
  expect(results[0].success).toBe(true);
});

test('batchApply returns failure on unknown operation', async () => {
  storage.loadSession.mockResolvedValue(makeSession());

  const results = await batchApply(['x'], 'explode');

  expect(results[0].success).toBe(false);
  expect(results[0].message).toMatch(/unknown operation/i);
});

test('batchApply handles loadSession error gracefully', async () => {
  storage.loadSession.mockRejectedValue(new Error('not found'));

  const results = await batchApply(['missing'], 'tag', { tag: 'x' });

  expect(results[0].success).toBe(false);
  expect(results[0].message).toBe('not found');
});

test('formatBatchResult formats output correctly', () => {
  const results = [
    { name: 'work', success: true, message: 'ok' },
    { name: 'old', success: false, message: 'not found' },
  ];
  const out = formatBatchResult(results);
  expect(out).toMatch('✓');
  expect(out).toMatch('✗');
  expect(out).toMatch('work');
  expect(out).toMatch('not found');
});

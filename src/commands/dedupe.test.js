const { dedupe } = require('./dedupe');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://google.com', title: 'Google' },
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://google.com', title: 'Google' },
  ]
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(mockSession);
  saveSession.mockResolvedValue();
});

test('removes duplicate urls', async () => {
  const result = await dedupe('work');
  expect(result.removed).toBe(2);
  expect(result.deduped).toBe(3);
  expect(result.changed).toBe(true);
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({
    tabs: expect.arrayContaining([{ url: 'https://github.com', title: 'GitHub' }])
  }));
});

test('dry run does not save', async () => {
  const result = await dedupe('work', { dryRun: true });
  expect(result.removed).toBe(2);
  expect(saveSession).not.toHaveBeenCalled();
});

test('no duplicates returns changed false', async () => {
  loadSession.mockResolvedValue({ name: 'clean', tabs: [
    { url: 'https://a.com', title: 'A' },
    { url: 'https://b.com', title: 'B' },
  ]});
  const result = await dedupe('clean');
  expect(result.changed).toBe(false);
  expect(saveSession).not.toHaveBeenCalled();
});

test('throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(dedupe('missing')).rejects.toThrow('Session "missing" not found');
});

test('dedupes by title when titleOnly option set', async () => {
  const result = await dedupe('work', { titleOnly: true });
  expect(result.removed).toBe(2);
});

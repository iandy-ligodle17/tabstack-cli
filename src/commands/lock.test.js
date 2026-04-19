const { lockSession, unlockSession, isLocked } = require('./lock');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = () => ({ name: 'work', tabs: ['https://example.com'], locked: false });

beforeEach(() => jest.clearAllMocks());

test('lockSession sets locked flag and passwordHash', async () => {
  loadSession.mockResolvedValue(mockSession());
  saveSession.mockResolvedValue();

  const result = await lockSession('work', 'secret');
  expect(result.locked).toBe(true);
  expect(result.passwordHash).toBeDefined();
  expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ locked: true }));
});

test('unlockSession removes lock when password matches', async () => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update('secret').digest('hex');
  loadSession.mockResolvedValue({ name: 'work', tabs: [], locked: true, passwordHash: hash });
  saveSession.mockResolvedValue();

  const result = await unlockSession('work', 'secret');
  expect(result.locked).toBe(false);
  expect(result.passwordHash).toBeUndefined();
});

test('unlockSession throws on wrong password', async () => {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update('secret').digest('hex');
  loadSession.mockResolvedValue({ name: 'work', tabs: [], locked: true, passwordHash: hash });

  await expect(unlockSession('work', 'wrong')).rejects.toThrow('Incorrect password');
});

test('unlockSession throws if session not locked', async () => {
  loadSession.mockResolvedValue(mockSession());
  await expect(unlockSession('work', 'secret')).rejects.toThrow('not locked');
});

test('isLocked returns true for locked session', async () => {
  loadSession.mockResolvedValue({ ...mockSession(), locked: true, passwordHash: 'abc' });
  expect(await isLocked('work')).toBe(true);
});

test('isLocked returns false for unlocked session', async () => {
  loadSession.mockResolvedValue(mockSession());
  expect(await isLocked('work')).toBe(false);
});

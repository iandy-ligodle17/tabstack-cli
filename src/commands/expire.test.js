const { setExpiry, clearExpiry, isExpired, formatExpiry, expireCommand } = require('./expire');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(overrides = {}) {
  return { name: 'test', tabs: ['https://example.com'], ...overrides };
}

describe('setExpiry', () => {
  it('sets expiry on session', () => {
    const session = makeSession();
    const result = setExpiry(session, 7);
    expect(result.expiry).toBeDefined();
    expect(result.expiry.ttlDays).toBe(7);
    const exp = new Date(result.expiry.expiresAt);
    expect(exp > new Date()).toBe(true);
  });

  it('throws for invalid days', () => {
    expect(() => setExpiry(makeSession(), -1)).toThrow();
    expect(() => setExpiry(makeSession(), 'abc')).toThrow();
  });
});

describe('clearExpiry', () => {
  it('removes expiry from session', () => {
    const session = makeSession({ expiry: { expiresAt: new Date().toISOString(), ttlDays: 7 } });
    const result = clearExpiry(session);
    expect(result.expiry).toBeUndefined();
  });

  it('is safe on session without expiry', () => {
    const session = makeSession();
    const result = clearExpiry(session);
    expect(result.expiry).toBeUndefined();
  });
});

describe('isExpired', () => {
  it('returns true for past expiry', () => {
    const past = new Date(Date.now() - 86400000).toISOString();
    const session = makeSession({ expiry: { expiresAt: past } });
    expect(isExpired(session)).toBe(true);
  });

  it('returns false for future expiry', () => {
    const future = new Date(Date.now() + 86400000).toISOString();
    const session = makeSession({ expiry: { expiresAt: future } });
    expect(isExpired(session)).toBe(false);
  });

  it('returns false if no expiry', () => {
    expect(isExpired(makeSession())).toBe(false);
  });
});

describe('formatExpiry', () => {
  it('returns message when no expiry', () => {
    expect(formatExpiry(makeSession())).toBe('No expiry set');
  });

  it('shows days left for future expiry', () => {
    const future = new Date(Date.now() + 5 * 86400000).toISOString();
    const session = makeSession({ expiry: { expiresAt: future } });
    expect(formatExpiry(session)).toMatch(/Expires in/);
  });

  it('shows expired message for past expiry', () => {
    const past = new Date(Date.now() - 3 * 86400000).toISOString();
    const session = makeSession({ expiry: { expiresAt: past } });
    expect(formatExpiry(session)).toMatch(/Expired/);
  });
});

describe('expireCommand', () => {
  beforeEach(() => jest.clearAllMocks());

  it('sets expiry and returns message', async () => {
    loadSession.mockResolvedValue(makeSession());
    saveSession.mockResolvedValue();
    const msg = await expireCommand('test', 14);
    expect(msg).toMatch(/expire in 14 day/);
    expect(saveSession).toHaveBeenCalled();
  });

  it('clears expiry with --clear flag', async () => {
    loadSession.mockResolvedValue(makeSession({ expiry: { expiresAt: new Date().toISOString() } }));
    saveSession.mockResolvedValue();
    const msg = await expireCommand('test', undefined, { clear: true });
    expect(msg).toMatch(/cleared/);
    const saved = saveSession.mock.calls[0][1];
    expect(saved.expiry).toBeUndefined();
  });
});

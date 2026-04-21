const { checkQuota, formatQuota } = require('./quota');

jest.mock('../storage', () => {
  const sessions = {
    work: { name: 'work', tabs: Array.from({ length: 5 }, (_, i) => ({ url: `https://site${i}.com` })) },
    personal: { name: 'personal', tabs: [{ url: 'https://news.com' }] },
  };
  return {
    listSessions: jest.fn(async () => Object.keys(sessions)),
    loadSession: jest.fn(async name => {
      if (!sessions[name]) throw new Error(`Session "${name}" not found`);
      return sessions[name];
    }),
  };
});

describe('quota integration', () => {
  it('shows correct session count', async () => {
    const result = await checkQuota();
    expect(result.sessionCount).toBe(2);
    expect(result.sessionsOk).toBe(true);
  });

  it('shows correct tab count for work session', async () => {
    const result = await checkQuota('work');
    expect(result.tabs.tabCount).toBe(5);
    expect(result.tabs.tabsOk).toBe(true);
  });

  it('formats output with both session and tab info', async () => {
    const result = await checkQuota('personal');
    const output = formatQuota(result);
    expect(output).toContain('Sessions:');
    expect(output).toContain('personal');
    expect(output).toContain('1/');
  });

  it('exits with limit exceeded when env cap is low', async () => {
    process.env.TABSTACK_MAX_SESSIONS = '1';
    const result = await checkQuota();
    expect(result.sessionsOk).toBe(false);
    delete process.env.TABSTACK_MAX_SESSIONS;
  });

  it('throws on unknown session name', async () => {
    await expect(checkQuota('ghost')).rejects.toThrow('not found');
  });
});

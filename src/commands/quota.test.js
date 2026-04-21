const { checkQuota, formatQuota, getQuotaConfig, buildBar } = require('./quota');

jest.mock('../storage', () => ({
  listSessions: jest.fn(),
  loadSession: jest.fn(),
}));

const { listSessions, loadSession } = require('../storage');

describe('getQuotaConfig', () => {
  it('returns defaults when env vars not set', () => {
    delete process.env.TABSTACK_MAX_SESSIONS;
    delete process.env.TABSTACK_MAX_TABS;
    const config = getQuotaConfig();
    expect(config.maxSessions).toBe(50);
    expect(config.maxTabsPerSession).toBe(200);
  });

  it('reads from env vars', () => {
    process.env.TABSTACK_MAX_SESSIONS = '10';
    process.env.TABSTACK_MAX_TABS = '100';
    const config = getQuotaConfig();
    expect(config.maxSessions).toBe(10);
    expect(config.maxTabsPerSession).toBe(100);
    delete process.env.TABSTACK_MAX_SESSIONS;
    delete process.env.TABSTACK_MAX_TABS;
  });
});

describe('checkQuota', () => {
  beforeEach(() => {
    listSessions.mockResolvedValue(['a', 'b', 'c']);
    loadSession.mockResolvedValue({ tabs: [{ url: 'https://a.com' }, { url: 'https://b.com' }] });
  });

  it('returns session count and limit', async () => {
    const result = await checkQuota();
    expect(result.sessionCount).toBe(3);
    expect(result.sessionsOk).toBe(true);
    expect(result.tabs).toBeNull();
  });

  it('includes tab info when session name provided', async () => {
    const result = await checkQuota('mysession');
    expect(result.tabs.tabCount).toBe(2);
    expect(result.tabs.sessionName).toBe('mysession');
    expect(result.tabs.tabsOk).toBe(true);
  });

  it('flags sessionsOk false when at limit', async () => {
    listSessions.mockResolvedValue(Array.from({ length: 50 }, (_, i) => `s${i}`));
    const result = await checkQuota();
    expect(result.sessionsOk).toBe(false);
  });
});

describe('buildBar', () => {
  it('builds empty bar', () => expect(buildBar(0, 10)).toBe('[' + '░'.repeat(20) + ']'));
  it('builds full bar', () => expect(buildBar(10, 10)).toBe('[' + '█'.repeat(20) + ']'));
  it('builds partial bar', () => {
    const bar = buildBar(5, 10);
    expect(bar).toContain('█');
    expect(bar).toContain('░');
  });
});

describe('formatQuota', () => {
  it('formats without tabs section', () => {
    const result = { sessionCount: 3, maxSessions: 50, sessionsOk: true, tabs: null };
    const output = formatQuota(result);
    expect(output).toContain('3/50');
    expect(output).toContain('✓');
  });

  it('includes tab info in output', () => {
    const result = {
      sessionCount: 3, maxSessions: 50, sessionsOk: true,
      tabs: { sessionName: 'work', tabCount: 5, maxTabs: 200, tabsOk: true },
    };
    const output = formatQuota(result);
    expect(output).toContain('work');
    expect(output).toContain('5/200');
  });
});

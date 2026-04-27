const { stripUrls, formatStripResult, stripSession } = require('./strip');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

function makeSession(tabs) {
  return { name: 'test', createdAt: '2024-01-01', tabs };
}

describe('stripUrls', () => {
  it('removes query strings by default', () => {
    const tabs = [{ url: 'https://example.com/page?foo=bar', title: 'Page' }];
    const result = stripUrls(makeSession(tabs));
    expect(result[0].url).toBe('https://example.com/page');
  });

  it('removes fragments by default', () => {
    const tabs = [{ url: 'https://example.com/page#section', title: 'Page' }];
    const result = stripUrls(makeSession(tabs));
    expect(result[0].url).toBe('https://example.com/page');
  });

  it('removes both query and fragment', () => {
    const tabs = [{ url: 'https://example.com/page?x=1#top', title: 'Page' }];
    const result = stripUrls(makeSession(tabs));
    expect(result[0].url).toBe('https://example.com/page');
  });

  it('preserves url when query=false and fragment=false', () => {
    const tabs = [{ url: 'https://example.com/?q=hi#anchor', title: 'Page' }];
    const result = stripUrls(makeSession(tabs), { query: false, fragment: false });
    expect(result[0].url).toBe('https://example.com/?q=hi#anchor');
  });

  it('handles invalid URLs gracefully', () => {
    const tabs = [{ url: 'not-a-url', title: 'Bad' }];
    const result = stripUrls(makeSession(tabs));
    expect(result[0].url).toBe('not-a-url');
  });

  it('preserves title and other fields', () => {
    const tabs = [{ url: 'https://example.com/?x=1', title: 'Example', pinned: true }];
    const result = stripUrls(makeSession(tabs));
    expect(result[0].title).toBe('Example');
    expect(result[0].pinned).toBe(true);
  });
});

describe('formatStripResult', () => {
  it('reports changed count', () => {
    const original = [{ url: 'https://a.com/?q=1' }, { url: 'https://b.com' }];
    const stripped = [{ url: 'https://a.com/' }, { url: 'https://b.com' }];
    expect(formatStripResult(original, stripped)).toContain('1 of 2');
  });
});

describe('stripSession', () => {
  it('saves stripped session', async () => {
    const session = makeSession([{ url: 'https://x.com/?ref=home', title: 'X' }]);
    loadSession.mockResolvedValue(session);
    saveSession.mockResolvedValue();
    const result = await stripSession('test');
    expect(result.changed).toBe(1);
    expect(saveSession).toHaveBeenCalled();
  });

  it('skips save on dryRun', async () => {
    const session = makeSession([{ url: 'https://x.com/?ref=home', title: 'X' }]);
    loadSession.mockResolvedValue(session);
    const result = await stripSession('test', { dryRun: true });
    expect(result.changed).toBe(1);
    expect(saveSession).not.toHaveBeenCalled();
  });
});

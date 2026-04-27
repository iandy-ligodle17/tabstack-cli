const { maskUrl, maskSession, formatMaskResult, mask } = require('./mask');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

function makeSession(tabs) {
  return { name: 'test', createdAt: '2024-01-01T00:00:00.000Z', tabs };
}

describe('maskUrl', () => {
  test('masks token param', () => {
    const { url, masked } = maskUrl('https://example.com/api?token=abc123&foo=bar');
    expect(masked).toBe(true);
    expect(url).toContain('token=***');
    expect(url).toContain('foo=bar');
  });

  test('masks api_key param', () => {
    const { url, masked } = maskUrl('https://example.com?api_key=secret');
    expect(masked).toBe(true);
    expect(url).toContain('api_key=***');
  });

  test('does not mask normal params', () => {
    const { url, masked } = maskUrl('https://example.com?q=hello&page=2');
    expect(masked).toBe(false);
    expect(url).toBe('https://example.com/?q=hello&page=2');
  });

  test('handles invalid url gracefully', () => {
    const { url, masked } = maskUrl('not-a-url');
    expect(masked).toBe(false);
    expect(url).toBe('not-a-url');
  });

  test('masks password in url', () => {
    const { url, masked } = maskUrl('https://user:hunter2@example.com');
    expect(masked).toBe(true);
    expect(url).not.toContain('hunter2');
  });
});

describe('maskSession', () => {
  test('masks sensitive tabs and counts them', () => {
    const session = makeSession([
      { url: 'https://api.example.com?token=xyz', title: 'API' },
      { url: 'https://example.com', title: 'Home' },
    ]);
    const { session: masked, maskedCount } = maskSession(session);
    expect(maskedCount).toBe(1);
    expect(masked.tabs[0].url).toContain('token=***');
    expect(masked.tabs[1].url).toBe('https://example.com');
  });

  test('returns zero count when nothing to mask', () => {
    const session = makeSession([{ url: 'https://example.com', title: 'Home' }]);
    const { maskedCount } = maskSession(session);
    expect(maskedCount).toBe(0);
  });
});

describe('formatMaskResult', () => {
  test('reports masked count', () => {
    expect(formatMaskResult('work', 3)).toBe('Masked 3 sensitive URL parameter(s) in session "work".');
  });

  test('reports nothing found', () => {
    expect(formatMaskResult('work', 0)).toBe('No sensitive parameters found in session "work".');
  });
});

describe('mask', () => {
  test('saves session when save=true and changes exist', async () => {
    loadSession.mockResolvedValue(makeSession([{ url: 'https://x.com?token=abc', title: 'X' }]));
    await mask('work', { save: true });
    expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ tabs: expect.any(Array) }));
  });

  test('does not save when save=false', async () => {
    loadSession.mockResolvedValue(makeSession([{ url: 'https://x.com?token=abc', title: 'X' }]));
    saveSession.mockClear();
    await mask('work', { save: false });
    expect(saveSession).not.toHaveBeenCalled();
  });
});

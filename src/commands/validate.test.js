const { validateSession } = require('./validate');

describe('validateSession', () => {
  const validSession = {
    tabs: [
      { url: 'https://example.com', title: 'Example' },
      { url: 'https://github.com', title: 'GitHub' },
    ],
    createdAt: '2024-01-01T00:00:00.000Z',
  };

  test('returns valid for a well-formed session', () => {
    const result = validateSession(validSession);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  test('returns error if session is null', () => {
    const result = validateSession(null);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Session data is invalid or corrupted');
  });

  test('returns error if tabs is not an array', () => {
    const result = validateSession({ createdAt: '2024-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Session is missing tabs array');
  });

  test('returns warning for empty tabs array', () => {
    const result = validateSession({ tabs: [], createdAt: '2024-01-01' });
    expect(result.valid).toBe(true);
    expect(result.warnings).toContain('Session has no tabs');
  });

  test('returns error for tab with missing URL', () => {
    const result = validateSession({ tabs: [{ title: 'No URL' }], createdAt: '2024-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Tab 1 is missing a URL');
  });

  test('returns error for tab with invalid URL', () => {
    const result = validateSession({ tabs: [{ url: 'not-a-url', title: 'Bad' }], createdAt: '2024-01-01' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/invalid URL/);
  });

  test('returns warning for tab missing title', () => {
    const result = validateSession({ tabs: [{ url: 'https://example.com' }], createdAt: '2024-01-01' });
    expect(result.warnings).toContain('Tab 1 is missing a title');
  });

  test('returns warning when createdAt is missing', () => {
    const result = validateSession({ tabs: [] });
    expect(result.warnings).toContain('Session is missing createdAt timestamp');
;

const { compareSessions, formatComparison } = require('./compare');

const session1 = {
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://shared.com', title: 'Shared' }
  ]
};

const session2 = {
  tabs: [
    { url: 'https://shared.com', title: 'Shared' },
    { url: 'https://google.com', title: 'Google' }
  ]
};

describe('compareSessions', () => {
  test('finds tabs only in first session', () => {
    const result = compareSessions(session1, session2);
    expect(result.onlyInFirst).toHaveLength(2);
    expect(result.onlyInFirst.map(t => t.url)).toContain('https://example.com');
    expect(result.onlyInFirst.map(t => t.url)).toContain('https://github.com');
  });

  test('finds tabs only in second session', () => {
    const result = compareSessions(session1, session2);
    expect(result.onlyInSecond).toHaveLength(1);
    expect(result.onlyInSecond[0].url).toBe('https://google.com');
  });

  test('finds shared tabs', () => {
    const result = compareSessions(session1, session2);
    expect(result.inBoth).toHaveLength(1);
    expect(result.inBoth[0].url).toBe('https://shared.com');
  });

  test('identical sessions have no differences', () => {
    const result = compareSessions(session1, session1);
    expect(result.onlyInFirst).toHaveLength(0);
    expect(result.onlyInSecond).toHaveLength(0);
    expect(result.inBoth).toHaveLength(3);
  });
});

describe('formatComparison', () => {
  test('includes session names in output', () => {
    const result = compareSessions(session1, session2);
    const output = formatComparison('work', 'home', result);
    expect(output).toContain('work');
    expect(output).toContain('home');
  });

  test('shows identical message when no differences', () => {
    const result = compareSessions(session1, session1);
    const output = formatComparison('a', 'b', result);
    expect(output).toContain('identical');
  });

  test('shows shared count', () => {
    const result = compareSessions(session1, session2);
    const output = formatComparison('s1', 's2', result);
    expect(output).toContain('Shared tabs: 1');
  });
});

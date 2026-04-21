const { rotateTabs, formatRotateResult } = require('./rotate');

function makeSession(urls) {
  return {
    name: 'test',
    tabs: urls.map((url, i) => ({ url, title: `Tab ${i}` })),
  };
}

describe('rotateTabs', () => {
  test('rotates right by 1', () => {
    const session = makeSession(['a', 'b', 'c', 'd']);
    const result = rotateTabs(session, 1);
    expect(result.tabs.map(t => t.url)).toEqual(['d', 'a', 'b', 'c']);
  });

  test('rotates left by 1 (negative steps)', () => {
    const session = makeSession(['a', 'b', 'c', 'd']);
    const result = rotateTabs(session, -1);
    expect(result.tabs.map(t => t.url)).toEqual(['b', 'c', 'd', 'a']);
  });

  test('rotates by 0 returns same order', () => {
    const session = makeSession(['a', 'b', 'c']);
    const result = rotateTabs(session, 0);
    expect(result.tabs.map(t => t.url)).toEqual(['a', 'b', 'c']);
  });

  test('rotating by full length returns same order', () => {
    const session = makeSession(['a', 'b', 'c']);
    const result = rotateTabs(session, 3);
    expect(result.tabs.map(t => t.url)).toEqual(['a', 'b', 'c']);
  });

  test('handles steps larger than tab count', () => {
    const session = makeSession(['a', 'b', 'c']);
    const result = rotateTabs(session, 5);
    expect(result.tabs.map(t => t.url)).toEqual(['b', 'c', 'a']);
  });

  test('does not mutate original session', () => {
    const session = makeSession(['a', 'b', 'c']);
    const original = [...session.tabs];
    rotateTabs(session, 2);
    expect(session.tabs).toEqual(original);
  });

  test('throws on empty tabs', () => {
    expect(() => rotateTabs({ tabs: [] }, 1)).toThrow('no tabs to rotate');
  });

  test('throws when tabs is missing', () => {
    expect(() => rotateTabs({}, 1)).toThrow('no tabs to rotate');
  });
});

describe('formatRotateResult', () => {
  test('formats right rotation message', () => {
    const msg = formatRotateResult({ stepsApplied: 2, tabCount: 5 });
    expect(msg).toContain('right');
    expect(msg).toContain('2');
    expect(msg).toContain('5');
  });

  test('formats left rotation message for negative steps', () => {
    const msg = formatRotateResult({ stepsApplied: -3, tabCount: 4 });
    expect(msg).toContain('left');
    expect(msg).toContain('3');
  });
});

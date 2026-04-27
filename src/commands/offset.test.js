const { offsetTabs, applyOffset, formatOffsetResult } = require('./offset');

function makeSession(urls) {
  return urls.map((url, i) => ({ url, title: `Tab ${i}` }));
}

describe('offsetTabs', () => {
  test('shifts tabs forward', () => {
    const tabs = makeSession(['a.com', 'b.com', 'c.com']);
    const result = offsetTabs(tabs, 1);
    expect(result[0]._newIndex).toBe(1);
    expect(result[1]._newIndex).toBe(2);
    expect(result[2]._newIndex).toBe(2); // clamped
  });

  test('shifts tabs backward', () => {
    const tabs = makeSession(['a.com', 'b.com', 'c.com']);
    const result = offsetTabs(tabs, -1);
    expect(result[0]._newIndex).toBe(0); // clamped
    expect(result[1]._newIndex).toBe(0);
    expect(result[2]._newIndex).toBe(1);
  });

  test('wraps tabs when wrap=true', () => {
    const tabs = makeSession(['a.com', 'b.com', 'c.com']);
    const result = offsetTabs(tabs, 1, { wrap: true });
    expect(result[0]._newIndex).toBe(1);
    expect(result[1]._newIndex).toBe(2);
    expect(result[2]._newIndex).toBe(0); // wrapped
  });

  test('returns empty array for empty input', () => {
    expect(offsetTabs([], 2)).toEqual([]);
  });

  test('zero offset returns same positions', () => {
    const tabs = makeSession(['a.com', 'b.com']);
    const result = offsetTabs(tabs, 0);
    expect(result[0]._newIndex).toBe(0);
    expect(result[1]._newIndex).toBe(1);
  });
});

describe('applyOffset', () => {
  test('produces array of same length', () => {
    const tabs = makeSession(['a.com', 'b.com', 'c.com']);
    const result = applyOffset(tabs, 1);
    expect(result).toHaveLength(3);
  });

  test('no _originalIndex or _newIndex in output', () => {
    const tabs = makeSession(['a.com', 'b.com']);
    const result = applyOffset(tabs, 1);
    result.forEach(tab => {
      expect(tab._originalIndex).toBeUndefined();
      expect(tab._newIndex).toBeUndefined();
    });
  });
});

describe('formatOffsetResult', () => {
  test('includes offset in header', () => {
    const tabs = makeSession(['a.com']);
    const out = formatOffsetResult(tabs, tabs, 3);
    expect(out).toContain('+3');
  });

  test('includes negative offset', () => {
    const tabs = makeSession(['a.com']);
    const out = formatOffsetResult(tabs, tabs, -2);
    expect(out).toContain('-2');
  });

  test('shows total count', () => {
    const tabs = makeSession(['a.com', 'b.com']);
    const out = formatOffsetResult(tabs, tabs, 1);
    expect(out).toContain('2 tab(s)');
  });
});

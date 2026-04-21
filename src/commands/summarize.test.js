const { summarizeSession, formatSummary, getTopDomains } = require('./summarize');

function makeSession(overrides = {}) {
  return {
    name: 'test-session',
    tabs: [
      { url: 'https://github.com/foo', title: 'Foo', pinned: false },
      { url: 'https://github.com/bar', title: 'Bar', pinned: true },
      { url: 'https://npmjs.com/pkg', title: 'Pkg', pinned: false },
      { url: 'not-a-url', title: 'Bad', pinned: false },
    ],
    tags: ['work', 'dev'],
    notes: 'some notes here',
    createdAt: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('summarizeSession', () => {
  it('counts tabs correctly', () => {
    const s = summarizeSession(makeSession());
    expect(s.tabCount).toBe(4);
  });

  it('counts unique domains', () => {
    const s = summarizeSession(makeSession());
    // github.com, npmjs.com, unknown
    expect(s.uniqueDomains).toBe(3);
  });

  it('detects pinned tabs', () => {
    const s = summarizeSession(makeSession());
    expect(s.hasPinnedTabs).toBe(true);
  });

  it('reports no pinned tabs when none', () => {
    const session = makeSession();
    session.tabs = session.tabs.map(t => ({ ...t, pinned: false }));
    expect(summarizeSession(session).hasPinnedTabs).toBe(false);
  });

  it('detects notes presence', () => {
    expect(summarizeSession(makeSession()).hasNotes).toBe(true);
    expect(summarizeSession(makeSession({ notes: '' })).hasNotes).toBe(false);
    expect(summarizeSession(makeSession({ notes: '   ' })).hasNotes).toBe(false);
  });

  it('includes tags', () => {
    expect(summarizeSession(makeSession()).tags).toEqual(['work', 'dev']);
  });

  it('handles session with no tabs', () => {
    const s = summarizeSession(makeSession({ tabs: [] }));
    expect(s.tabCount).toBe(0);
    expect(s.uniqueDomains).toBe(0);
    expect(s.topDomains).toEqual([]);
  });
});

describe('getTopDomains', () => {
  it('returns top N domains by frequency', () => {
    const tabs = [
      { url: 'https://github.com/a' },
      { url: 'https://github.com/b' },
      { url: 'https://npmjs.com/x' },
    ];
    const top = getTopDomains(tabs, 1);
    expect(top).toEqual([{ domain: 'github.com', count: 2 }]);
  });
});

describe('formatSummary', () => {
  it('includes session name and tab count', () => {
    const summary = summarizeSession(makeSession());
    const output = formatSummary(summary);
    expect(output).toContain('test-session');
    expect(output).toContain('4');
  });

  it('shows tags', () => {
    const output = formatSummary(summarizeSession(makeSession()));
    expect(output).toContain('work');
  });
});

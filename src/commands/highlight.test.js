const { highlightTab, getHighlightedTabs, formatHighlighted, toggleHighlight, listHighlighted, clearHighlights } = require('./highlight');

jest.mock('../storage');
const { loadSession, saveSession } = require('../storage');

const mockSession = () => ({
  tabs: [
    { url: 'https://example.com', title: 'Example' },
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://news.ycombinator.com', title: 'HN' }
  ]
});

describe('highlightTab', () => {
  it('highlights a tab', () => {
    const session = mockSession();
    const result = highlightTab(session, 0);
    expect(result).toBe(true);
    expect(session.tabs[0].highlighted).toBe(true);
  });

  it('toggles highlight off', () => {
    const session = mockSession();
    session.tabs[1].highlighted = true;
    const result = highlightTab(session, 1);
    expect(result).toBe(false);
    expect(session.tabs[1].highlighted).toBe(false);
  });

  it('throws on invalid index', () => {
    const session = mockSession();
    expect(() => highlightTab(session, 10)).toThrow('out of range');
  });
});

describe('getHighlightedTabs', () => {
  it('returns only highlighted tabs', () => {
    const session = mockSession();
    session.tabs[0].highlighted = true;
    session.tabs[2].highlighted = true;
    expect(getHighlightedTabs(session)).toHaveLength(2);
  });
});

describe('formatHighlighted', () => {
  it('returns message when none', () => {
    expect(formatHighlighted([])).toBe('No highlighted tabs.');
  });

  it('formats tabs with star', () => {
    const tabs = [{ title: 'Example', url: 'https://example.com' }];
    expect(formatHighlighted(tabs)).toContain('★');
    expect(formatHighlighted(tabs)).toContain('Example');
  });
});

describe('toggleHighlight', () => {
  it('saves and returns status message', async () => {
    loadSession.mockResolvedValue(mockSession());
    saveSession.mockResolvedValue();
    const msg = await toggleHighlight('work', 0);
    expect(msg).toContain('highlighted');
    expect(saveSession).toHaveBeenCalled();
  });
});

describe('clearHighlights', () => {
  it('clears all highlights', async () => {
    const session = mockSession();
    session.tabs[0].highlighted = true;
    session.tabs[1].highlighted = true;
    loadSession.mockResolvedValue(session);
    saveSession.mockResolvedValue();
    const msg = await clearHighlights('work');
    expect(msg).toContain('2');
  });
});

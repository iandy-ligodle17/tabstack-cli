const { getHistory, formatHistory } = require('./history');

const mockSessions = [
  { name: 'work', tabs: [{url:'https://a.com'}], savedAt: '2024-01-10T10:00:00Z', tags: ['work'] },
  { name: 'research', tabs: [{url:'https://b.com'},{url:'https://c.com'}], savedAt: '2024-01-12T09:00:00Z', tags: [] },
  { name: 'personal', tabs: [], savedAt: '2024-01-08T08:00:00Z', tags: ['home'] },
  { name: 'nosave', tabs: [], savedAt: null },
];

describe('getHistory', () => {
  it('sorts sessions by savedAt descending', () => {
    const result = getHistory(mockSessions);
    expect(result[0].name).toBe('research');
    expect(result[1].name).toBe('work');
  });

  it('filters out sessions with no savedAt', () => {
    const result = getHistory(mockSessions);
    expect(result.find(s => s.name === 'nosave')).toBeUndefined();
  });

  it('respects limit', () => {
    const result = getHistory(mockSessions, 2);
    expect(result.length).toBe(2);
  });

  it('returns empty array if no sessions', () => {
    expect(getHistory([])).toEqual([]);
  });
});

describe('formatHistory', () => {
  it('returns message when empty', () => {
    expect(formatHistory([])).toBe('No session history found.');
  });

  it('includes session name and tab count', () => {
    const result = formatHistory([mockSessions[0]]);
    expect(result).toContain('work');
    expect(result).toContain('1 tab');
  });

  it('shows tags when present', () => {
    const result = formatHistory([mockSessions[0]]);
    expect(result).toContain('[work]');
  });

  it('uses plural tabs', () => {
    const result = formatHistory([mockSessions[1]]);
    expect(result).toContain('2 tabs');
  });
});

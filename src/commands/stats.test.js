const { stats } = require('./stats');
const storage = require('../storage');

jest.mock('../storage');

describe('stats', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns zeros when no sessions exist', async () => {
    storage.listSessions.mockResolvedValue([]);
    const result = await stats();
    expect(result.totalSessions).toBe(0);
    expect(result.totalTabs).toBe(0);
    expect(result.avgTabs).toBe(0);
    expect(result.largest).toBeNull();
  });

  it('calculates totals and averages correctly', async () => {
    storage.listSessions.mockResolvedValue(['a', 'b']);
    storage.loadSession
      .mockResolvedValueOnce({ tabs: ['t1', 't2', 't3'], tags: ['work'] })
      .mockResolvedValueOnce({ tabs: ['t1'], tags: ['work', 'personal'] });

    const result = await stats();
    expect(result.totalSessions).toBe(2);
    expect(result.totalTabs).toBe(4);
    expect(result.avgTabs).toBe(2);
  });

  it('identifies largest and smallest sessions', async () => {
    storage.listSessions.mockResolvedValue(['big', 'small']);
    storage.loadSession
      .mockResolvedValueOnce({ tabs: ['a', 'b', 'c'], tags: [] })
      .mockResolvedValueOnce({ tabs: ['a'], tags: [] });

    const result = await stats();
    expect(result.largest.name).toBe('big');
    expect(result.largest.count).toBe(3);
    expect(result.smallest.name).toBe('small');
    expect(result.smallest.count).toBe(1);
  });

  it('counts tags across sessions', async () => {
    storage.listSessions.mockResolvedValue(['s1', 's2']);
    storage.loadSession
      .mockResolvedValueOnce({ tabs: [], tags: ['work', 'dev'] })
      .mockResolvedValueOnce({ tabs: [], tags: ['work'] });

    const result = await stats();
    expect(result.tags['work']).toBe(2);
    expect(result.tags['dev']).toBe(1);
  });

  it('includes session list in verbose mode', async () => {
    storage.listSessions.mockResolvedValue(['s1']);
    storage.loadSession.mockResolvedValue({ tabs: [], tags: [] });

    const result = await stats({ verbose: true });
    expect(result.sessions).toEqual(['s1']);
  });
});

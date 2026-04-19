const { scheduleSession, clearSchedule, getSchedule, parseSchedule } = require('./schedule');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = { tabs: ['https://example.com'], createdAt: '2024-01-01T00:00:00.000Z' };

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockReturnValue({ ...mockSession });
});

describe('parseSchedule', () => {
  it('parses valid schedule string', () => {
    expect(parseSchedule('09:00 daily')).toEqual({ hour: 9, minute: 0, frequency: 'daily' });
  });

  it('throws on invalid format', () => {
    expect(() => parseSchedule('daily')).toThrow('Schedule format');
  });

  it('throws on invalid time', () => {
    expect(() => parseSchedule('abc:00 daily')).toThrow('Invalid time format');
  });

  it('throws on invalid frequency', () => {
    expect(() => parseSchedule('09:00 monthly')).toThrow('Frequency must be one of');
  });
});

describe('scheduleSession', () => {
  it('adds schedule to session', () => {
    const result = scheduleSession('work', '08:30 weekdays');
    expect(result.schedule).toEqual({ hour: 8, minute: 30, frequency: 'weekdays' });
    expect(saveSession).toHaveBeenCalledWith('work', expect.objectContaining({ schedule: expect.any(Object) }));
  });

  it('throws if session not found', () => {
    loadSession.mockReturnValue(null);
    expect(() => scheduleSession('ghost', '08:00 daily')).toThrow('not found');
  });
});

describe('clearSchedule', () => {
  it('removes schedule from session', () => {
    loadSession.mockReturnValue({ ...mockSession, schedule: { hour: 9, minute: 0, frequency: 'daily' } });
    clearSchedule('work');
    expect(saveSession).toHaveBeenCalledWith('work', expect.not.objectContaining({ schedule: expect.anything() }));
  });

  it('throws if no schedule exists', () => {
    expect(() => clearSchedule('work')).toThrow('has no schedule');
  });
});

describe('getSchedule', () => {
  it('returns null when no schedule', () => {
    expect(getSchedule('work')).toBeNull();
  });

  it('returns schedule when set', () => {
    const sched = { hour: 10, minute: 0, frequency: 'daily' };
    loadSession.mockReturnValue({ ...mockSession, schedule: sched });
    expect(getSchedule('work')).toEqual(sched);
  });
});

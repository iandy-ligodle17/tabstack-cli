const { deleteCommand } = require('./delete');
const storage = require('../storage');

jest.mock('../storage');

describe('deleteCommand', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
    console.error.mockRestore();
  });

  it('deletes an existing session', async () => {
    storage.listSessions.mockResolvedValue(['work', 'personal']);
    storage.deleteSession.mockResolvedValue();

    const result = await deleteCommand('work');

    expect(storage.deleteSession).toHaveBeenCalledWith('work');
    expect(result).toEqual({ deleted: true, sessionName: 'work' });
    expect(console.log).toHaveBeenCalledWith('Session "work" deleted.');
  });

  it('returns not_found when session does not exist', async () => {
    storage.listSessions.mockResolvedValue(['personal']);

    const result = await deleteCommand('work');

    expect(storage.deleteSession).not.toHaveBeenCalled();
    expect(result).toEqual({ deleted: false, reason: 'not_found' });
    expect(console.error).toHaveBeenCalledWith('Error: session "work" not found.');
  });

  it('returns no_name when no session name provided', async () => {
    storage.listSessions.mockResolvedValue(['work']);

    const result = await deleteCommand();

    expect(result).toEqual({ deleted: false, reason: 'no_name' });
    expect(console.error).toHaveBeenCalledWith('Error: session name is required.');
  });

  it('returns no_sessions when no sessions exist and no name given', async () => {
    storage.listSessions.mockResolvedValue([]);

    const result = await deleteCommand();

    expect(result).toEqual({ deleted: false, reason: 'no_sessions' });
  });

  it('handles deleteSession throwing an error', async () => {
    storage.listSessions.mockResolvedValue(['work']);
    storage.deleteSession.mockRejectedValue(new Error('disk error'));

    const result = await deleteCommand('work');

    expect(result.deleted).toBe(false);
    expect(result.reason).toBe('error');
    expect(console.error).toHaveBeenCalledWith('Error deleting session: disk error');
  });
});

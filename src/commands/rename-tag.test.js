const { renameTag } = require('./rename-tag');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

describe('renameTag', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renames a tag in a session', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work', 'urgent'] });
    saveSession.mockResolvedValue();

    const result = await renameTag('mysession', 'urgent', 'important');

    expect(result.oldTag).toBe('urgent');
    expect(result.newTag).toBe('important');
    expect(result.tags).toContain('important');
    expect(result.tags).not.toContain('urgent');
    expect(saveSession).toHaveBeenCalledWith('mysession', expect.objectContaining({
      tags: ['work', 'important']
    }));
  });

  it('throws if old tag not found', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work'] });

    await expect(renameTag('mysession', 'missing', 'new'))
      .rejects.toThrow('Tag "missing" not found');
  });

  it('throws if new tag already exists', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: ['work', 'personal'] });

    await expect(renameTag('mysession', 'work', 'personal'))
      .rejects.toThrow('Tag "personal" already exists');
  });

  it('throws if session has no tags', async () => {
    loadSession.mockResolvedValue({ tabs: [], tags: [] });

    await expect(renameTag('mysession', 'work', 'new'))
      .rejects.toThrow('has no tags');
  });

  it('throws if arguments are missing', async () => {
    await expect(renameTag('mysession', '', 'new'))
      .rejects.toThrow('required');
  });
});

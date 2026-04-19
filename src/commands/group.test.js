const { groupTabs, listGroups, ungroup } = require('./group');
const { loadSession, saveSession } = require('../storage');

jest.mock('../storage');

const mockSession = {
  name: 'work',
  tabs: [
    { url: 'https://github.com', title: 'GitHub' },
    { url: 'https://jira.com', title: 'Jira' },
    { url: 'https://slack.com', title: 'Slack' },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  loadSession.mockResolvedValue(JSON.parse(JSON.stringify(mockSession)));
  saveSession.mockResolvedValue();
});

test('groupTabs assigns group to specified indices', async () => {
  const result = await groupTabs('work', 'dev', [0, 1]);
  expect(result.groupName).toBe('dev');
  expect(result.count).toBe(2);
  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs[0].group).toBe('dev');
  expect(saved.tabs[1].group).toBe('dev');
  expect(saved.tabs[2].group).toBeUndefined();
});

test('groupTabs throws on invalid index', async () => {
  await expect(groupTabs('work', 'dev', [5])).rejects.toThrow('Invalid tab indices');
});

test('groupTabs throws if session not found', async () => {
  loadSession.mockResolvedValue(null);
  await expect(groupTabs('missing', 'dev', [0])).rejects.toThrow("Session 'missing' not found");
});

test('listGroups returns tabs grouped by group name', async () => {
  loadSession.mockResolvedValue({
    name: 'work',
    tabs: [
      { url: 'https://github.com', group: 'dev' },
      { url: 'https://jira.com', group: 'dev' },
      { url: 'https://slack.com' },
    ],
  });
  const groups = await listGroups('work');
  expect(groups['dev']).toHaveLength(2);
  expect(groups['(ungrouped)']).toHaveLength(1);
});

test('ungroup removes group from tabs', async () => {
  loadSession.mockResolvedValue({
    name: 'work',
    tabs: [
      { url: 'https://github.com', group: 'dev' },
      { url: 'https://jira.com', group: 'dev' },
      { url: 'https://slack.com' },
    ],
  });
  await ungroup('work', 'dev');
  const saved = saveSession.mock.calls[0][1];
  expect(saved.tabs[0].group).toBeUndefined();
  expect(saved.tabs[1].group).toBeUndefined();
});

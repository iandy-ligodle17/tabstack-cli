const { snapshotSession, listSnapshots, restoreSnapshot } = require('./snapshot');
const { saveSession, loadSession } = require('../storage');
const { getTabs } = require('../browser');

jest.mock('../storage');
jest.mock('../browser');

const mockTabs = [
  { title: 'GitHub', url: 'https://github.com' },
  { title: 'MDN', url: 'https://developer.mozilla.org' }
];

beforeEach(() => {
  jest.clearAllMocks();
  getTabs.mockResolvedValue(mockTabs);
  saveSession.mockResolvedValue(true);
});

test('snapshotSession saves a single snapshot', async () => {
  const result = await snapshotSession('work', { count: 1 });
  expect(result).toEqual(['work_snap_1']);
  expect(saveSession).toHaveBeenCalledTimes(1);
  const [name, session] = saveSession.mock.calls[0];
  expect(name).toBe('work_snap_1');
  expect(session.meta.isSnapshot).toBe(true);
  expect(session.meta.parentName).toBe('work');
});

test('snapshotSession saves multiple snapshots', async () => {
  const result = await snapshotSession('daily', { count: 3, interval: 0 });
  expect(result).toHaveLength(3);
  expect(result).toEqual(['daily_snap_1', 'daily_snap_2', 'daily_snap_3']);
  expect(saveSession).toHaveBeenCalledTimes(3);
});

test('listSnapshots filters by parent name', async () => {
  const all = ['work_snap_1', 'work_snap_2', 'home_snap_1', 'personal'];
  const result = await listSnapshots('work', all);
  expect(result).toEqual(['work_snap_1', 'work_snap_2']);
});

test('restoreSnapshot returns valid snapshot session', async () => {
  loadSession.mockResolvedValue({
    name: 'work_snap_1',
    tabs: mockTabs,
    meta: { isSnapshot: true, parentName: 'work', index: 1, total: 1 }
  });
  const session = await restoreSnapshot('work_snap_1');
  expect(session.meta.isSnapshot).toBe(true);
});

test('restoreSnapshot throws for non-snapshot session', async () => {
  loadSession.mockResolvedValue({ name: 'regular', tabs: mockTabs, meta: {} });
  await expect(restoreSnapshot('regular')).rejects.toThrow('not a valid snapshot');
});

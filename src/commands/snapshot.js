const { saveSession, loadSession } = require('../storage');
const { getTabs } = require('../browser');

async function snapshotSession(name, options = {}) {
  const { interval = 30, count = 1 } = options;
  const snapshots = [];

  for (let i = 0; i < count; i++) {
    const tabs = await getTabs();
    const timestamp = new Date().toISOString();
    const snapshotName = `${name}_snap_${i + 1}`;

    const session = {
      name: snapshotName,
      createdAt: timestamp,
      tabs,
      meta: {
        isSnapshot: true,
        parentName: name,
        index: i + 1,
        total: count
      }
    };

    await saveSession(snapshotName, session);
    snapshots.push(snapshotName);

    if (i < count - 1) {
      await new Promise(res => setTimeout(res, interval * 1000));
    }
  }

  return snapshots;
}

async function listSnapshots(name, allSessions) {
  return allSessions.filter(s => s.startsWith(`${name}_snap_`));
}

async function restoreSnapshot(snapshotName) {
  const session = await loadSession(snapshotName);
  if (!session || !session.meta || !session.meta.isSnapshot) {
    throw new Error(`'${snapshotName}' is not a valid snapshot`);
  }
  return session;
}

module.exports = { snapshotSession, listSnapshots, restoreSnapshot };

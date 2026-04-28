'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

let tmpDir;
beforeAll(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tabstack-stash-'));
  process.env.TABSTACK_DIR = tmpDir;
});

afterAll(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
  delete process.env.TABSTACK_DIR;
});

const { saveSession, loadSession, listSessions, deleteSession } = require('../storage');
const { stashSession, popStash, listStashes, STASH_PREFIX } = require('./stash');

const makeSession = (tabs) => ({ tabs, created: new Date().toISOString() });

test('full stash/pop round-trip preserves tabs', () => {
  const tabs = [{ url: 'https://example.com', title: 'Example' }];
  saveSession('mywork', makeSession(tabs));

  const stashName = stashSession('mywork');
  expect(stashName).toMatch(new RegExp(`^${STASH_PREFIX}mywork_`));

  const stashed = loadSession(stashName);
  expect(stashed.stashedFrom).toBe('mywork');
  expect(stashed.tabs).toEqual(tabs);

  popStash('mywork');
  const restored = loadSession('mywork');
  expect(restored.tabs).toEqual(tabs);
  expect(restored.stashedFrom).toBeUndefined();

  const remaining = listSessions().filter(s => s.startsWith(STASH_PREFIX));
  expect(remaining).toHaveLength(0);
});

test('multiple stashes stack and pop in order', () => {
  const tabs1 = [{ url: 'https://a.com', title: 'A' }];
  const tabs2 = [{ url: 'https://b.com', title: 'B' }];
  saveSession('proj', makeSession(tabs1));
  stashSession('proj');

  saveSession('proj', makeSession(tabs2));
  stashSession('proj');

  const stashes = listStashes().filter(s => s.originalName === 'proj');
  expect(stashes.length).toBe(2);

  popStash('proj');
  const afterFirst = loadSession('proj');
  expect(afterFirst.tabs).toEqual(tabs2);

  popStash('proj');
  const afterSecond = loadSession('proj');
  expect(afterSecond.tabs).toEqual(tabs1);
});

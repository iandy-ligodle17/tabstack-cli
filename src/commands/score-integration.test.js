const path = require('path');
const os = require('os');
const fs = require('fs');
const { scoreSession, scoreTab } = require('./score');

function makeSession(tabs) {
  return { tabs };
}

describe('score integration', () => {
  test('full pipeline: mixed session ranks correctly', () => {
    const session = makeSession([
      { url: 'http://localhost:8080/app', title: 'Local App' },
      { url: 'https://github.com/org/repo', title: 'org/repo: A useful repository' },
      { url: 'https://stackoverflow.com/questions/99999', title: 'How to handle async errors in Node.js' },
      { url: 'https://example.com', title: 'Example' },
    ]);

    const result = scoreSession(session);

    expect(result.tabs).toHaveLength(4);
    // github and stackoverflow should outrank example and localhost
    const urls = result.tabs.map((t) => t.url);
    expect(urls.indexOf('https://github.com/org/repo')).toBeLessThan(
      urls.indexOf('http://localhost:8080/app')
    );
    expect(urls.indexOf('https://stackoverflow.com/questions/99999')).toBeLessThan(
      urls.indexOf('http://localhost:8080/app')
    );
  });

  test('score is deterministic across calls', () => {
    const tab = { url: 'https://github.com/user/repo', title: 'Repo' };
    expect(scoreTab(tab)).toBe(scoreTab(tab));
  });

  test('total equals sum of individual scores', () => {
    const tabs = [
      { url: 'https://github.com/a', title: 'A' },
      { url: 'https://example.com', title: 'B' },
      { url: 'http://localhost:3000', title: 'C' },
    ];
    const session = makeSession(tabs);
    const result = scoreSession(session);
    const expectedTotal = tabs.reduce((s, t) => s + scoreTab(t), 0);
    expect(result.total).toBeCloseTo(expectedTotal, 1);
  });

  test('single tab session has average equal to that tab score', () => {
    const tab = { url: 'https://docs.example.com/guide', title: 'Guide' };
    const result = scoreSession(makeSession([tab]));
    expect(result.average).toBe(result.total);
  });
});

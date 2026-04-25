const { clusterTabs, formatClusterResult } = require('./cluster');
const { loadSession } = require('../storage');

jest.mock('../storage');

function makeSession(tabs) {
  return { name: 'test', tabs };
}

beforeEach(() => jest.clearAllMocks());

test('clusters tabs by domain', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'https://github.com/foo', title: 'Foo' },
    { url: 'https://github.com/bar', title: 'Bar' },
    { url: 'https://www.google.com/search', title: 'Search' },
  ]));

  const result = await clusterTabs('test', { minSize: 2 });
  expect(result.clusters['github.com']).toHaveLength(2);
  expect(result.unclustered).toHaveLength(1);
});

test('strips www from domain', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'https://www.github.com/a', title: 'A' },
    { url: 'https://github.com/b', title: 'B' },
  ]));

  const result = await clusterTabs('test', { minSize: 2 });
  expect(result.clusters['github.com']).toHaveLength(2);
});

test('respects minSize option', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'https://github.com/a', title: 'A' },
    { url: 'https://news.ycombinator.com/', title: 'HN' },
    { url: 'https://reddit.com/r/js', title: 'Reddit' },
  ]));

  const result = await clusterTabs('test', { minSize: 1 });
  expect(Object.keys(result.clusters)).toHaveLength(3);
  expect(result.unclustered).toHaveLength(0);
});

test('handles invalid URLs gracefully', async () => {
  loadSession.mockResolvedValue(makeSession([
    { url: 'not-a-url', title: 'Bad' },
    { url: 'also-bad', title: 'Also Bad' },
  ]));

  const result = await clusterTabs('test', { minSize: 2 });
  expect(result.clusters['__invalid__']).toHaveLength(2);
});

test('formatClusterResult shows clusters and unclustered', () => {
  const result = {
    clusters: {
      'github.com': [
        { url: 'https://github.com/a', title: 'A' },
        { url: 'https://github.com/b', title: 'B' },
      ],
    },
    unclustered: [{ url: 'https://example.com', title: 'Example' }],
  };
  const output = formatClusterResult(result);
  expect(output).toContain('github.com');
  expect(output).toContain('2 tab(s)');
  expect(output).toContain('unclustered');
  expect(output).toContain('Example');
});

test('formatClusterResult handles no clusters', () => {
  const output = formatClusterResult({ clusters: {}, unclustered: [] });
  expect(output).toContain('No clusters found');
});

# score

Score and rank tabs within a session based on heuristics like domain importance, title length, and protocol.

## Usage

```
tabstack score <session>
```

## Description

The `score` command analyzes each tab in a session and assigns a numeric score based on several factors:

- **Domain weight**: Well-known productive domains (e.g. `github.com`, `stackoverflow.com`, documentation sites) receive a higher base weight.
- **Title length**: Tabs with descriptive titles get a small bonus.
- **Protocol**: HTTPS tabs receive a small bonus over HTTP.
- **Localhost**: Local development URLs are weighted lower.

Tabs are displayed in descending order of score so the most "valuable" tabs appear first.

## Output

```
Session: work
Average score: 1.42  Total: 7.10

  1. [1.65] My Project – GitHub
       https://github.com/user/my-project
  2. [1.54] javascript - How to do X - Stack Overflow
       https://stackoverflow.com/questions/12345
  ...
```

## Options

None currently. Future versions may support `--weights` to supply a custom domain weight file.

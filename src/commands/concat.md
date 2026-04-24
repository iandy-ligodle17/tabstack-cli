# concat

Concatenate two or more saved sessions into a single new session.

## Usage

```
tabstack concat <session1> <session2> [..more] --output <name> [--tags <tags>]
```

## Arguments

| Argument | Description |
|---|---|
| `session1`, `session2`, ... | Names of sessions to concatenate (minimum 2) |
| `--output`, `-o` | Name for the resulting combined session (required) |
| `--tags` | Comma-separated list of tags to apply to the new session |

## Description

Tabs are appended in the order the source sessions are listed. The original
sessions are left unchanged. The resulting session is saved under the name
provided with `--output`.

Metadata on the new session records which source sessions were used via
`meta.concatSources`.

## Examples

```bash
# Merge two sessions
tabstack concat work personal --output all-tabs

# Merge three sessions and tag the result
tabstack concat mon tue wed --output week --tags work,weekly
```

## Notes

- Duplicate URLs are **not** removed automatically. Use `dedupe` afterwards if needed.
- To keep only unique tabs across sessions, pipe through `unique` after concatenating.

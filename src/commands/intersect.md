# intersect

Find tabs that are common across two or more saved sessions.

## Usage

```
tabstack intersect <session1> <session2> [session3...] [--save <name>]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `session1`, `session2`, ... | Names of sessions to intersect (minimum 2) |

## Options

| Flag | Description |
|------|-------------|
| `--save <name>` | Save the resulting common tabs as a new session |
| `--help` | Show usage information |

## Examples

```bash
# Show tabs common to both "work" and "research"
tabstack intersect work research

# Find common tabs across three sessions
tabstack intersect morning afternoon evening

# Save the intersection as a new session
tabstack intersect work research --save work-research-overlap
```

## Notes

- URL matching normalises trailing slashes and ignores protocol (`http` vs `https`)
  so `https://example.com/` and `http://example.com` are treated as the same tab.
- At least two session names must be provided.
- If a session does not exist the command exits with an error.

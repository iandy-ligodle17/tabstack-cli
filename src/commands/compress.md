# compress

Remove duplicate and empty tabs from a saved session, producing a cleaner, smaller session file.

## Usage

```
tabstack compress <session-name> [--dry-run]
```

## Options

| Flag | Description |
|------|-------------|
| `--dry-run` | Preview changes without modifying the session file |

## What it does

- Removes tabs whose URLs are empty or whitespace-only.
- Deduplicates tabs that share the same URL (trailing slashes are normalised before comparison).
- Trims leading/trailing whitespace from tab titles and URLs.
- Preserves the first occurrence of each URL; later duplicates are dropped.

## Examples

```bash
# Compress a session in-place
tabstack compress work
# Session "work": 12 → 9 tab(s) (removed 3 duplicate/empty).

# Preview without saving
tabstack compress research --dry-run
# [dry-run] Session "research": 20 → 18 tab(s) (removed 2 duplicate/empty).
```

## Notes

- If no tabs are removed the command exits cleanly with an informational message.
- The original session is overwritten; use `tabstack backup` beforehand if you want to keep a copy.

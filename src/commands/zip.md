# zip

Combine two or more saved sessions into a single merged session.

## Usage

```
tabstack zip <session1> <session2> [more...] [--name <output>]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `session1`, `session2`, ... | Names of sessions to zip together (minimum 2) |
| `--name <output>` | Name for the resulting session (default: `zip-<timestamp>`) |

## Examples

```bash
# Zip two sessions into one
tabstack zip work personal --name combined

# Zip three sessions with an auto-generated name
tabstack zip morning afternoon evening
```

## Output

```
Zipped session: combined
Total tabs: 12

Sources:
  - work (7 tabs)
  - personal (5 tabs)
```

## Notes

- Tabs are appended in the order the source sessions are listed.
- The original sessions are not modified.
- The resulting session stores metadata about its sources under the `zipped` field.
- If `--name` is omitted, a timestamped name like `zip-1718000000000` is used.

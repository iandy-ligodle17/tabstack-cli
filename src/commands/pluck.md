# pluck

Pluck specific tabs by index from an existing session into a new named session.

## Usage

```
tabstack pluck <session> <indices> <dest>
```

## Arguments

| Argument   | Description                                      |
|------------|--------------------------------------------------|
| `session`  | Name of the source session                       |
| `indices`  | Comma-separated 0-based tab indices to pluck     |
| `dest`     | Name for the new destination session             |

## Examples

```bash
# Pluck tabs 0, 2, and 4 from "work" into a new session "focus"
tabstack pluck work 0,2,4 focus

# Pluck just the first tab
tabstack pluck research 0 quick-ref
```

## Notes

- Duplicate indices are silently deduplicated.
- Indices are 0-based (first tab is index 0).
- The source session is **not** modified.
- The destination session is created (or overwritten if it already exists).
- The new session records `pluckedFrom` metadata pointing to the source.

## Output

```
Plucked 3 tab(s) from "work" into "focus":
  1. GitHub - tabstack-cli
  2. MDN Web Docs
  3. Node.js Documentation
```

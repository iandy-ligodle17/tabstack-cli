# slice

Extract a contiguous range of tabs from an existing session into a new session.

## Usage

```
tabstack slice <session> <start> <end> [dest]
```

## Arguments

| Argument  | Description                                        |
|-----------|----------------------------------------------------|
| `session` | Name of the source session                         |
| `start`   | Start index (0-based, inclusive)                   |
| `end`     | End index (exclusive)                              |
| `dest`    | Name for the new session (default: `<name>-slice`) |

## Examples

```bash
# Save tabs 0–4 from "work" into a new session called "work-slice"
tabstack slice work 0 5

# Save tabs 2–7 from "research" into "research-morning"
tabstack slice research 2 8 research-morning
```

## Notes

- Indices follow standard JavaScript `Array.slice` semantics (start inclusive, end exclusive).
- The end index is automatically clamped to the number of tabs in the session.
- The original session is **not** modified.
- The resulting session stores `slicedFrom` and `sliceRange` metadata for traceability.

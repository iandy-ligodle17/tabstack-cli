# bookmark

Bookmark specific tabs within a session for quick reference.

## Usage

```
tabstack bookmark <session> <index> [label]   Add a bookmark
tabstack bookmark <session> --list            List all bookmarks
tabstack bookmark <session> --remove <index>  Remove a bookmark
```

## Arguments

- `session` — Name of the session to operate on
- `index`   — Zero-based index of the tab to bookmark
- `label`   — Optional custom label (defaults to tab title or URL)

## Options

- `--list`         List all bookmarks in the session
- `--remove <n>`   Remove the bookmark at index `n`

## Examples

```bash
# Bookmark tab 2 in session "research" with a label
tabstack bookmark research 2 "Important paper"

# List all bookmarks in session "research"
tabstack bookmark research --list

# Remove bookmark at index 2
tabstack bookmark research --remove 2
```

## Notes

Bookmarks are stored inside the session file and do not affect tab order.
They are preserved across restore and export operations.

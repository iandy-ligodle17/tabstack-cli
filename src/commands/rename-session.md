# rename-session

Rename an existing tab session to a new name.

## Usage

```
tabstack rename-session <old-name> <new-name>
```

## Arguments

- `old-name` — the current name of the session
- `new-name` — the desired new name for the session

## Behavior

- Loads the session under `old-name`
- Saves it under `new-name` with updated metadata (`renamedAt`, `previousName`)
- Deletes the original session file
- Fails if the old session doesn't exist
- Fails if the new name is already taken
- Fails if old and new names are identical

## Example

```
$ tabstack rename-session work work-2024
Session "work" renamed to "work-2024" successfully.
```

## Notes

The renamed session retains all original tabs and metadata. The `previousName`
field is added so you can trace the history of renames. Use `tabstack history`
to view past operations on a session.

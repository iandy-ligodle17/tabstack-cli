# stash

Temporarily save a session aside without losing it, then restore it later.

## Usage

```
tabstack stash <session>          # stash the current session
tabstack stash pop <session>      # restore the most recent stash
tabstack stash list               # list all stashed sessions
```

## Description

The `stash` command lets you save a snapshot of a session under a hidden
internal name so you can make changes to the session or swap to another one
without permanently losing the original state.

Multiple stashes can exist for the same session; `pop` always restores the
most recent one.

## Examples

```
# Stash the "work" session before a risky edit
tabstack stash work

# List all stashes
tabstack stash list

# Restore the latest stash for "work"
tabstack stash pop work
```

## Notes

- Stash entries are stored with the prefix `__stash__` and are hidden from
  the normal `list` output.
- `pop` removes the stash entry after restoring it.
- Stashes include a `stashedAt` timestamp so you can see when each one was
  created.

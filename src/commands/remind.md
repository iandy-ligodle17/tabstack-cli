# remind

Attach time-based reminders to a session so you get notified when it's time to revisit a set of tabs.

## Usage

```
tabstack remind set <session> <date> <message>
tabstack remind list <session>
tabstack remind clear <session> <id>
tabstack remind check <session>
```

## Examples

```bash
# Set a reminder for tomorrow morning
tabstack remind set work "2024-12-01 09:00" "Review open PRs"

# List all reminders on a session
tabstack remind list work

# Remove a specific reminder by ID
tabstack remind clear work 1701234567890

# Check if any reminders are due right now
tabstack remind check work
```

## Output

```
[1701234567890] [pending] 12/1/2024, 9:00:00 AM — Review open PRs
```

## Notes

- Dates are parsed with `new Date()`, so ISO strings and human-readable formats both work.
- Once a reminder's date has passed and `check` is run, it is marked as `triggered` and will no longer appear as pending.
- Reminder IDs are Unix timestamps (ms) assigned at creation time.
- Reminders are stored inside the session JSON file under the `reminders` key.

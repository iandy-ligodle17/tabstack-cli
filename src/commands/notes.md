# Notes Command

Attach freeform notes to any saved session.

## Usage

```bash
# Add a note
tabstack notes add <session> "your note here"

# List all notes
tabstack notes list <session>

# Remove a note by index
tabstack notes remove <session> <index>

# Clear all notes
tabstack notes clear <session>
```

## Examples

```bash
tabstack notes add work "sprint planning tabs"
tabstack notes add work "review before Monday"
tabstack notes list work
# [0] sprint planning tabs  (2024-06-01T10:00:00.000Z)
# [1] review before Monday  (2024-06-01T11:30:00.000Z)

tabstack notes remove work 0
tabstack notes clear work
```

## Data Format

Notes are stored inside the session JSON file under a `notes` array:

```json
{
  "tabs": ["https://example.com"],
  "notes": [
    { "text": "sprint planning tabs", "createdAt": "2024-06-01T10:00:00.000Z" }
  ]
}
```

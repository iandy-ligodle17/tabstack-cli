# Template Command

Save and reuse tab session templates.

## Usage

```
tabstack template save <session> <template-name>   Save a session as a template
tabstack template apply <template-name> <session>  Create a session from a template
tabstack template list                             List all saved templates
tabstack template delete <template-name>           Delete a template
```

## Examples

```bash
# Save your current work session as a template
tabstack template save work-friday work-base

# Apply the template to start a new session
tabstack template apply work-base monday-session

# List all templates
tabstack template list

# Delete a template
tabstack template delete work-base
```

## Notes

- Templates are stored internally with a `__template__` prefix.
- Applying a template creates a new session with the same tabs.
- Templates do not appear in regular `list` output.

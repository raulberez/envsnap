# `envsnap stats`

Display statistics and metadata about a saved snapshot.

## Usage

```
envsnap stats <name> [options]
```

## Arguments

| Argument | Description                        |
|----------|------------------------------------|
| `name`   | Name of the snapshot to inspect    |

## Options

| Flag     | Description                          |
|----------|--------------------------------------|
| `--json` | Output raw statistics as JSON        |

## Output Fields

- **Total keys** — number of environment variables in the snapshot
- **Non-empty values** — keys with non-empty, non-null values
- **Empty values** — keys with empty string or null values
- **Unique values** — number of distinct values across all keys
- **Avg value length** — average character length of all values
- **Longest key** — the key with the most characters
- **Shortest key** — the key with the fewest characters
- **Tags** — number of tags attached to the snapshot
- **Created at** — ISO timestamp of when the snapshot was created

## Examples

```bash
# Print human-readable stats
envsnap stats production

# Output as JSON for scripting
envsnap stats production --json
```

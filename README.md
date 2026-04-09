# envsnap

A CLI tool to snapshot, diff, and restore environment variable sets across projects.

## Installation

```bash
npm install -g envsnap
```

Or use directly with npx:

```bash
npx envsnap [command]
```

## Usage

**Snapshot your current environment:**
```bash
envsnap save production
```

**List all snapshots:**
```bash
envsnap list
```

**Restore a snapshot:**
```bash
envsnap restore production
```

**Diff two snapshots:**
```bash
envsnap diff production staging
```

**Export snapshot to .env file:**
```bash
envsnap export production > .env.production
```

## Commands

| Command | Description |
|---------|-------------|
| `save <name>` | Create a snapshot of current environment variables |
| `restore <name>` | Restore environment variables from a snapshot |
| `list` | Show all saved snapshots |
| `diff <name1> <name2>` | Compare two snapshots |
| `export <name>` | Export snapshot to stdout in .env format |
| `delete <name>` | Remove a snapshot |

## License

MIT
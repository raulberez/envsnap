# `envsnap rating`

Manage star ratings (1–5) for your snapshots.

## Subcommands

### `rating set <name> <score>`

Assign a numeric rating from 1 to 5 to a snapshot.

```bash
envsnap rating set production 5
envsnap rating set staging 3
```

### `rating get <name>`

Display the current rating for a snapshot.

```bash
envsnap rating get production
# production: ★★★★★ (5/5) — 2024-06-01T12:00:00.000Z
```

### `rating remove <name>`

Delete the rating entry for a snapshot.

```bash
envsnap rating remove staging
```

### `rating list`

List all rated snapshots, sorted by score descending.

```bash
envsnap rating list
# production: ★★★★★ (5/5) — ...
# staging:    ★★★☆☆ (3/5) — ...
```

## Notes

- Ratings are stored in `ratings.json` inside the snapshots directory.
- Valid scores are integers **1 through 5**.
- Ratings are independent of tags, labels, and comments.

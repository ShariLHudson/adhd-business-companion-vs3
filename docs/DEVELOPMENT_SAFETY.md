# Development Safety Guide

Use this guide when the ADHD Business Ecosystem™ is moving fast and you need a reliable way to return to a known-good state.

## Check current changes

```bash
git status
```

## See commit history

```bash
git log --oneline --decorate --graph --all
```

## Restore one file from last commit

```bash
git checkout HEAD -- path/to/file
```

## Restore one file from a specific commit

```bash
git checkout <commit-hash> -- path/to/file
```

## Go back to a tagged version temporarily

```bash
git checkout v0.8-clear-my-mind
```

## Return to working branch

```bash
git checkout main
```

## Create a safety branch before risky work

```bash
git checkout -b safety/name-of-work
```

## Push tags

```bash
git push --tags
```

## VS Code Timeline

VS Code has a Timeline panel that may show local file history.

Use it as a short-term backup only.

Git commits are the real safety net.

## Important Rule

Do not begin major feature work without either:

* a clean commit, or
* a safety branch.

## Milestone tags

| Tag | Description |
|-----|-------------|
| `v0.8-clear-my-mind` | Stable Clear My Mind and My Thoughts foundation |

## Safety branch for this milestone

`safety/clear-my-mind-working` — protects the Clear My Mind + My Thoughts work before further changes.

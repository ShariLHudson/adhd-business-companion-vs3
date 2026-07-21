# Initial Welcome Account-Level Decision

## Approved Rule

The initial Spark Estate welcome appears automatically only once:

- after account creation
- on the first authenticated entry
- never automatically again after completion or dismissal

**Constitutional product rule:** [126 First-Time Welcome Experience Standard](../product-specifications/126_FIRST_TIME_WELCOME_EXPERIENCE_STANDARD.md)

## Persistence

Completion must be stored on the authenticated account, not only in browser or session storage.

Runtime: Supabase `user_metadata.welcome_completed_at` (+ disposition / platform version) via `lib/firstLoginWelcome/`.

## Existing Users

Established accounts must be treated as already complete and must not receive the first-time welcome again.

## Replay

The user may replay the welcome only through an explicit approved action.

Replay does not reset the automatic-display completion flag.

Settings → Replay Welcome runs the silent Welcome Home cinematic and must not clear `welcome_completed_at`.

## Status

- repeated welcome confirmed (resolved)
- implementation started and in production path (`FirstLoginWelcomeGate`)
- constitutional rule landed as **126** (2026-07-21)
- migration path for established accounts: `establishedAccount.ts`
- preview / multi-device live checklist: see `120_ONE_TIME_ACCOUNT_WELCOME_LIVE_*`

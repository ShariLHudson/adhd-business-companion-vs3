# Live Results — One-Time Account Welcome (119–121)

**Status:** `unit_verified` · authenticated preview rows **Pending**  
**Do not deploy production** until authenticated live checklist passes.

## Root cause of repeated welcome

1. **Account metadata sync could fail silently** — `updateUser` failures left completion only in localStorage; new browser / cleared storage / other device re-showed welcome.
2. **No established-user migration** — accounts without `welcome_completed_at` (pre-dating the gate or failed sync) still qualified as first-time.
3. **Gate effect depended on full `user_metadata`** — completion writes could briefly re-enter `checking` and risk flash.

## Authoritative state

| Item | Owner |
|------|--------|
| Field | Supabase `user_metadata.welcome_completed_at` (+ `welcome_audio_played_at`) |
| Local cache | `localStorage["companion-first-login-welcome-v1:{userId}"]` |
| Eligibility read | `loadFirstLoginWelcomeRecord` → `FirstLoginWelcomeGate` |
| Completion write | `markWelcomeCompleted` (idempotent, retried metadata push) |
| Migration | `hasEstablishedAccountWelcomeEvidence` → auto `markWelcomeCompleted` |

## Migration rule

Treat welcome complete when any of: existing completion/audio timestamps, `hasSeenWelcomeIntro`, onboarded / hasChatted / named prefs, saved projects, per-user onboarded map, or repeat login with device history. On server fetch failure for established users → safe normal entry (local complete), never flash loop.

## Replay

Settings → **Replay Welcome** (and menu action `replay-welcome`) runs silent Welcome Home cinematic via `requestWelcomeHomeReplay`. Does **not** clear `welcome_completed_at`. Spoken first-login audio remains account-once.

## Automated tests

- `lib/firstLoginWelcome/*` (persistence, established, eligibility, gate behavior)
- `lib/welcomeHome/dailyGreeting.test.ts` (explicit replay cinematic)
- `lib/estateMenu/welcomeHomeMenuVerification.test.ts` (replay wiring)

## Authenticated preview (120)

Pending — run `docs/navigation/120_ONE_TIME_ACCOUNT_WELCOME_LIVE_CHECKLIST.md` on preview after deploy.

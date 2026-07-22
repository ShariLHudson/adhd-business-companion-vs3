# 146 — First-Time Experience & Welcome State Certification

**Status:** Provisionally certified (unit + static)  
**Date:** 2026-07-22  
**Builds on:** 119–121 · 126 First-Time Welcome Standard

## Mission

The Welcome audio/video is a **one-time** onboarding experience. It must never become a recurring interruption. Completion belongs to the **account**, not the browser tab.

## Final product principle

> The Welcome should feel like someone greeting you when you first arrive at Spark Estate — not like someone introducing themselves every time you walk through the front door.

## PART 1 — First-Time Rule

| Rule | Status |
|------|--------|
| Auto-play only for brand-new account first Welcome Home visit | Pass (`FirstLoginWelcomeGate`) |
| Never auto-play after completion | Pass (`welcome_completed_at` + established migration) |

## PART 2 — Completion State

Marked complete when the member:

| Action | Status |
|--------|--------|
| Watches to the end | Pass (Prompt 146 — `voiceState === "ended"` → `markWelcomeCompleted`) |
| Skips | Pass |
| Closes / Escape dismiss | Pass (Prompt 146 — Escape → disposition `dismissed`) |
| Continues / Stop & Continue | Pass |

Disposition values: `completed` · `skipped` · `dismissed` — all suppress automatic replay.

## PART 3 — Persistent Storage

| Layer | Owner |
|-------|--------|
| Authoritative | Supabase `user_metadata.welcome_completed_at` (+ audio, disposition, platform version) |
| Local cache | `companion-first-login-welcome-v1:{userId}` |
| Cinematic intro | prefs `hasSeenWelcomeIntro` + local key |

Survives logout/login, refresh, new session, restart. Not client-only.

## PART 4 — Cross-Device

Account metadata sync via `updateUser` with retries. Established-account migration prevents re-show when metadata is missing but activity evidence exists.

## PART 5 — Manual Replay

| Surface | Status |
|---------|--------|
| Settings · Replay Welcome | Pass |
| Estate menu · replay-welcome | Pass |
| Help / Learn · Replay Welcome article | Pass (Prompt 146) |

Replay runs silent Welcome Home cinematic via `requestWelcomeHomeReplay`. **Never** clears `welcome_completed_at`.

## PART 6 — New User Detection

| Kind | Behavior |
|------|----------|
| Brand-new | Gate may auto-present |
| Returning / established evidence | Auto-migrated to complete |
| Restored session with completion | `not_required` |
| Imported / pre-existing activity | Established evidence → complete |

## PART 7 — Browser Certification Matrix

| Flow | Unit / static | Browser |
|------|---------------|---------|
| Brand-new account | Pass (gate + eligibility tests) | Provisional |
| Refresh after completion | Pass | Provisional |
| Logout / login | Pass (account metadata) | Provisional |
| Second session | Pass | Provisional |
| Different browser / device | Pass (intent + metadata) | Provisional |
| Manual replay | Pass | Provisional |
| Skipped / interrupted welcome | Pass | Provisional |

**Provisional:** Full authenticated multi-device checklist still recommended on Preview.

## PART 8 — First-Time Experience Framework

Broader framework (Prompt 146): `lib/firstTimeExperience/`

| Experience | Auto-present? | Persistence |
|------------|---------------|-------------|
| welcome-audio | Yes (once) | Account + local |
| welcome-home-cinematic | Yes (once) | Local / prefs |
| how-everything-works-together | No (member-opened) | Local FTE record on close |
| estate-tour | No | Local FTE record when tour used |
| room-introduction | Reserved | Local |
| feature-introduction | Reserved | Local |

Principle: once seen, Spark remembers. Members may revisit intentionally; Spark never forces again.

## Key files

- `components/companion/FirstLoginWelcomeOverlay.tsx`
- `lib/firstLoginWelcome/persistence.ts`
- `lib/firstTimeExperience/*`
- `components/companion/EstateOrientationHost.tsx`
- `lib/howDoIHelpArticles.ts` (`replay-welcome`)
- Tests: `lib/firstTimeExperience/firstTimeExperience.test.ts` · existing `lib/firstLoginWelcome/*`

## Certification verdict

**Provisionally certified for Prompt 146** — one-time welcome strengthened (end-of-audio + Escape dismiss), Help replay path added, First-Time Experience framework scaffolded for tours and orientation. Promote to full after authenticated Preview matrix.

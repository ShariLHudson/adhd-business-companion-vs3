# 126 — First-Time Welcome Experience Current-State Map

**Date:** 2026-07-21  
**Standard:** [126 First-Time Welcome Experience Standard](./126_FIRST_TIME_WELCOME_EXPERIENCE_STANDARD.md)

---

## Verdict

The account-level one-time gate is **implemented** (`FirstLoginWelcomeGate` + Supabase `welcome_completed_at`). This landing elevates that behavior to a constitutional product rule and strengthens completion records (disposition + platform version).

There is **no separate welcome video asset** today — narration/audio + UI gate fulfill the introduction. Silent Welcome Home cinematic is a related but distinct experience.

---

## Implemented vs 126

| Requirement | Status | Notes |
|-------------|--------|-------|
| Once per new user | **Pass** | Gate only when no completion record |
| Skip suppresses forever | **Pass** | Skip/dismiss → `markWelcomeCompleted` |
| Complete suppresses forever | **Pass** | Idempotent; never clears |
| No auto-repeat on login/refresh/update | **Pass (intent)** | Account metadata; established-user migration |
| Manual replay without reset | **Partial** | Settings Replay Welcome → silent cinematic only; does not clear `welcome_completed_at` |
| Cross-device sync | **Pass (intent)** | Supabase `user_metadata` |
| Accessibility (skip, mute, reduced motion) | **Partial** | Gate supports skip/mute/stop; captions for cinematic still future |
| Record completed vs skipped | **Strengthened this landing** | `welcomeDisposition` + metadata |
| Record platform version shown | **Strengthened this landing** | `welcomePlatformVersion` + metadata |

---

## Authoritative paths

| Concern | Path |
|---------|------|
| Gate UI | `components/companion/FirstLoginWelcomeOverlay.tsx` |
| Wiring | `components/companion/CompanionPageLoader.tsx` |
| Persistence | `lib/firstLoginWelcome/persistence.ts` |
| Constitution contract | `lib/firstLoginWelcome/welcomeExperienceConstitution.ts` |
| Silent cinematic | `WelcomeHomeFirstLaunch.tsx` · `lib/welcomeHome/` |
| Settings replay | `SettingsPanel` · `requestWelcomeHomeReplay` |

---

## Explicit non-goals / do not conflate

- Daily Companion Opening  
- Arrival Intelligence returning greetings  
- Phase 1 onboarding  
- Estate room arrival overlays  

---

## Remaining gaps (follow-up)

1. Optional: Settings path to re-hear spoken first-login audio without clearing completion  
2. Captions for welcome audio / cinematic  
3. Authenticated multi-device live checklist still pending in navigation docs  
4. Refresh stale `docs/navigation/121_INITIAL_WELCOME_ACCOUNT_LEVEL_DECISION.md` status (done in this landing)

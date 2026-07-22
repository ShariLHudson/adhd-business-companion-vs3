# 146 — Onboarding & Global Navigation Finalization

**Status:** Provisionally certified (unit + static)  
**Date:** 2026-07-22  
**Branch:** `deploy/companion-app-v3`  
**Related:** Welcome state (`146_FIRST_TIME_EXPERIENCE…`) · IA (`144_GLOBAL_NAVIGATION…`)

## Mission

Finalize Welcome one-time behavior and intention-based navigation so Spark Estate matches the approved mental model: Work to Create · Guidance · Focus & Reflection · Audio.

## PART 1 — Opening Welcome (one-time)

| Requirement | Status |
|-------------|--------|
| Auto-play only for brand-new first visit | Pass (`FirstLoginWelcomeGate` + account metadata) |
| Skip / complete / dismiss / watch-to-end suppress forever | Pass (Prompt 146 welcome hardening) |
| Account completion syncs cinematic (`hasSeenWelcomeIntro`) | Pass (load completed → `markWelcomeIntroSeen`) |
| Manual Replay Welcome only | Pass (Settings · Help · Estate menu) |

Browser multi-device matrix: provisional.

## PART 2 — Audio menu

**Audio** contains only:

- Peaceful Moments  
- Soundscapes  

Retired menu rows (Nature / Focus / Guided / Relaxation) remain as **aliases** for deep links — not listed in the menu.

## PART 3 — Cartography under Work to Create

Top-level **Cartography** category removed. **Cartography** is a Work to Create destination (Cartographer’s Studio).

## PART 4 — Strategies under Guidance

**Guidance** = Strategies only (thinking / approaches — not creation).

Chamber and Board are first-class top-level categories.

## PART 5 — Final Welcome Home structure

| Menu | Destinations |
|------|----------------|
| Today | Plan My Day / Adapt · Schedule · Reminders / Rhythms |
| Work to Create | Create · Projects · Templates · Blueprints · Cartography · Continue Working · Spin the Wheel |
| Guidance | Strategies |
| Focus & Reflection | Talk It Out · Clear My Mind · Parking Lot · Breathe · Journal · Evidence Vault · Hall |
| Audio | Peaceful Moments · Soundscapes |
| Chamber | Chamber of Momentum |
| Board | Boardroom |
| Estate | Wander the Grounds · Spark Estate Guide |

Business Estate · Connections · Settings remain on the SH profile menu (unchanged).

## PART 6 — Help / onboarding

How Everything Works Together copy updated: Cartography under Work to Create; Strategies under Guidance.

## PART 7 — Certification

| Check | Status |
|-------|--------|
| Menu openers wired (Templates, Continue Working, Cartography) | Pass |
| Active category highlight | Pass (unit) |
| No duplicate Audio destinations | Pass |
| No orphan Cartography category | Pass |
| Full browser / a11y / back-stack matrix | Provisional |

## Runtime

- `lib/estate/welcomeHomeNavigationStructure.ts`
- `lib/estate/welcomeHomeActiveDestination.ts`
- `components/companion/estate/EstateRoomExperienceMenu.tsx`
- `lib/firstLoginWelcome/persistence.ts` (cinematic sync)
- `lib/estateOrientation/howSparkEstateWorksTogether.ts`

## Verdict

**Provisionally certified.** Navigation matches the approved intention groups; Welcome remains account-once. Promote after Preview smoke of each moved destination.

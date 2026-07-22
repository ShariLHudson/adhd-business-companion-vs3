# 146 — Onboarding & Global Navigation Finalization

**Status:** Provisionally certified (unit + static)  
**Date:** 2026-07-22  
**Branch:** `deploy/companion-app-v3`  
**Related:** Welcome state (`146_FIRST_TIME_EXPERIENCE…`) · IA (`144_GLOBAL_NAVIGATION…`)

## Mission

Finalize Welcome one-time behavior and intention-based navigation so Spark Estate matches the approved mental model: Today · Build · Guidance · Focus · Reflection · Audio · Spark Estates.

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

## PART 3 — Cartography under Build

Top-level **Cartography** category removed. **Cartography** is a Build destination (Cartographer’s Studio).

## PART 4 — Guidance (Chamber · Board · Strategies)

**Guidance** = Chamber of Momentum · Boardroom · Strategies.

Chamber and Board are **not** separate top-level categories.

## PART 5 — Final Welcome Home structure

| Menu | Destinations |
|------|----------------|
| Today | Plan My Day / Adapt My Day · Calendar · Reminders / Rhythms |
| Build | Create · Projects · Cartography · Destination Gallery |
| Guidance | Chamber of Momentum · Boardroom · Strategies |
| Focus | Talk It Out · Clear My Mind · Parking Lot · Breathe · Focus Library (Start focus session · Time blocking · Body double · Timers) |
| Reflection | Journal · Evidence Vault · Hall of Accomplishments |
| Audio | Peaceful Moments · Soundscapes |
| Spark Estates | Wander the Estate · Spark Estate Guide |
| Welcome Home | Return to living room (menu chrome control, last) |

Templates · Blueprints/Continue Working · Spin are not listed in this primary IA (may remain reachable elsewhere).

Business Estate · Connections · Settings remain on the SH profile menu (unchanged).

## PART 6 — Help / onboarding

How Everything Works Together copy: Cartography under Build; Chamber / Board / Strategies under Guidance.

## PART 7 — Certification

| Check | Status |
|-------|--------|
| Menu openers wired (Build destinations, Guidance, Focus Library children) | Pass |
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

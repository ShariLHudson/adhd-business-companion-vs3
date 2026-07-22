# 144 — Global Navigation Reorganization & Information Architecture

**Status:** Provisional (structure + unit tests certified; full browser matrix not run this session)  
**Date:** 2026-07-21  
**Branch:** `deploy/companion-app-v3`  
**Scope:** Navigation and information architecture only — experiences unchanged except routing aliases.

## Mission

Organize Welcome Home around natural intentions, not internal feature clusters. Reduce decision fatigue; keep deep links and return paths intact.

## Category map (Prompt 144)

| Menu | Question | Contents |
|------|----------|----------|
| **Today** | What should I do today? | Unchanged: Plan My Day / Adapt My Day · Calendar · Reminders / Rhythms |
| **Work to Create** | What do I want to build? | Create New Work · Projects · Strategies · Spin the Wheel · Destination Gallery |
| **Focus & Reflection** | How do I regain focus or learn? | Talk It Out · Clear My Mind · Parking Lot · Breathe · Browse more (Journal · Evidence · Hall) |
| **Audio** | What would help me concentrate or relax? | Peaceful Moments · Soundscapes · Nature Sounds · Focus Audio · Guided Audio · Relaxation Audio |
| **Cartography** | How do I see the bigger picture? | Cartographer’s Studio |
| **Guidance** | Who can help / advise me? | Chamber · Boardroom |
| **Estate** | How does the place fit together? | Wander the Grounds · Spark Estate Guide |

Connections and Settings remain outside Welcome Home (profile / SH) — unchanged.

## Design notes

- **Today unchanged** — planning tools stay under Today (Plan My Day is the primary Today path, not a duplicate top-level menu).
- **Audio separated** from reflection — listening is no longer under Focus & Reflection.
- **Strategies** and **Spin the Wheel** moved into Work to Create.
- **Cartography** promoted to its own intention category.
- **Learning-mode subtitles** on each category (default on) — `lib/estate/navLearningMode.ts`.
- **Aliases:** Nature Sounds → Peaceful Moments; Guided / Relaxation Audio → Soundscapes; Focus Audio → Focus Audio opener (fallback Peaceful Moments).

## Runtime

| Piece | Path |
|-------|------|
| Category structure | `lib/estate/welcomeHomeNavigationStructure.ts` |
| Active destination map | `lib/estate/welcomeHomeActiveDestination.ts` |
| Learning mode | `lib/estate/navLearningMode.ts` |
| Menu UI | `components/companion/estate/EstateRoomExperienceMenu.tsx` |
| Subtitle styles | `app/companion/estate-room-experience-menu.css` |
| Focus Audio wiring | `CompanionPageClient` → `onOpenFocusAudio` |

## Cross-navigation preservation

Destination **ids** for existing experiences remain stable (`create`, `talk-it-out`, `peaceful-places`, `playbook`/`strategy-library`, etc.). New Audio menu ids alias to existing openers. Category membership changed; return-to-source and section → destination mapping updated in `welcomeHomeActiveDestination`.

## Browser certification

| Check | Status |
|-------|--------|
| Every menu item has an opener | Unit + destinationAction map |
| Renames preserve function | Create → Create New Work still opens Create Estate |
| No orphan destinations | Former Browse-more audio/spin relocated |
| Labels consistent | Structure tests |
| Help / onboarding copy | Category labels updated in nav tests; deeper help prose may still say “Reflect” in older articles |
| Full live browser matrix | **Not run** this session |

## Verdict

**Provisional certify.** Intention IA is in place; validate live that Audio and Cartography menus open expected rooms and that active-category highlighting follows members correctly.

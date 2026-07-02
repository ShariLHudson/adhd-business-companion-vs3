# Phase D.1 — Runtime Shell Report

| Field | Value |
|-------|-------|
| **Phase** | D.1 — SparkEstateShell scaffold + wiring |
| **Status** | Complete |
| **Prerequisite** | [P0_CANON_ERRATA](./P0_CANON_ERRATA.md) |
| **Date** | 2026-06-30 |

---

## What shipped

| Artifact | Role |
|----------|------|
| `lib/estate/estateShellState.ts` | Maps `goToPlace` → shell props (`livingPlaceMode`, invitation flags) |
| `components/companion/estate/SparkEstateShell.tsx` | One scene + one conversation path |
| `lib/estate/estateShellState.test.ts` | Living place / P0 id tests |
| `CompanionPageClient.tsx` | Single shell mount for profile + direct estate visits |

---

## Shell behavior

1. **`resolveEstateShellState(placeId)`** — canonical law from `goToPlace` + P0 legacy id map  
2. **Scene layer** — `EstateRoomFullBleedBackground` + optional `EstatePresence` + vignette  
3. **Conversation layer** — one of:
   - `EstateRoomChatChrome` — living places, transitions, profile estate (no invitation grid)
   - `EstateRoomVisitChrome` — destinations that allow invitation (suppressed when `livingPlaceMode`)  
4. **Profile estate mode** — profile art plates; always conversation-only  

---

## Legacy shells bypassed (for unified visits)

| Former path | Now |
|-------------|-----|
| `ProfileEstateRoomExperience` | Thin adapter → `SparkEstateShell` |
| `EstateChatNavigationOverlay` | Thin adapter → `SparkEstateShell` |
| `CompanionPageClient` dual mount | Single `sparkEstateShellPlaceId` |

**Not yet in shell:** Momentum Institute, Stables, Momentum Builder dedicated panels; `WorkspaceLayout` home split; Welcome Home first launch.

---

## Out of scope (D.2+)

- Single `SimpleChat` mount across all modes (still one per shell visit)  
- Destination slot for Institute/Stables/Builder  
- Guidebook scene object layer  
- CSS / image consolidation  

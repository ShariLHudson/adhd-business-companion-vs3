# 091 — Workspace Environment Current-State Map

**Date:** 2026-07-21  
**Standard:** [091 Workspace Environment Personalization](./091_WORKSPACE_ENVIRONMENT_PERSONALIZATION_STANDARD.md)  
**Mode:** Map existing systems — do not invent a parallel scene registry

---

## Verdict

Estate rooms and Create Studio already supply **photograph + frosted work surface** for many experiences.  
**Missing:** Work Type–scoped defaults, per–Work Type preference memory, theme layer, and member accessibility controls for blur/opacity/imagery.

---

## What already satisfies the spirit of 091

| Capability | Today | Path |
|------------|-------|------|
| Scene behind work/chat | Estate place plates | `lib/estate/estateRoomBackground.ts`, `estatePlaceMedia.ts`, `estateRoomAssets.ts` |
| Frosted work surface | Spec 109 tokens | `lib/workspaceLayoutTokens.ts`, `companion-workspace-frosted` |
| Create → Creative Studio plate | Hard-coded studio | `lib/creativeStudio/creativeStudioRoom.ts`, `CreateEstateRoomShell.tsx` |
| Chat / CMM backdrop pick | Member photograph choice | `lib/chatBackdrop/chatBackdropPreference.ts` |
| Homestead workspace → place | Environment intelligence | `lib/companionConstitution/environmentIntelligence/resolveEnvironment.ts` |
| Intent → place | Estate Brain environments | `lib/estateBrain/environmentRegistry.ts` |
| Panel frost opacity (room) | Composition rule | `lib/roomCompositionRule/`, scene layout engine |

---

## Gaps vs 091

| Rule | Status |
|------|--------|
| Every Work Type has a default environment | **Partial** — foundation map in `lib/workspaceEnvironment/`; not yet driving all UWE shells |
| Preference remembered per Work Type | **Missing** — chat backdrop is not Work Type–scoped |
| Optional themes (Morning Light, etc.) | **Missing** as preference — time-of-day language exists elsewhere only |
| Changing env never moves chrome | **Mostly true** for chat backdrop rule; must remain law for Work Type prefs |
| Disable imagery / blur / opacity / motion / contrast | **Missing** as member prefs for work surfaces |
| No plain white/gray primary work area | **Often true** for Estate shells; risk remains on legacy/document panels |

---

## Naming boundary (avoid duplicate registries)

| Concept | Owner |
|---------|-------|
| Estate **place** identity | Canonical Estate Registry + Estate Brain |
| Chat / room **photograph** override | `chatBackdropPreference` |
| Work Type **workspace environment** default + preference | `lib/workspaceEnvironment/` (091) |
| Frosted **layout** chrome | Spec 109 / workspace layout tokens |

Environment definitions may **reference** an `estatePlaceId` when the environment is an Estate location. They must not create a second place SoT.

---

## Registered Work Type defaults (foundation)

| Work Type ID | Environment ID | Estate place (when linked) |
|--------------|----------------|----------------------------|
| `marketing_plan` | `creative-marketing-studio` | `creative-studio` |
| `event_plan` | `event-planning-studio` | `creative-studio` (interim until dedicated event studio plate) |
| `business_plan` | `executive-planning-office` | `strategy-studio` |

Additional Work Types from the product table (Strategic Plan, Writing, Podcast, …) are catalogued as environment IDs ready for registration when those Work Types exist.

---

## Recommended implementation sequence

1. **Done (this landing):** Product rule 091 + types + default map for registered Work Types  
2. Wire UWE / Create shells to `resolveWorkspaceEnvironment()` instead of hard-coded plates where safe  
3. Persist per–Work Type preference (extend or sibling to chat backdrop storage — do not overload room overrides)  
4. Theme catalog + optional atmosphere layer (no chrome change)  
5. Accessibility controls in 088 preferences UI  
6. Rare Shari preview recommendations (permission-only)

---

## Compatibility

- Must not break Universal Work Engine, Blueprint Framework, or Anywhere-Origin certification  
- Must not displace Estate Brain routing  
- Journal / canonical-plate-only rooms may remain exempt from free photograph swap (existing rule) while still never falling back to blank white

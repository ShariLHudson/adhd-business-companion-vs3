# Cartography Wall Map Labels & Routing Report

| Field | Value |
|-------|-------|
| **Date** | 2026-07-22 |
| **Prompt** | `docs/cartography/SPARK_ESTATE_CARTOGRAPHY_WALL_MAP_LABELS_ROUTING_CURSOR_PROMPT.md` |
| **Status** | Implemented |

## What shipped

1. **Canonical wall registry** — `lib/cartographersStudio/wallMaps.ts` (`cartographyWallMaps`) owns exact names, row/position order, and builder ids.
2. **Wall order** — Top: Mind, Decision, Journey, Process, Relationship · Bottom: Timeline Map, Strategy, Opportunity, System, Priority.
3. **System Map** replaces Project Map on the wall (Project Map remains a non-wall Visual Focus mode).
4. **Always-visible parchment labels** — cream plate, dark teal text, gold border; frame + label share the same open handler.
5. **Course Launch overlay removed** from the default room — resume lives under Resume Previous Map / My Maps only.
6. **Mobile gallery** uses the same wall registry order and names.

## Verify in UI

1. Open Cartographer's Studio hub (empty of open workspace).
2. Confirm ten parchment labels match the order above (no shared “Course Launch” title).
3. Click each frame and each label → entry/builder title matches.
4. Narrow viewport → mobile “Choose a map” list has the same ten names and routes.
5. Resume a saved map only via chrome Resume Previous Map / My Maps.

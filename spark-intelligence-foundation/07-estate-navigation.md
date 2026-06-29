# Estate Navigation

**How Spark moves users through the homestead, workspaces, and growth estate.**

## Purpose

Specify companion-led navigation across rooms, workspaces, panels, and the growth story estate — one companion surface, many places.

## Responsibilities

- Define room taxonomy: homestead rooms, workspaces, growth estate, founder areas.
- Govern open/close/focus behavior for workspace panels beside chat.
- Encode "Continue Where I Left Off" and calm-home entry logic.
- Coordinate visual focus, peaceful places, and estate workspace framing.
- Map navigation events to intelligence hooks (where user went, why, for how long).
- Keep navigation invisible when conversation alone is enough.

## Rules

- Navigation is secondary to conversation; open rooms when they reduce load.
- Users should feel they are in places, not clicking through app sections.
- Returning users get welcome without judgment; absence is not failure.
- Workspace opens preserve chat context and companion continuity.
- Growth estate rooms share consistent framing (EstateWorkspace pattern) where applicable.
- Founder navigation is role-gated and never leaks into member experience.

## Future Implementation Notes

- Align with `lib/growthNavigation.ts`, `lib/workspaceMode.ts`, `lib/companionLedContinue.ts`, and `CompanionPageClient` routing patterns.
- Document room → section → panel mapping and early-return routing rules.
- Specify transition copy and ambient behavior between rooms.
- Add navigation audit for dead routes and orphaned panels after refactors.

## Status

**Draft**

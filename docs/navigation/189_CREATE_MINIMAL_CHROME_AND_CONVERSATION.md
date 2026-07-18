# 189 — Create Minimal Chrome & Conversation Correction

## Purpose

Simplify Create’s visible chrome and replace reflective/generic conversation with blueprint-driven guided creation.

## Audit findings

| Problem | Source |
|--------|--------|
| Back to Chat, Balanced, Focus on Create | `WorkspaceLayout.tsx` (+ CPC view-size props) |
| How To Use Create | `ContentGeneratorPanel` → `WorkspaceAreaWorksGuide` |
| Audience / Tone | `AudienceSelector` in `ContentGeneratorPanel` |
| Options menu | `CreateOptionsMenu` |
| Empty section editor | `CREATE_WORKSPACE_V2` → `CreateWorkspaceV2Panel` |
| Weak / workspace-language opener | `startFreshCreateFromEstate`, `formatBuilderOpener` |
| No CRCI on Create | Only Talk It Out used `tryConversationRepair` |

## Fixes

1. **Chrome** — `minimalChrome` on `WorkspaceLayout` for Create; back destination **Focus** (`Back to Focus`).
2. **Panel** — `CreateGuidedMinimalPanel` for new creates; legacy V2 only when section/draft content exists.
3. **Conversation** — `createGuidedOpenerForType` + blueprint first question; CRCI on Create builder turns.
4. **Entrance** — How Do I removed; support line matches guided create copy.

## Intelligence stack (Create)

| Layer | Role |
|-------|------|
| Blueprint / discovery questions | Next question (not RCI) |
| CRCI | Repair when confused |
| CI / CQRI | Delivery polish on repair (blueprint questions left intact) |

## Deployment

Do **not** deploy until authenticated smoke scenarios in the package pass.

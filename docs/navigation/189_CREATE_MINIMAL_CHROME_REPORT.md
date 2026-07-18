# 189 — Final report

## Root causes

1. **Excessive top chrome** — `WorkspaceLayout` always rendered view-size + Focus toggles; Create also mounted How To Use, Audience/Tone, Options, and empty V2 section cards.
2. **Poor conversation** — openers used workspace/draft language or “What should it accomplish?”; Create builder did not run CRCI; reflective-style phrasing was not banned for Create.

## Files modified

- `lib/createGuidedConversation189.ts` (+ tests)
- `components/companion/CreateGuidedMinimalPanel.tsx`
- `components/companion/WorkspaceLayout.tsx`
- `components/companion/ContentGeneratorPanel.tsx`
- `components/companion/CreateEstateEntrancePanel.tsx`
- `lib/createBuilderChat.ts` (+ test expectations)
- `lib/builderKickoff.ts`
- `lib/createWorkflow.ts` (Client Onboarding first prompt)
- `lib/createEstate/copy.ts`
- `app/companion/CompanionPageClient.tsx` (scoped)
- CRCI / CI / CQRI experience id `"create"`
- `docs/navigation/189_*`

## Old-format routing

New creations: `shouldShowLegacySectionEditor` false → guided minimal panel, not `CreateWorkspaceV2Panel`.  
Existing drafts with section/draft body: compatibility V2 still available.

## Blueprint sources

`discoveryQuestionsForState` / `facilitationQuestionsForType` via `createGuidedOpenerForType`.

## Production readiness

**Not ready to deploy** until authenticated smoke (package scenarios 1–12) is completed by a human on Preview.

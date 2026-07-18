# Talk It Out (170–172) — Implementation Report

## Verdict

V1 Talk It Out is wired as its own reflective experience (Welcome Home → Take a Moment). Automated tests pass. **Do not deploy production** until authenticated live checklist (`171`) is completed.

## Authenticated preview

- Use the local/preview companion after sign-in.
- Path: Welcome Home → Take a Moment → **Talk It Out**
- Live checklist: `docs/navigation/171_TALK_IT_OUT_LIVE_CHECKLIST.md` (not yet signed off)

## Automated tests

```
npx vitest run lib/talkItOut/talkItOut.test.ts
→ 13 passed
```

Also updated: `lib/estate/welcomeHomeNavigationStructure.test.ts` (Talk It Out in Take a Moment).

## Owners

| Concern | Owner |
|---|---|
| Navigation placement | `lib/estate/welcomeHomeNavigationStructure.ts`, `EstateRoomExperienceMenu.tsx`, `openTalkItOutCore` |
| Session | `lib/talkItOut/sessionStore.ts` |
| Question selection | `lib/talkItOut/reflectiveEngine.ts` |
| Reflection | `lib/talkItOut/reflectiveEngine.ts` |
| Future-feeling | `lib/talkItOut/reflectiveEngine.ts` |
| Explicit-help / routing boundary | `lib/talkItOut/reflectiveEngine.ts` |
| Save / history | `lib/talkItOut/sessionStore.ts` (default: private Talk It Out history) |
| How Do I… | `lib/talkItOut/copy.ts` + panel + `howDoIContent.ts` / `howDoIHelpArticles.ts` |
| UI panel | `components/companion/TalkItOutPanel.tsx` |

## Exact files changed (primary)

- `lib/talkItOut/*` (new)
- `components/companion/TalkItOutPanel.tsx` (new)
- `lib/companionUi.ts` — `AppSection` `"talk-it-out"`
- `lib/estate/estateFullBleedPanelSections.ts`
- `lib/estate/welcomeHomeNavigationStructure.ts` (+ test)
- `components/companion/estate/EstateRoomExperienceMenu.tsx`
- `app/companion/CompanionPageClient.tsx` — open, render, How Do I / coaching hooks
- `lib/estate/estateRoomInvitationCatalog.ts` — Decision Compass invitation renamed
- `lib/howDoIContent.ts`, `lib/howDoIHelpArticles.ts`
- `lib/dailyOpening/helpMeChooseNeeds.ts`, `helpfulLessons/registry.ts`, `resolveHelpfulLesson.ts`
- `lib/estateBrain/capabilityRegistry.ts`, `knowledgeRegistry.ts`, `estateCoachingRegistry.ts`
- `docs/navigation/170_*`, `171_*`, `172_*`, this report

## Remaining limitations

- Reflective engine is deterministic V1 (not a separate LLM client); still one question at a time with tentative reflections.
- Explicit help offers Board / visual / write options in copy only — does not auto-navigate until member chooses (return path to destinations can deepen later).
- Background reuses study/morning asset via Parking Lot shell.
- Authenticated live checklist + screenshots still required.

## Deploy recommendation

**Do not deploy production.** Preview / authenticated verification only.

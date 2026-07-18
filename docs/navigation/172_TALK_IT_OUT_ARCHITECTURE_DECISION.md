# Talk It Out Architecture Decision

## Purpose

Talk It Out is Spark Estate’s reflective-thinking experience.

Shari helps the user think through one situation by:

- listening
- reflecting
- asking one thoughtful question at a time
- helping the user notice what matters

## Placement

Talk It Out is a permanent experience available from:

- Welcome Home → Take a Moment → Talk It Out
- How Do I… / Help Me Choose (mind / decision paths)
- Helpful Lessons (`talk-it-out`)
- Estate coaching prescription “Talk it through together”

It is not buried inside another destination.

## Default Boundary

Shari does not automatically recommend:

- Chamber
- Board
- Visual Thinking
- Journal
- Decision Compass
- other destinations

Additional support is offered only when the user explicitly asks for more help or another perspective.

## Future-Feeling Questions

Shari may sometimes ask how the user imagines they would feel once something is handled, finished, clarified, or decided.

These questions must:

- fit the moment
- vary naturally
- avoid pressure
- avoid assuming a positive outcome
- not appear every time

## Separation

- Talk It Out: reflective conversation
- Clear My Mind: many-thought capture and sorting
- Decision Compass: formal comparison
- Journal Gazebo: private writing
- Evidence Vault: meaningful discoveries
- Boardroom: governance perspectives
- Chamber: specialist expertise
- Visual Thinking: visual exploration

## Implementation owners (V1)

| Concern | Owner |
|---|---|
| Session / pause / save | `lib/talkItOut/sessionStore.ts` |
| Question selection | `lib/talkItOut/reflectiveEngine.ts` + `questions.ts` |
| Reflection | `lib/talkItOut/reflectiveEngine.ts` |
| Future-feeling | `lib/talkItOut/reflectiveEngine.ts` |
| Explicit help / routing boundary | `detectsExplicitHelpRequest` / `buildTalkItOutTurn` |
| Member UI | `components/companion/TalkItOutPanel.tsx` |
| Navigation open | `openTalkItOutCore` in `CompanionPageClient.tsx` |
| Welcome Home placement | `welcomeHomeNavigationStructure.ts` + `EstateRoomExperienceMenu.tsx` |
| How Do I… | `lib/howDoIContent.ts` + `lib/howDoIHelpArticles.ts` + panel How Do I |
| Copy | `lib/talkItOut/copy.ts` |

## Status

- architecture approved
- V1 implementation in companion-app (preview)
- automated tests: `lib/talkItOut/talkItOut.test.ts` (13 passing)
- authenticated verification required (checklist `171`)
- **production not approved — do not deploy**

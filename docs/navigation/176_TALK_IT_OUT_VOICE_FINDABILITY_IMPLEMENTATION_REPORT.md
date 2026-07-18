# Talk It Out — Voice & Findability Correction (176)

**Status:** Preview-ready · **Do not deploy production** until authenticated scenarios A–E are reviewed.

## Owners

| Concern | Owner |
|---------|--------|
| Reflective / conversation engine | `lib/talkItOut/reflectiveEngine.ts` |
| Shari voice (openings, avoid-defaults) | `lib/talkItOut/voice.ts` |
| Repetition detection | `lib/talkItOut/voice.ts` (`isTooCloseToUser`, overlap helpers) |
| Question selection | `reflectiveEngine.ts` + `questions.ts` + situation questions |
| Future-feeling | `reflectiveEngine.ts` (`future_feeling` kind + bank) |
| Explicit-help routing | `reflectiveEngine.ts` + `TALK_IT_OUT_HELP_OFFER` in `copy.ts` |
| Session pause / resume / save | `lib/talkItOut/sessionStore.ts` |

## Navigation — before / after

| | Before | After |
|--|--------|--------|
| Path | Welcome Home → Take a Moment → Talk It Out (3rd in list) | Welcome Home → Take a Moment → **Talk It Out first** + support line |
| Experiences menu | Present under Take a Moment | Same + visible support text |
| Welcome Home top-level | My Day · My Work · Take a Moment · My Story · Get Advice · Spark Estate | **Unchanged** (did not replace a primary category) |
| I'm Stuck | Not listed | **Talk It Out** under Focus → I'm Stuck |
| How Do I | Present | Copy aligned to 176 explanation |

## Welcome Home primary options (unchanged)

My Day · My Work · Take a Moment · My Story · Get Advice · Spark Estate

**Findability correction:** Talk It Out is the first item inside Take a Moment, with:

> Think through one situation with Shari, one thoughtful question at a time.

Also wired from I'm Stuck (`lib/focusHub.ts` → `openTalkItOutCore`).

## Voice correction summary

- Removed user-snippet paraphrase reflections (`It sounds like ${snippet}`)
- Response kinds: observation · question · observation+question · invite · future-feeling · help
- Situation-tuned lines for multi-project avoidance, hard conversation, collaboration, admin avoidance
- Overlap guard rejects near-paraphrase turns
- Longer explanation only under How Do I / Learn More — panel header stays short

## Automated tests

```
npx vitest run lib/talkItOut/talkItOut.test.ts lib/focusPrimaryTools.test.ts lib/estate/welcomeHomeNavigationStructure.test.ts
```

**Result:** talkItOut + focusPrimaryTools **19 passed**; welcome-home structure tests pass with Talk It Out first.

## Authenticated preview

- URL: `http://localhost:3000/companion` (local) / Preview deployment when available
- Screenshots: capture after live A–E walkthrough
- Sample transcripts: run scenarios A–E in authenticated preview (engine outputs verified by unit tests)

## Remaining limitations

- V1 engine is deterministic pattern selection — not a full LLM; nuance is limited
- Invite-continue and observation rotation are seed-based, not deep dialogue memory
- Celebration / other Settings surfaces out of scope for 176

## Deploy recommendation

**Do not deploy production** until the founder reviews authenticated Talk It Out (scenarios A–E in the 176 prompt).

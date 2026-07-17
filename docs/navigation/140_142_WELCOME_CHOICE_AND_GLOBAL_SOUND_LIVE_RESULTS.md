# 140–142 — Welcome Choice + Global Sound (Live Results)

**Status:** `unit_verified` · authenticated preview **Pending**  
**Do not deploy production** until `141_WELCOME_CHOICES_AND_GLOBAL_SOUND_LIVE_CHECKLIST.md` passes.

**Preview:** _(filled after deploy)_  
**Commits:** _(filled after push)_

## Root cause — Choice 1 → Plan My Day

`resolveDailyOpeningChoiceAction("continue-meaningful-work")` resumed unfinished work when present, otherwise navigated to `plan-my-day`. That made Choice 1 overlap Choice 2.

## What shipped

- Choice 1 → Meaningful Start (one recommendation; never Plan My Day; never resume)
- Choice 2 → Plan or Adapt My Day (unchanged)
- Choice 3 → Help Me Choose (unchanged)
- Persistent global Sound Off in `EstateTopRightChrome` → `stopAllAudio({ silenceEstate: true })`

## Owners

| Concern | Owner |
|---------|--------|
| Choice definitions / copy | `buildDailyOpeningChoiceCards.ts` |
| Choice routing | `resolveDailyOpeningChoiceAction` |
| Meaningful Start state / UI | CPC + `TodaysWelcomeCard` mode `meaningful-start` |
| Recommendation logic | `lib/dailyOpening/meaningfulStart.ts` |
| Plan My Day route | Choice 2 / Plan More of My Day action |
| Help Me Choose route | `show-help-me-choose` |
| Global audio UI | `GlobalSoundControl` |
| Mute / volume persistence | `estateAudioSettings.ts` |
| stopAllAudio | `lib/estate/stopAllAudio.ts` |
| Shari visible response | `shariCueForMeaningfulStart` → chat on Start This |

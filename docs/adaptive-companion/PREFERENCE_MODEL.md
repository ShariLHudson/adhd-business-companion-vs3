# Adaptive Companion — Preference Model

## Explicit Adaptive Companion prefs (new, narrow)

Stored at `spark:adaptive-companion-prefs:v1`. Only dimensions not already owned elsewhere.

| Field | Values | Notes |
|-------|--------|-------|
| `summaryFirst` | boolean | Main idea before detail |
| `paragraphLength` | `short` \| `standard` | |
| `instructionPacing` | `one_at_a_time` \| `overview_ok` | May also derive from Support Style step-by-step |
| `choiceLoad` | `one` \| `two` \| `three` \| `ask` | Prefer Support Style `choiceCount` when set |
| `examplePreference` | `prefer` \| `neutral` \| `minimize` | |
| `resumeSummaryPreference` | `brief` \| `standard` \| `detailed` | |
| `comparisonStyle` | `side_by_side` \| `one_criterion` \| `plain_tradeoffs` | |
| `structureLevel` | `minimal` \| `balanced` \| `visible` | |
| `showProgressPreference` | boolean | |
| `plainLanguagePreference` | boolean | Defaults true; global plain-language formatting still applies |

## Mapped from existing systems (not duplicated)

| Concern | Source |
|---------|--------|
| `reducedMotion` | Experience Controls `reduceMotion` |
| `sensoryLoad` | Experience Controls `backgroundMode` (`focus` → reduced) |
| `textSize` | Experience Controls `textSize` |
| `audioPreference` | Experience Controls `shariVoiceEnabled` (listen affordance readiness) |
| Choice count (when Adaptive choiceLoad unset) | Support Style custom `choiceCount` |
| One-step pacing signal | Support Style `step-by-step` |
| Example signal | Support Style stuckHelp includes `show-example` |

## Forbidden

- Diagnosis fields  
- Hidden accommodation scores  
- Per-destination duplicate preference bags for Strategy / Create / Board / Chamber  

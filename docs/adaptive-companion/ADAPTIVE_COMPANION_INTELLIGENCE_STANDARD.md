# Adaptive Companion Intelligence™ — Standard

**Runtime:** `lib/adaptiveCompanionIntelligence/`  
**Related (do not replace):** `lib/supportStyle/`, `lib/estate/experienceControlPrefs.ts`, `lib/adaptive-companion/`, Estate Adaptive Intelligence

## Mission

Spark Estate changes doorway, pacing, density, and support according to how the individual works best — without diagnosing, labeling, or reducing intelligence.

## What this layer is

- Platform-wide **presentation and support** contract
- Shared preference resolution (explicit + existing accessibility / Support Style)
- Session and conversational overrides with consent
- First complete consumer: **Strategy Chamber**

## What this layer is not

- A Strategy-only feature
- A diagnosis-specific mode
- A medical assessment
- A hidden neurodivergence score
- A duplicate of Experience Controls or Support Style
- A second intelligence engine that replaces reasoning quality

## Core rules

1. Explicit preferences first in this phase — no silent permanent inference.
2. Presentation adapts; underlying reasoning quality does not shrink.
3. Progressive disclosure: essential → decision → detail → deeper on request.
4. Direct user requests override stored presentation for that response.
5. Permanent changes require clear approval.
6. Preferences describe what helps — they never define the person.
7. Reuse existing settings when they already represent the same concern.

## Preference sources (canonical merge order)

1. Platform defaults  
2. Experience Controls (motion, text size, background soften/focus)  
3. Support Style (choice count, step-by-step, examples)  
4. Explicit Adaptive Companion prefs (`spark:adaptive-companion-prefs:v1`)  
5. Session overrides  
6. Conversational override for the current turn (highest for that turn)

## Destinations still on fixed presentation

Documented in [ADOPTION_AND_CERTIFICATION_PLAN.md](./ADOPTION_AND_CERTIFICATION_PLAN.md). Do not claim platform-wide retrofit until certified per destination.

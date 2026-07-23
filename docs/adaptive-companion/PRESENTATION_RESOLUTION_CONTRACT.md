# Presentation Resolution Contract

## Resolver

`resolveAdaptivePresentation(input?: ResolveAdaptivePresentationInput): AdaptivePresentationResolved`

### Inputs

- Optional session override  
- Optional conversational user text (turn override)  
- Optional destination hint (`strategy_chamber`, …)

### Outputs (resolved presentation)

| Field | Purpose |
|-------|---------|
| `summaryFirst` | Lead with essential idea |
| `maxVisibleChoices` | 1–3 (or ask) |
| `showMoreOptionsControl` | When choices are truncated |
| `oneQuestionAtATime` | Guided pacing |
| `shortParagraphs` | Density |
| `preferExamples` | Include a concrete example when helpful |
| `resumeDepth` | brief / standard / detailed |
| `reduceMotion` | Motion respect |
| `sensorySoftened` | Lower visual stimulation |
| `comparisonStyle` | How options are compared |
| `structureLevel` | Visible structure |
| `showProgress` | Progress affordance |
| `fullDetailAvailable` | Always true — intelligence never removed |
| `sources` | Which layers contributed (for trust / debug, not member UI) |

## Handoff context

Pass `AdaptivePresentationContext` (compact):

- `summaryFirst`, `maxVisibleChoices`, `oneQuestionAtATime`, `shortParagraphs`, `resumeDepth`, `reduceMotion`

Do **not** copy the full preference profile into every destination record.

## Strategy Chamber integration points

- Opening choice load (primary cards stay 3; option lists respect max)  
- Guided journey question pacing  
- Resume summary depth  
- Decision Record progressive disclosure  
- Continue Your Journey secondary option count  

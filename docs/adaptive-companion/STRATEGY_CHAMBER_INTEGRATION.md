# Strategy Chamber — Adaptive Integration

## Preferences currently honored

| Preference / signal | Where |
|---------------------|--------|
| `summaryFirst` | Decision Record expand defaults; guided “why it matters” optional |
| `instructionPacing` / one-question | Guided journey copy |
| `choiceLoad` / max choices | Continue Your Journey secondary cap |
| `examplePreference` | Guided example hints |
| `resumeSummaryPreference` | Home resume + in-journey resume summary |
| `showProgressPreference` | Stage progress label |
| `reduceMotion` / sensory / text size | Resolved (Experience Controls); UI consumers may read context |

## Resolver call sites

- `StrategiesPanel` chamber-entry view  
- `StrategiesPanel` home resume banner  
- `executeApprovedStrategyHandoff` → compact `presentationContext` on pending handoff  

## Still fixed (intentional)

- Catalog browse / ADHD apply / guided create library paths  
- Primary opening always shows three entry cards (product rule)  

## Deferred

- Observation → permanent preference suggestions  
- Audio listen controls in Strategy UI  
- Full voice parity certification  
- Retrofit of every destination  

## Overrides

- Conversational: “give me the full detail”, “fewer choices”, etc. via `detectAdaptiveConversationalOverride`  
- Session: `setAdaptiveSessionOverride` (not permanent)  
- Permanent: `patchAdaptiveCompanionExplicitPrefs` only with explicit user control (Settings wiring deferred)  

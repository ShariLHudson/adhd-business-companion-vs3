# Spark Estate™ Development Notes

# Breathe™ Full-Screen Experience

## Problem

When Breathe™ is opened from another room (Evidence Vault, Hall of Accomplishments, etc.), both interfaces appear at the same time. The room remains visible underneath the breathing experience.

This is incorrect.

---

## Desired Experience

Breathe™ should temporarily replace the current room.

### Sequence

1. User selects **Breathe**.
2. Fade the current room out (250–400 ms).
3. Crossfade directly into the dedicated Breathe environment.
4. Display only the Breathe scene and breathing animation.
5. Hide all room UI while Breathe is active.
6. When finished, fade back to the exact room the user came from.

---

## Do NOT display while Breathe is active

- Evidence Vault
- Hall of Accomplishments
- Cartographer's Studio
- Any room panel
- Chat overlay
- Room controls

The Breathe scene owns the entire screen.

---

## Return Behavior

Return to the exact previous room with:

- Scroll position
- Chat state
- Unsaved work
- Workflow

fully restored.

Examples:

Evidence Vault → Breathe → Evidence Vault

Cartographer's Studio → Breathe → Cartographer's Studio

Welcome Home → Breathe → Welcome Home

---

## Visual

Use the dedicated Breathe artwork (courtyard with glowing breathing circle).

Do NOT use the previous room background underneath.

---

## Technical

Treat Breathe as a temporary destination/state.

The previous room remains mounted in memory but hidden.

---

## Transition

Room

↓

Fade (250–400 ms)

↓

Breathe Scene

↓

Breathing Exercise

↓

Fade (250–400 ms)

↓

Return to Previous Room

No flashes.

No blue/gray transition screens.

No overlapping UI.

---

## Implementation (companion-app)

| Concern | Location |
|---------|----------|
| Destination state + phases | `lib/breatheDestination.ts` |
| Open / close lifecycle | `CompanionPageClient.tsx` (`openBreatheOverlayCore`, `closeBreatheOverlayCore`) |
| Hide room + crossfade CSS | `app/companion/breathe-destination.css` |
| Body portal host | `components/companion/BreatheDestinationHost.tsx` (above Welcome Home `z-index`) |
| Breathing UI + courtyard scene | `components/companion/BreathePanel.tsx` |
| Universal Access phrases | `lib/universalAccess/breatheUniversalAccess.ts` |
| Fade duration | `BREATHE_DESTINATION_FADE_MS` = 320 ms |

Root attributes while active: `data-breathe-destination`, `data-breathe-destination-phase` (`entering` \| `active` \| `exiting`).

---

# Future Standard

All immersive wellness experiences should behave exactly like Breathe.

Examples:

- Guided Meditation
- Visualization
- Sleep Experiences
- Relaxation Journeys
- Immersive Audio Experiences

Each should temporarily replace the current room and return the member exactly where they left off.

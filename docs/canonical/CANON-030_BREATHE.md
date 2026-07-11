# CANON-030 — Breathe™

Universal Access wellness destination. Not a room — a full-screen pause that replaces whatever you were doing and returns you there when finished.

**Technical spec:** [BREATHE_FULL_SCREEN_EXPERIENCE.md](../protocols/BREATHE_FULL_SCREEN_EXPERIENCE.md)

---

## Purpose

Give members a calm, guided breathing exercise without leaving the Estate or losing their place.

## Why it exists

Overwhelm, stress, and ADHD friction often need a **body reset** before thinking or working again. Breathe™ is the fastest path from “I need a minute” to a real breathing session — from anywhere in Spark Estate™.

## When to use it

- Feeling overwhelmed or scattered
- Before a hard conversation or decision
- Between estate rooms when you need to reset
- When Spark or you suggest a breathing pause
- Any time you want two calm minutes with the glowing breath circle

## How to access it

- **Chat:** “Help me breathe,” “I need a minute,” “box breathing,” “open Breathe,” etc.
- **Estate room menu:** Breathe option (from any immersive room)
- **Peaceful Places / Focus paths** that route to Breathe
- **Universal Access** capability routing (`breathe`)

Breathe is **not** a navigable room section. Opening it never changes your underlying room or section.

## Workflow

1. Member triggers Breathe from any room or chat.
2. Current room fades out (320 ms).
3. Dedicated Breathe courtyard appears full screen with pattern recommendation.
4. Member starts session (Relaxing, Box, 4-7-8, Equal) — optional sound.
5. Session completes or member ends early.
6. Member chooses **Resume previous activity**, **Continue Chat**, **Journal**, or **Another session**.
7. Breathe fades out; prior room returns with scroll, chat, and unsaved work intact.

## Spark introduction

> “Let’s take a breath together. I’ll keep your place — when you’re ready, we’ll pick up right where you left off.”

On explicit breathe requests, Spark opens Breathe immediately without routing to Create, Project Builder, or other work surfaces.

## Related rooms

Breathe is available **from** every estate room but does not belong to one:

- Evidence Vault™
- Hall of Accomplishments™
- Cartographer's Studio™
- Welcome Home
- Peaceful Places™ (related audio/wellness family)
- Focus / Sunroom paths

Registry note: Peaceful Places shares woodland pathway artwork in the estate catalog; Breathe uses its own immersive courtyard scene via `SceneRenderer` (`workspaceId: "breathe"`).

## FAQ

**Will I lose my work in the Evidence Vault?**  
No. The room stays mounted in memory, hidden. Resume returns to the same discovery file state.

**Why doesn’t chat show during breathing?**  
The Breathe scene owns the full screen. Chat and room chrome are hidden until you return.

**Can I open Breathe from Cartographer’s Studio?**  
Yes. Studio → Breathe → Studio, with your visual focus session preserved.

## Tips

- Box breathing and 4-7-8 are available from chat if you name them.
- Soft rain, birds, water, fireplace, or Spark Music™ can play during the session.
- End early anytime; you still get completion options.

## Future enhancements

- Apply the same destination pattern to Guided Meditation, Visualization, Sleep, and Relaxation Journeys (see protocol Future Standard).
- Dedicated static courtyard plate URL in environment registry (today: constitutional scene pick with `seed: "breathe"`).
- Spark pattern suggestions based on recent estate activity.

# Quiet Moments™
## Designing Everything That Happens Between Conversations

**Version:** 1.0  
**Status:** Canonical — governs silence, idle time, and ambient life  
**Code:** `lib/quietMoments/`  
**Sibling:** [WISDOM_OF_RESTRAINT.md](./WISDOM_OF_RESTRAINT.md) · [Companion Communication Anchor™](../../lib/companionCommunicationAnchor/)

---

## Mission

Design every quiet moment inside the Companion.

Not features. Not interactions. **Everything that happens naturally while nothing is happening.**

---

## Core Principle

The user should never feel:

> "The app is waiting for me."

They should feel:

> "I'm sitting in a peaceful place, and conversation can begin whenever I'm ready."

---

## Quiet Is Not Empty

When no one is typing, the Homestead is still alive.

| Moment | Motion |
|--------|--------|
| Morning sunlight slowly brightens | `sunlight` |
| Steam rises from the coffee mug | `steam` |
| Curtain moves in the breeze | `curtains` |
| Bird lands at the feeder | `cardinal` / `birds` |
| Kinsey stretches to a sunny spot | scene posture |
| Aquarium bubbles quietly | reading nook peace |
| Journal page shifts in the breeze | `curtains` |
| Clock quietly marks the hour | `lamplight` (future audio) |

Nothing asks for attention. Everything simply exists.

Full catalog: `QUIET_AMBIENT_MOMENTS` in `lib/quietMoments/catalog.ts`

---

## Phases

| Phase | When | Behavior |
|-------|------|----------|
| **active** | User typing or assistant streaming | Full anchor, conversation mode |
| **settling** | 0–15s idle | Room breathes, anchor goes quiet |
| **quiet** | 15s–5min idle | Temporal drift, ambient motion, no idle content |
| **deep-quiet** | 5min+ idle | Same welcome on return — no guilt |

```ts
import { evaluateQuietMoments } from "@/lib/quietMoments";

const quiet = evaluateQuietMoments({ idleMs: 120_000 });
// quiet.anchorMode === "quiet"
// quiet.suppressIdleEntertainment === true
```

---

## Communication Anchor

Always reachable. Never demanding.

- No flash · No pulse · No "Type here" · No placeholder rotation · No auto-focus during quiet

The anchor waits patiently — like sitting across from a friend.

`CommunicationAnchorMode: "quiet"` during settling, quiet, and deep-quiet phases.

---

## ADHD Rule

**Never punish stillness.**

Many ADHD users think before speaking, walk away, get interrupted, lose their train of thought, return twenty minutes later.

The Companion welcomes every return exactly the same.

Forbidden forever:

- "Are you still there?"
- "Haven't heard from you"
- "Where did you go?"
- Countdowns · Session timeout guilt · "Why haven't you…"

Enforced in `lib/quietMoments/forbiddenIdle.ts` and Wisdom of Restraint™.

---

## Natural Time

As minutes pass, tiny changes may occur — almost imagined:

- Light shifts slightly warmer
- Coffee steam becomes gentler
- Birds come and go
- Clouds drift

Nothing dramatic. `temporalDrift` on `QuietMomentsIntelligence`.

---

## Shari's Presence

Shari doesn't stare at the user. She isn't frozen.

During quiet she may be: **reading · writing · looking out the window · crafting · with Kinsey · relaxed**

She looks up naturally when conversation begins. Always comfortable in her own home.

`shariPosture` resolved per room and idle duration.

---

## No Idle Entertainment

Never fill quiet with activity.

Forbidden during silence:

- Quotes · Tips · Rotating facts · Productivity reminders · Motivational messages

The Companion **trusts silence**.

---

## Environmental Audio (Future)

Optional only: birds, breeze, aquarium bubbles, soft clock, rain, crackling fire.

No loops that call attention to themselves. `ambientAudioEligible` when phase allows.

---

## The Five-Minute Test

A user opens the Living Room and says nothing for five minutes.

Would they feel **awkward** — or enjoy simply being there?

If awkward → redesign the room.

`fiveMinuteTestPassed` on `QuietMomentsIntelligence`.

---

## Success Test

A user opens the Companion. They sip their coffee for a few minutes without typing.

When they're ready, they begin talking.

The Companion never rushed them. Never demanded attention. Simply shared the space.

**That is Quiet Moments™.**

---

## Integration

```ts
// Client passes idle state into environment evaluation
evaluateCompanionEnvironmentIntelligence({
  ...roomInput,
  quietMoments: { idleMs: 180_000, isUserTyping: false },
});
// → environment.quietMoments + merged ambient motion
```

Stack:

```
Quiet Moments™ → ambient motion + anchor mode + forbidden idle copy
Living Motion Library™ → irregular natural movement
Wisdom of Restraint™ → nothing spoken unless caring
Communication Anchor™ → always reachable, never loud
```

---

## Document Hierarchy

```
Manifesto
  → Quiet Moments™ (this document)
    → Living Motion Library™
    → Wisdom of Restraint™
    → Companion Communication Anchor™
```

Tests: `npx vitest run lib/quietMoments`

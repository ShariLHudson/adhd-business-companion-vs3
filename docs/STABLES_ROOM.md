# The Stables™ — Room Experience

**Route:** `stables` · **Background:** `/backgrounds/spark-estate-stables-background.png`  
**Registry:** `lib/estate/estateRoomRegistry.ts` · **Runtime:** `lib/stables/`

---

## Identity

The Stables™ are **not about horses**. The horse is metaphor.

This room develops qualities great entrepreneurs share:

Leadership · Trust · Confidence · Calm under pressure · Communication · Presence · Partnership · Consistency · Patience · Courage · Emotional regulation

Members should feel: **safe · grounded · calm · present · confident · capable**

There is **no rush here** — slower and warmer than Momentum Institute™.

---

## Learning style

Unlike the Institute, Stables teach through:

- Stories and analogies
- Reflection and guided conversation
- Small confidence challenges
- Real-world implementation

Very little lecture. Shari coaches — she does not instruct.

**Voice examples:**

- "Confidence isn't something we wait for. It's something we build."
- "Trust grows one small step at a time."

---

## Primary experiences (V1 placeholders)

| Experience | Purpose |
|------------|---------|
| Leadership Lessons™ | Steady direction without force |
| Confidence Conversations™ | Doubt, pricing, visibility, self-trust |
| Trust Challenges™ | Small safe experiments |
| Business Analogies™ | Stable wisdom in business terms |
| Reflection Moments™ | Unhurried pauses |
| Presence Practice™ | Networking, speaking, showing up |
| Courage Builder™ | Fear without shame — one brave step |
| Calm Under Pressure™ | Breath and pace when stakes are high |

Defined in `lib/stables/stablesExperiences.ts`.

---

## Interactive objects (architecture only)

Future hooks in `lib/stables/stablesInteractiveObjects.ts`:

Brass horseshoe · Saddle · Leather journal · Grooming brush · Stable gate · Riding arena

Content not implemented — hotspots ship with room art.

---

## When Shari recommends

Signals in `lib/stables/stablesRecommendations.ts` — nervous, lack confidence, afraid to raise prices, avoiding networking, afraid of speaking, don't trust myself, second guessing, afraid of rejection.

Invitation: *"I'd like to take us somewhere that might help. Let's spend a few minutes at the Stables™."*

---

## Save paths

Reflections may save (permission first) to:

Journal™ · My Institute Cabinet™ · Evidence Vault™ · Growth Profile™

See `lib/stables/stablesSavePaths.ts`.

---

## Related rooms

Momentum Institute™ · Decision Compass™ · Creative Studio™ · Journal™ · Evidence Vault™ · Growth Profile™

---

## UI

- `components/companion/stables/StablesRoomPanel.tsx` — shell + experience rail + frosted chat
- `app/companion/stables-room.css` — experience layer only; **room plate unchanged**

---

## Chat hints

`stablesRoomHintForChat()` — mandatory slower reflective tone while in-room.  
Experience turns via `stablesDiscussTurn()` → `stablesLearningHintRef` in `CompanionPageClient`.

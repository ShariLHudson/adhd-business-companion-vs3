# Presence Intelligence™
## Companion Homestead™ — Prepared, Not Customized

**Version:** 1.0  
**Status:** Canonical design authority — governs preparation, posture, and every sign of care before words  
**Authority:** Subordinate to Product Constitution™ · Companion Constitution™ · [`EXPERIENCE_OF_SHARI.md`](../EXPERIENCE_OF_SHARI.md) · [`COMPANION_HOMESTEAD_MANIFESTO.md`](../COMPANION_HOMESTEAD_MANIFESTO.md)  
**Sibling documents:** [`EMOTIONAL_EXPERIENCE_BLUEPRINT.md`](./EMOTIONAL_EXPERIENCE_BLUEPRINT.md) · [`JOURNEY_BETWEEN_ROOMS.md`](./JOURNEY_BETWEEN_ROOMS.md) · [`WISDOM_OF_RESTRAINT.md`](./WISDOM_OF_RESTRAINT.md) · [`Shari Voice Bible™`](../../lib/shariVoiceBible/CONSTITUTION.md)  
**Implementation:** [`lib/presenceIntelligence/`](../../lib/presenceIntelligence/)

**This is not:**
- Recommendation intelligence
- Memory display
- Personalization theater

**This is:** quiet hospitality — the home prepared before the guest arrives, so they think *"Shari thought about me,"* not *"the app remembered me."*

---

## The governing distinction

| Wrong frame | Right frame |
|-------------|-------------|
| Customized | **Prepared** |
| "I remembered you…" | The mug is already on the table |
| "Based on your activity…" | "How did that turn out?" |
| "You seem stressed." | "How are you doing today?" |
| Feature intelligence | **Presence** |

---

## The mission

Build **Presence Intelligence™** — not recommendation intelligence, not memory, not personalization.

The user should never think: *"The app remembered me."*  
They should think: *"Shari thought about me."*

That is the emotional moat no competitor copies easily. It is not built with algorithms. It is built with **hospitality**.

---

## Presence is preparation

Before the guest arrives, the Companion quietly prepares the home.

| Signal (internal) | What the guest discovers |
|-------------------|--------------------------|
| Morning person, bright visit | Coffee in the Spark mug |
| Night person, evening visit | Tea instead |
| Recovery / difficult day | Blanket folded nearby; room feels quieter |
| Recent win | Hopeful light; flowers may appear |
| Steady visit | Notebook open; chair angled toward window |

**No announcements. No explanations.** Just preparation.

Spoken `guestPreparation.line` is always **`null`** in production. Care is visible in objects, light, and atmosphere — never narrated.

---

## Presence never shows off memory

### Banned in all companion voice (enforced in `lib/presenceIntelligence/rules.ts`)

- "I remembered…"
- "I tracked…"
- "I noticed…"
- "I've been monitoring…"
- "Based on your…"
- "Your previous activity…"
- "You seem…" / "You sound…"
- "I prepared this especially for you."
- "I thought you might like…"
- "You said yesterday…" / "You mentioned…"

The guest should feel **cared for**, not **analyzed**.

---

## Tiny signs of care

Presence lives in tiny details the guest **discovers**:

- The mug is already on the table
- A notebook is open
- A favorite chair is angled toward the window
- Fresh flowers appear
- A blanket is folded nearby

The room quietly says: **"I was expecting you."**

These map to `PresencePreparation` in code — environmental flags, not copy.

---

## Questions should feel earned

Don't ask because the system has data. Ask because a caring person naturally would.

| Bad (data-driven) | Good (earned) |
|-------------------|---------------|
| "How is your launch progressing?" | "I've been wondering how things have been going." |
| "You said yesterday…" | "Did things work out the way you hoped?" |
| "Last time you were sitting with {topic}…" | "How did that turn out?" |

Earned questions live in the Voice Bible under tag `presence_wonder`. Topic-named follow-ups (`topic_followup`) are legacy fallback only.

---

## Presence is sometimes silence

Sometimes the best preparation is simply:

- The room
- The light
- A smile
- No question
- No task
- No recommendation

The user begins the conversation.

`PresencePosture.preferSilence` — kin relationship, some visits — greeting only. Valid hospitality.

---

## Relationship deepens quietly

| Stage | Presence posture |
|-------|------------------|
| Early | Warm welcomes; gentle questions |
| Trusted | Fewer words; more familiarity |
| Kin / long-term | Sometimes just "Morning." — room speaks first |

Never perform caring. No theatrical preparation announcements.

---

## ADHD principle

People with ADHD often feel misunderstood, judged, too much, behind.

Presence Intelligence quietly communicates: **"You don't have to earn your place here."**

Nothing in the home should require performance.

---

## Design review (every room)

For every room, ask:

1. **How does this room quietly communicate care?**
2. **What preparation happened before the guest arrived?**
3. **What would a close friend naturally do without mentioning it?**

If the answer is "show analytics" or "mention memory," **redesign it**.

---

## Phase 1 room preparation notes

| Room | Quiet preparation |
|------|-------------------|
| **Living Room** | Drink, blanket, light, earned wonder question or silence |
| **Window Seat / Clear My Mind** | Quieter motion; fewer objects; no forced prompt |
| **Planning Table** | Notebook open; clear surface — not "let's plan" |
| **Reading Nook** | Book already chosen; lamp on |
| **Creative Studio** | Tools within reach; hopeful light after wins |

Full emotional arcs: [`EMOTIONAL_EXPERIENCE_BLUEPRINT.md`](./EMOTIONAL_EXPERIENCE_BLUEPRINT.md).

---

## Success test (three years)

Ask: *"What makes it different?"*

| Wrong answer | Right answer |
|--------------|--------------|
| "It remembers everything." | **"It always feels like Shari was expecting me."** |

---

## Architecture map

| Concern | Location |
|---------|----------|
| Preparation signals | `lib/presenceIntelligence/resolvePreparation.ts` |
| Conversation posture | `lib/presenceIntelligence/resolvePosture.ts` |
| Banned narration | `lib/presenceIntelligence/rules.ts` |
| Guest prep bridge (silent) | `lib/presenceIntelligence/mapToGuestPreparation.ts` |
| Living Room integration | `evaluateWelcomePresenceIntelligence` → greeting + `presence` |
| Earned questions | `lib/shariVoiceBible/entries/presenceWonder.ts` |
| Visible objects | `companionEnvironmentIntelligence/resolveRoom.ts` |

---

## Approval gate

No room ships Presence-facing copy or preparation narration without passing:

- [ ] No banned patterns in spoken lines
- [ ] `guestPreparation.line` is null in normal UX
- [ ] Prior-thread questions use `presence_wonder`, not topic citation
- [ ] Design review checklist completed for the room
- [ ] Shari Test™: would a friend do this without explaining?

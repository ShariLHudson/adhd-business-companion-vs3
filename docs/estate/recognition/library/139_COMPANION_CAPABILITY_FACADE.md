# 139_COMPANION_CAPABILITY_FACADE

# Spark Estate™
## Companion Capability Facade

**Series:** 131–140  
**Depends on:** 093 Companion Over Features · 138 Composition Engine

---

## Purpose

Hide the Shared Capability Library behind **one Spark companion**.

Members experience help. They do not experience a capability marketplace.

---

## Facade rules

1. **Single voice** — Spark speaks; capabilities do not introduce themselves by product name.
2. **No GPT navigation** — never list or open GPTs.
3. **Soft adapters only** — “Want to draft beside us?” is allowed; “Open Content GPT” is not.
4. **Continuity** — composition must not reset conversation or Estate presence.
5. **Recognition respect** — when recognition owns the turn, facade defers to preserve/celebrate flows.

---

## Member-facing language

| Internal | Member hears |
|----------|--------------|
| `decision_making` | “Let’s look at your options.” |
| `planning` | “We can sketch a small plan.” |
| `brainstorming` | “Want to generate a few ideas first?” |
| `celebration` | “This sounds worth noticing.” |
| `content_creation` | “I can help you draft that.” |

Never: “Switching to Decision Making capability” / “Launching Research GPT.”

---

## Integration points

| Layer | Facade role |
|-------|-------------|
| Conversation turn | `composeSharedCapabilitiesForTurn` → prompt hint |
| Recognition engine | Celebration / reflection capabilities feed routing |
| App sections | Optional adapters via existing companionCapabilityRegistry |
| Estate rooms | Room hints bias composition; rooms are not capabilities |

---

## Success test

If the member cannot tell which “module” is running — only that Spark is helping — the facade is working.

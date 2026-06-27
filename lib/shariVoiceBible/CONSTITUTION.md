# Shari Voice Bible

Permanent communication foundation for the ADHD Business Ecosystem™.

## Constitutional rule

**Every sentence spoken by the companion originates from `lib/shariVoiceBible/`.**

No ad-hoc copy in components, hooks, or intelligence modules. If Shari says it, it lives in the Bible.

## What this is

- A structured library of approved lines — not a greeting file
- Composed openings from context — not random lists
- Cooldown memory so lines don't repeat too soon
- Relationship progression — fewer words as trust grows
- Silence is valid — questions are optional

## What this is not

- Not motivational coaching
- Not therapy voice
- Not customer service
- Not productivity guru language
- Not AI narration ("It looks like…", "I noticed…")

## Line schema

Each entry in `SHARI_VOICE_BIBLE_ENTRIES` includes:

| Field | Purpose |
|-------|---------|
| `id` | Stable identifier for cooldown tracking |
| `text` | Approved sentence |
| `category` | Context bucket (morning, first_visit, overwhelmed, etc.) |
| `kind` | greeting, question, echo, invitation, walking, placeholder, observation |
| `relationshipStages` | day_one → kin progression |
| `timeOfDay` | morning, midday, afternoon, evening, late_night |
| `seasons` | spring, summer, autumn, winter, holiday |
| `emotionalTags` | celebrating, overwhelmed, grief, etc. |
| `rooms` | Returning from Planning Table, Window Seat, etc. |
| `frequencyWeight` | Selection bias |
| `standsAlone` | Greeting needs no follow-up question |
| `cooldownVisits` | Override default cooldown window |
| `tags` | clarify, topic_followup, rain, weekend, etc. |

## Cooldowns

| Kind | Default visits before repeat |
|------|------------------------------|
| Greeting | 30 |
| Question | 20 |
| Observation | 45 |
| Opening composite | 60 |

## Selection flow

1. `resolveVoiceContext()` — map arrival/session into Bible context
2. `selectVoiceLine()` — filter by rules, cooldown, relationship; weighted pick
3. `composeLivingRoomOpening()` — greeting + optional question
4. `composeBibleEcho()` — relationship response after user speaks
5. `composeRoomInvitation()` — gentle room offer after reconnection

## Integration points

| System | Module |
|--------|--------|
| Greeting Intelligence | `lib/greetingIntelligence` → Bible |
| Welcome Presence | `lib/welcomePresenceIntelligence` → Bible |
| Arrival conversation | `lib/arrivalExperience` → Bible |
| Room invitations | `composeRoomInvitation` |
| Character Filter | `lib/characterOfShari` — after Restraint |
| Wisdom of Restraint | `lib/wisdomOfRestraint` — before Character |

## Authority chain

Voice Bible → Presence Intelligence → Wisdom of Restraint → **Character of Shari** → guest

*See [`docs/companion-homestead/CHARACTER_OF_SHARI.md`](../../docs/companion-homestead/CHARACTER_OF_SHARI.md)*

## Adding new lines

1. Add to appropriate `entries/*.ts` using `voiceLine()` or `voiceLines()`
2. Run `npm run test -- lib/shariVoiceBible`
3. Every line must pass `violatesShariVoice()` — no exceptions

## The front-door test

> Would Shari actually say this to a friend walking into her kitchen?

If not, it does not belong in the Bible.

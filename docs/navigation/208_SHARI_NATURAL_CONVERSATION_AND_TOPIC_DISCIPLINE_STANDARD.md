# 208 — Shari Natural Conversation & Topic Discipline Standard

**Source:** `Downloads/208_SHARI_NATURAL_CONVERSATION_AND_TOPIC_DISCIPLINE_STANDARD.md`  
**Status:** Implemented in runtime (not docs-only)  
**Production deployed:** No — authenticated quality confirmation still required

---

## Purpose

Correct remaining failures where Talk It Out sounds like generic AI and where conversation loses the user's actual topic.

Every response must satisfy both:

1. **Conversation Quality** (sounds like Shari)
2. **Topic Fidelity** (keeps the Topic Anchor)

---

## Runtime module

`lib/shariNaturalConversation/`

| File | Role |
|------|------|
| `genericTemplateBan.ts` | Rule 3 — ban coaching shells |
| `topicDiscipline.ts` | Rule 1–2 — background ≠ topic; corrections restore |
| `naturalVoice.ts` | Natural topic returns (no "Let's stay with…") |
| `certify.ts` | Pre-send quality + fidelity gate |
| `package208.test.ts` | Required hire/marketing regression |

---

## Rules wired

| Rule | Implementation |
|------|----------------|
| 1 Never replace topic with background | `isBackgroundElaboration` + `updateTopicAnchor` |
| 2 Corrections win immediately | Expanded `detectsDirectCorrection` + subject rejection restore |
| 3 Ban generic templates | CIE `SCRIPTED_LANGUAGE` + TIO delivery scrub |
| 4 Respond like Shari | `buildNaturalTopicReturn` replaces shell fallbacks |
| 5 Observations before questions | Existing CQRI / grounded path (unchanged contract) |
| 6 Human language test | `failsHumanLanguageTest` / `certifyNaturalConversation` |
| 7 Variety | Existing CQRI move rotation |
| 8 Topic validation | CIE + TCAI + `TOPIC_FIDELITY` → `TOPIC_DRIFT` |

---

## Banned default shells

- "Let's stay with…"
- "What part feels most useful…"
- Empty "What part feels hardest…" shells
- "Tell me more."
- "What matters most?"
- "Take your time."
- "There may be something underneath." / quieter-question variants

---

## Required regression

User:

1. "If I should hire a marketing assistant."
2. "I am designing a new ADHD business platform and need people to know about it."
3. "It has nothing to do with designing but marketing the app."

Expected: stay on marketing help; never return to platform design as the topic.

---

## Do not deploy

No production deployment until authenticated testing confirms natural conversation quality and topic fidelity.

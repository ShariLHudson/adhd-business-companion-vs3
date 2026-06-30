# Wisdom Layer Validation Gate™

| Field | Value |
|-------|-------|
| **Status** | Active for **testing** — not for new design |
| **Mode** | [Observation Mode](./SPARK_OBSERVATION_MODE.md) — log every conversation |
| **Principle** | [The Shari Principle™](./THE_SHARI_PRINCIPLE.md) · [The Member Wins™](./THE_MEMBER_WINS.md) |
| **Wisdom Layer** | [Specs 120–131](./SPARK_WISDOM_LAYER_FRAMEWORK.md) |
| **Primary test** | [CT-11 — Hidden Intent](./conversation-tests/ct-11.md) |

---

## What we're validating now

Specs 105–119 defined **what Spark does**. Specs 120–131 define **how Spark thinks**.

Before building anything else, run these five conversation tests and score against five questions.

**If CT-11 improves, the Wisdom Layer is working.**

**If CT-11 turn 1 still templates → log in [Learning Log](./CONVERSATION_LEARNING_LOG.md). Do not change prompts until [Rule of Three](./SPARK_OBSERVATION_MODE.md).**

---

## Required test runs

| Test | File | What it stresses |
|------|------|------------------|
| **CT-11** | [ct-11.md](./conversation-tests/ct-11.md) | Hidden goal vs literal request — **primary gate** |
| **CT-01** | [ct-01.md](./conversation-tests/ct-01.md) | Marketing plan — no assumptions, permission before draft |
| **CT-05** | [ct-05.md](./conversation-tests/ct-05.md) | "I don't know" + **emotional blocker** (understand before strategy) |
| **CT-09** | [ct-09.md](./conversation-tests/ct-09.md) | Draft review — permission → draft → revision → completion |
| **CT-10** | [ct-10.md](./conversation-tests/ct-10.md) | Retrieval — "I found it" days later |

**Scorecard:** [SCORECARD_TEMPLATE.md](./conversation-tests/SCORECARD_TEMPLATE.md) — all eight QA gates after every run.

**Route:** `/spark-alpha` (or production companion when wired)

---

## Five questions (every run)

Answer honestly after each test. **CT-11 is the wisdom-layer thermometer.**

| # | Question | Pass signal | Fail signal |
|---|----------|-------------|-------------|
| 1 | **Does Shari understand the real goal?** | Coaches toward hidden intent — VA independence, trust, confidence, credibility | Answers the literal noun only |
| 2 | **Does she coach instead of template?** | Outcome question first — one reflection | Outline, structure, steps, or tool pick on turn 1 |
| 3 | **Does she synthesize patterns?** | "I'm noticing…" / "Here's what I'm hearing…" when due (~turn 5–10) | Endless questions with no synthesis |
| 4 | **Does she ask permission before creating?** | Draft/create/export only after explicit yes | Unprompted draft, doc, or workspace output |
| 5 | **Does she feel like Shari, not generic AI?** | Warm mentor across the table | Order-taking software, lecture, cheerleading |

---

## Pass / hold gate

### Pass (proceed)

- **CT-11:** No `literal_task_rush` or `missed_hidden_intent` on turn 1 in any of the four scenarios
- **Five questions:** Majority pass on CT-11; no 🔴 Relief on CT-01 or CT-05
- **Gate 7 (Spark Question):** No "felt like software" on turn 1 of hidden-intent openers

### Hold (tighten — do not build)

- CT-11 turn 1 produces templates, outlines, tool lists, or "Here's a structure…"
- Hidden goal named as diagnosis without wonder ("You really need trust")
- Creation without permission on CT-09 or CT-01
- **Action:** Improve `lib/sparkWisdom/` prompt hints and companion prompt — re-run CT-11 only until turn 1 passes all four openers

---

## CT-11 quick script (smoke test)

Run these four openers cold. **Turn 1 only** must pass before full CT-01/05/09/10 runs.

1. "I need an SOP."
2. "I need a newsletter."
3. "I need pricing help."
4. "I need a website."

**Turn 1 fail examples (stop and tighten):**

- "Here's an SOP structure…"
- "Let's pick an email platform…"
- "Here are three pricing tiers…"
- "Let's outline your homepage…"

**Turn 1 pass examples:**

- "Who needs to run this without you?"
- "Who is this for — and what should they feel after reading you?"
- "What feels harder — the number, or believing it's fair?"
- "What should someone understand in the first ten seconds?"

---

## Parking Lot rule

Until this gate passes:

- **Do not** add features, workflows, or Estate rooms
- **Do not** expand Spark Alpha UI
- **Do** run tests · score · tighten prompts · test again

See [Parking Lot](./PARKING_LOT.md).

---

## Runtime checklist (dev)

`Ctrl+Shift+D` on `/spark-alpha` should show:

- **Member need** (Spec 120)
- **Hoped success** (Spec 131)
- **Hidden intent** (Spec 121)
- **Wisdom Loop summaries** — insight/opportunity when due

If dev panel shows hidden intent but the reply still templates → **prompt tightening needed**, not more code.

---

**Next action:** Run CT-11 four openers · score five questions · [SCORECARD](./conversation-tests/SCORECARD_TEMPLATE.md)

# Chamber Activation — Decision Table

| Field | Value |
|-------|-------|
| **Status** | Design only — no code. |
| **Date** | 2026-08-07 |
| **Purpose** | The prior documents define *scoring states*; this defines *what Shari actually does* in each one — the missing behavioral contract, made concrete with example language instead of abstract rules. |
| **Depends on** | `CHAMBER_ACTIVATION_MODEL_SPECIFICATION.md` (states/thresholds) · `CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md` (the corrected eligibility rule this table assumes) |

---

## The table

| Situation | When it happens | What Spark does | What it never does |
|-----------|--------------------|----------------------|---------------------|
| **Clear primary** | One expert has real evidence (a genuine topic/outcome match, not just intent+estate) and a clear lead over everyone else | Leads the whole answer through that expert's lens — its frameworks, questions, and ADHD adaptations shape what Shari notices and asks, confidently and in one voice | Never says which expert is "leading." Never hedges when the evidence is actually clear |
| **Supporting** | Alongside a primary (or co-primary), a curated collaborator also has real signal for this specific request | Weaves a secondary consideration into the *same* answer — one integrated response, not a second opinion appended after the first | Never frames it as "also, here's what X thinks." Never gives the supporting expert its own paragraph or turn |
| **Co-primary** | Two experts from genuinely different domains both have strong, independent evidence — or the request is structurally two coordinated needs in one sentence ("X **and** Y") | Treats both as equally central from the start. Addresses both needs in one answer, in whichever order makes the answer flow, without ever subordinating one to the other | Never says "lead with X, while Y helps." Never treats it as primary-plus-support when the request genuinely needs both lenses at once |
| **Contested** | Two candidates are close, but *neither* clears real, confident evidence — genuine ambiguity, not dual strength | **Proceeds** with the better-evidenced of the two (never a guess — the evidence-quality tiebreak, never array order), but holds it a little more loosely: doesn't over-assert, and is ready to pivot smoothly on the very next turn if the founder's words point the other way. May naturally fold in a light, non-interrogating check when it fits the conversation | Never stops the conversation to ask. Never announces "I wasn't sure." Never restarts or apologizes if it turns out to be the other one — just continues from there |
| **Insufficient evidence** | No expert clears real eligibility at all — nothing to lead with, weak or no signal everywhere | **Does not activate an expert lens, and does not guess.** Asks one grounded, concrete question built from whatever domains showed even faint signal — offered as real options in plain language, not expert names, and never a generic "can you clarify?" | Never proceeds with a coin-flip primary. Never stays silent and hopes the next message clarifies itself. Never asks more than one question at a time |

---

## The example that anchors this table (given, kept verbatim)

> **Insufficient evidence.** Do not activate an expert. Ask: *"What part of this feels most important right now — getting customers, creating the system, or deciding the direction?"*

This is the model for every "insufficient evidence" response: **three concrete, founder-plain-language options**, each corresponding to a real Chamber domain (Sales, Systems, Strategy) but never named as such, phrased as *things the founder might be trying to do* rather than *experts Spark has available*. It reads as one thoughtful question a good advisor would ask — not a menu, not a diagnostic, and not silence.

---

## Mechanism note (how this is buildable — still design, not code)

The "insufficient evidence" question isn't invented from nothing at conversation time — it's built from data the activation function **already computes today**. Even when no expert clears eligibility, `resolveChamberExpertActivation`'s low-confidence branch already ranks and returns the top 1–2 weakly-scoring candidates (currently surfaced as `possible`). The only new piece needed is a **founder-plain-language phrase per expert**, used *only* for this one purpose — e.g. Sales → "getting customers," Systems → "creating the system," Strategy → "deciding the direction," Finance → "sorting out the money," Events → "planning the event itself." This is a small, separate field from the expert's internal name/thinking-pattern (which stays exactly as it is for every other row in this table) — it exists solely so an "insufficient evidence" question can name real options without ever surfacing "Sales Intelligence" to a member. Not authored or implemented here; flagged as a concrete, small addition for V2-2 to include alongside `outcomeSignals`.

---

## Why "contested" and "insufficient evidence" are handled differently

Both are forms of uncertainty, but they call for opposite postures, and conflating them was a risk worth naming explicitly:

- **Contested has *something* to work with** — evidence exists, it's just not decisive between two candidates. Stopping to ask here would feel like an interrogation for a question a good advisor would just start answering (and adjust if wrong).
- **Insufficient evidence has *nothing* to work with** — proceeding here isn't confidence, it's a guess wearing confidence's clothes. This is exactly the failure mode `CHAMBER_ACTIVATION_OUTCOME_LAYER_ANALYSIS.md` found (Strategy winning six-way ties with zero real evidence): the old behavior treated "insufficient evidence" like "contested" and guessed anyway. This table's whole purpose is to make sure the two are never handled the same way again.

---

## Not decided here

- The exact founder-plain-language phrase per expert (mechanism note above) — content, not architecture, deferred to V2-2 authoring.
- Whether "contested" should ever escalate to an explicit question after repeated turns of not landing — not addressed; today's design keeps it a one-turn, self-correcting posture.
- No code implementing any row's behavior has been written. This table is the specification the eventual composer changes (in `chamberExpertiseHintForChat`) must match, not an implementation of them.

# 209 — Human Conversation Validator & Regeneration Standard

**Source:** `Downloads/209_HUMAN_CONVERSATION_VALIDATOR_AND_REGENERATION_STANDARD.md`  
**Status:** Runtime implemented (CIE + Create wired; other surfaces still bypass)  
**Production deployed:** No

---

## Purpose

Required response-quality gate before user-visible delivery. Blocks responses that are grammatically fine but artificial, generic, off-topic, or unlike Shari.

## Runtime module

`lib/humanConversationValidator/`

| File | Role |
|------|------|
| `types.ts` | Failure codes + result contract |
| `blockedPhraseRegistry.ts` | Versioned phrase/pattern registry |
| `validate.ts` | 10-dimension scoring + critical failures |
| `regenerate.ts` | Regen once → safe fallback |
| `telemetry.ts` | Pass / regen / fallback rates (no bodies) |
| `package209.test.ts` | Required transcript + unit detectors |

## Pipeline placement

```
Draft → CIE technical validation → HCV → regenerate → final → delivery
```

Wired in:

- `lib/conversationIntelligenceEngine/processTurn.ts` (Talk It Out and any CIE consumer)
- `lib/createBuilderChat.ts` `polishCreateReply`

## Scoring (100)

Topic 20 · Natural 15 · Specificity 10 · Continuity 15 · Shari voice 15 · Questions 10 · Rhythm 5 · Interpretation 5 · Clarity 5

Pass: score ≥ 90, no critical failure, Topic ≥ 18, Continuity ≥ 13, Voice ≥ 13.

## Bypass audit (routes that do NOT yet call HCV)

| Surface | Status |
|---------|--------|
| Talk It Out | **Wired** via CIE |
| Create builder chat | **Wired** via polishCreateReply |
| Shari global `/api/companion-chat` | **Bypass** — LLM path |
| Chamber members | **Bypass** — persona prompts |
| Board / Round Table | **Bypass** — templated deliberation |
| Projects | **Bypass** |
| Onboarding | **Bypass** |
| Business Estate guidance | **Bypass** |
| spark-alpha / prototypes | **Bypass** |

Certification incomplete until every conversational route uses HCV.

## Do not deploy

Authenticated preview + explicit approval required before production.

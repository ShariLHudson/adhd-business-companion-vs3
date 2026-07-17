# Live Results — Global Expert Knowledge and Branding Rule (136)

**Status:** `unit_verified` · authenticated preview optional  
**Do not deploy production** until voice spot-check feels right on preview.

**Preview:** https://adhd-business-companion-vs3-ejdam0nd8-shari-hudsons-projects.vercel.app  
**Commit:** `fa0d9fc2`

## What shipped

- Canon doc: `docs/SPARK_EXPERT_KNOWLEDGE_AND_BRANDING_RULE.md`
- Cursor rule: `.cursor/rules/spark-human-voice.mdc` (Spec 136 section)
- Prompt: `SPARK_EXPERT_KNOWLEDGE_BRANDING_PROMPT` inside `SPARK_HUMAN_VOICE_PROMPT_BLOCK`
- Runtime scrub: `scrubExpertAttribution` in `enforceHumanConversation`
- Exception when member asks who said / originated something

## Owners

| Concern | Owner |
|---------|--------|
| Branding rule (canon) | `docs/SPARK_EXPERT_KNOWLEDGE_AND_BRANDING_RULE.md` |
| Prompt injection | `lib/humanConversation/sparkHumanVoice.ts` |
| Detect / scrub | `lib/humanConversation/expertKnowledgeBranding.ts` |
| Post-LLM gate | `enforceHumanConversation` |

## Automated tests

`lib/humanConversation/expertKnowledgeBranding.test.ts`

# 323 — Knowledge and Provenance Audit

**Date:** 2026-07-21  
**Governing specs:** [318](./318_UNIVERSAL_KNOWLEDGE_RETRIEVAL_AND_PROVENANCE_ARCHITECTURE.md) · [319](./319_SHARI_CONVERSATION_ORCHESTRATION_AND_RESPONSE_ARCHITECTURE.md)  
**Related:** 117 Spec · Business Brain · [317 Master Index](./317_ARCHITECTURE_V2_MASTER_INDEX.md)  
**Mode:** Audit only — do not create a new retrieval stack before mapping  
**Verdict:** Strong fragments exist (Brain, canon, Events knowledge, conversation locks); **unified provenance contract and retrieval priority enforcement are missing**

---

## 1. Current retrieval systems

| System | Path | Role |
|--------|------|------|
| Business Brain memory retrieval | `lib/sparkBusinessBrain/` · Spec 117 docs | Remember / connect / retrieve / lifecycle |
| Core memory engine | `lib/sparkCoreIntelligence/memoryEngine/` | Store, recall, proposals, governance |
| Business Brain source integrity | `lib/businessBrain/sourceIntegrity/` | Confidence / verification gates |
| Canon context retrieval | `lib/canonContext/retrieveCanonContext.ts` | Estate/Shari canon for chat |
| Estate Brain knowledge | `lib/estateBrain/knowledgeRegistry.ts` | Place/experience knowledge for routing |
| Chamber knowledge packs | `docs/chamber-knowledge/` · `docs/visual-spark-studios/*` | Member domain knowledge (uneven) |
| Events knowledge manifest | `lib/eventsIntelligence/knowledgeManifest.ts` | Domain retrieval reference |
| Hidden work `brain_retrieve` | `lib/sparkHiddenWorkEngine/` | Iceberg retrieval category |
| Evidence Vault helpers | `lib/estate/evidenceIntelligence.ts` | Evidence room intelligence |

**No single platform Retrieval Pipeline** implementing 318 steps 1–13 end-to-end.

---

## 2. Current provenance support

| Present | Gap |
|---------|-----|
| Brain lifecycle + proposal governance | No universal material-contribution provenance object (source type, owner, version, freshness, assumptions, Work/capability/Collection IDs) |
| Source integrity confidence | Not applied uniformly to Chamber answers / Collection synthesis |
| Research approve-before-apply (UWE) | Strong for Research attachments; not for all Shari/Member contributions |
| Events capability attribution (domain) | Not platform-wide IntelligenceContribution (301) |

---

## 3. Duplicated knowledge

| Pattern | Risk |
|---------|------|
| Member knowledge copied into prompts / UI | High — violates 318 “do not copy full Member knowledge” |
| Estate Brain experts vs Chamber specialties | Medium — overlapping “who knows what” |
| Create Blueprint guidance vs Member knowledge | Medium — composition rules vs ownership |
| Parallel PACKAGE_INDEX trees | Low for retrieval; high for agent navigation (322) |

---

## 4. Current Shari orchestration rules

| Rule | Runtime home | 319 alignment |
|------|--------------|---------------|
| Awaiting-answer | `lib/conversationContinuity/` · `memberIntent` | Strong |
| Mention ≠ launch | `companionPrompt` · `launchAcceptance` tests · pending acceptance | Strong |
| Intent / workflow locks | `acceptedIntentLock` · continuity gate | Strong |
| Talk vs route | Estate coaching / Spec 108 | Partial — modes in 319 not one enum |
| Multi-member synthesis + provenance | Mostly prompt-level | Weak provenance |
| Future-feeling questions | Sparse / ad hoc | Spec’d in 319; not a contract |
| Correction handling | Workflow correction + hospitality | Partial |

---

## 5. Missing vs 318/319

1. Platform retrieval priority order as executable policy  
2. Provenance contract on material contributions  
3. Evidence-quality levels influencing wording  
4. Conflict resolution playbook (authority → freshness → quality)  
5. Freshness declarations on knowledge objects  
6. Explicit ConversationMode enum wired to response assembly checkpoints  
7. Cross-member synthesis with retained capability provenance  

---

## 6. Safe next slice (knowledge)

**Do not** build a new RAG stack.

**Recommend:** Provenance + retrieval-priority **contract types** under `lib/architectureV2/knowledge/` (or extend Business Brain types) + a read-only health check that flags missing provenance on Research apply / UWE contributions — **no user-facing behavior change**.

See also [325 Observability Implementation Plan](./325_OBSERVABILITY_IMPLEMENTATION_PLAN.md) Slice O1.

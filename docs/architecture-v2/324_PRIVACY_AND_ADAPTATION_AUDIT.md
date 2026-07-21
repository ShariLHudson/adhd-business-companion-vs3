# 324 — Privacy and Adaptation Audit

**Date:** 2026-07-21  
**Governing specs:** [320](./320_PRIVACY_TRUST_CONSENT_AND_USER_CONTROL_ARCHITECTURE.md) · [308](./308_ADAPTIVE_CONTEXT_AND_COGNITIVE_LOAD_ENGINE.md) · [307](./307_USER_CAPABILITY_EXPERIENCE_AND_CONFIDENCE_GRAPH.md)  
**Related:** Spec 112 · Constitution 117 · [311 Adaptive Plan](./311_ADAPTIVE_INTELLIGENCE_IMPLEMENTATION_PLAN.md) §9  
**Mode:** Audit only — do not create a new profile store  
**Verdict:** Hospitality memory permissions and temporary DayState exist; **data-class labeling, retention contracts, and inferred-vs-confirmed Business DNA are incomplete**

---

## 1. Privacy-sensitive profile fields

| Store | Sensitive / personal fields | Controls today |
|-------|----------------------------|----------------|
| Business Estate / legacy profile | Business story, goals, client, tools | Member edits in Estate UI; limited “private” flags |
| Hospitality memory | Sensitive categories blocked without permission | `hospitalityMemoryPermissions.ts` |
| Companion memory (112) | Never-remember posture; permission phrases | Types + prompt rules |
| Memory engine governance | Blocks sensitive persist without consent | `memoryEngine/governance.ts` |
| Growth Profile | Competencies / skills | Local; not framed as clinical |
| Support style | Preference for help style | Explicit prefs |

**Gap vs 320:** no unified data-class tags (user-confirmed / inferred / temporary / sensitive) across Business DNA; no standard retention duration per class; multi-business isolation incomplete (single-business mental model).

---

## 2. Temporary versus durable context

| Temporary (should expire) | Durable (should be confirmed) |
|---------------------------|-------------------------------|
| `DayState` / `companion-day-state-v1` | Business Estate confirmed facts |
| Adapt My Day check-in | Support style prefs |
| Arrival-session signals | Workspace environment prefs (091) |
| Conversational “today context” (`clearTodayContext`) | UWE Work history |
| Overwhelm / stress routing signals | Welcome completion (126) — account durable |

**Risk:** temporary energy/motivation inferred into durable capability or DNA without decay (307/308/320 forbid permanent labels from weak evidence).

---

## 3. Consent and user control gaps

| 320 control | Status |
|-------------|--------|
| Review meaningful Business DNA | Partial (Estate UI) |
| Correct facts | Partial |
| Remove stale information | Weak / uneven |
| Mark information private | Weak |
| Reset inferred capability state | Missing (no DomainCapability state yet) |
| Disable recommendation category | Missing shared decline memory (309/311) |
| Decline personalization | Partial (audio, support style) |
| Request explanation (“Why this?”) | Partial / conversational only |
| Separate businesses | Missing multi-business IDs |
| Control Work changes | Strong (UWE approval / Research approve) |

---

## 4. Prohibited-use and non-manipulation

| Rule | Status |
|------|--------|
| No shame / unfinished-work pressure | Strong in constitutions + Estate usability |
| No engagement manipulation | Cultural/rules; not a runtime gate |
| No automatic advanced-material lock from low confidence | N/A until capability graph ships — design must preserve |
| Connected-source minimal scope | Integration-specific; needs inventory per connector |

---

## 5. Adaptation health (ties to 321)

Watch for:

- energy/motivation conflation in copy or schemas  
- too many Welcome Card / Chamber choices under low capacity  
- recommendation repetition  
- incorrect “beginner” framing  

Existing helpers: overwhelm classifier, calm Rule of Three, daily opening choice design — not yet one Adaptive Context façade (311 Slice 1).

---

## 6. Safe next slice (privacy/adaptation)

**Do not** add a parallel profile database.

**Recommend (aligned with 311 Slice 1):** Adaptive Context read façade that:

1. Reads DayState + Adapt My Day + Support Style  
2. Tags fields as **temporary**  
3. Exposes `maxVisibleChoices(context)`  
4. Never writes inferred capability labels  

Optional companion: document data-class taxonomy constants (320) without migrating storage yet.

See [325](./325_OBSERVABILITY_IMPLEMENTATION_PLAN.md).

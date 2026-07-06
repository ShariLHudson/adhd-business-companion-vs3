# Founder Studio™ — Architecture Summary

**Version 1.0 · Final architecture reference**

| | |
|---|---|
| **Status** | Complete |
| **Parent** | [FOUNDER_V1.md](./FOUNDER_V1.md) · [ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md) |
| **Engineering detail** | `lib/intelligence/INTELLIGENCE_REGISTRY.md` |

---

## Major systems

### Headquarters (member of Shari's day)

| System | Code | Route |
|--------|------|-------|
| **Executive Command Center™** | `lib/executiveCommandCenter/` | `/companion/founder/executive-command-center` |

Composes: Judgment, Discovery, Research, Opportunity, Simulation, Memory, Builder, Integration, Missions, Questions.

### Executive pipeline (ordered composition)

| # | System | Code |
|---|--------|------|
| 1 | Executive Research Center™ | `lib/research/` |
| 2 | Opportunity Discovery Center™ | `lib/opportunities/` |
| 3 | Executive Builder™ | `lib/executiveBuilder/` |
| 4 | Executive Simulation Studio™ | `lib/executiveSimulation/` |
| 5 | Executive Memory Theater™ | `lib/executiveMemoryTheater/` |
| 6 | Executive Intelligence Graph™ | `lib/executiveIntelligenceGraph/` |
| 7 | Executive Relationship Intelligence™ | `lib/executiveRelationshipIntelligence/` |
| 8 | Executive Discovery Engine™ | `lib/executiveDiscoveryEngine/` |
| 9 | Executive Integration Center™ | `lib/executiveIntegration/` · [spec](./EXECUTIVE_INTEGRATION_CENTER.md) |
| 10 | Founder Knowledge Vault™ | `lib/founderKnowledgeVault/` · [index](./FOUNDER_DOCUMENT_INDEX.md) |
| 11 | AI Extensions Center™ | `lib/founderAiExtensions/` |
| 12 | Executive Judgment Engine™ | `lib/executiveJudgmentEngine/` |

### Coordination & voice

| System | Code |
|--------|------|
| SPARK™ / FLAME™ / FIRE™ | `lib/spark/` · founder config |
| Executive Questions™ | `lib/executiveQuestions/` |
| Overnight Executive Cycle™ | `lib/overnight/` |
| Executive Brief Experience™ | `lib/founder/executiveBrief/` |
| Companion Intelligence Governor™ | `lib/governor/` |
| Calm Intelligence™ | `lib/calmIntelligence/` |
| Executive Awareness™ | `lib/awareness/` |
| Executive Operating System™ | `lib/executiveOS/` |
| Institutional Memory™ | `lib/institutionalMemory/` |
| Executive Decision Lifecycle™ | `lib/executiveDecision/` |
| Executive Orchestrator™ | `lib/orchestrator/` |

### Bridges (Founder product layer)

All under `lib/founder/services/*Bridge.ts` — UI and Command Center consume bridges, not raw engine internals.

---

## Major experiences (rooms)

Canonical list: `lib/founderStudio/rooms.ts` (26 rooms).

**Six Command Center panels** map to domains:

| Panel | Primary rooms |
|-------|----------------|
| **TODAY** | Command Center, Judgment, Missions |
| **DISCOVER** | Research, Opportunity Discovery, Discovery Engine, Relationship Intelligence |
| **DECIDE** | Simulation, Judgment, Strategy, Decision Vault |
| **BUILD** | Builder, Spark Command, Creation Studio |
| **RUN** | Integration Center, Automation, Team Hub, Knowledge Vault, AI Extensions |
| **LEARN** | Memory Theater, Intelligence Graph, Reflection |

---

## Major intelligence layers

```
┌─────────────────────────────────────────────────────────────┐
│  EXECUTIVE COMMAND CENTER™  (one surface, one voice)        │
└─────────────────────────────┬───────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────┐
│  EXECUTIVE JUDGMENT ENGINE™  (pyramid, Shari Rule)          │
└─────────────────────────────┬───────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ DISCOVERY     │   │ RESEARCH +      │   │ MEMORY + GRAPH  │
│ ENGINE        │   │ OPPORTUNITY     │   │ + RELATIONSHIP  │
└───────┬───────┘   └────────┬────────┘   └────────┬────────┘
        │                    │                     │
        └────────────────────┼─────────────────────┘
                             ▼
              ┌──────────────────────────┐
              │ BUILDER + SIMULATION     │
              └────────────┬─────────────┘
                           ▼
              ┌──────────────────────────┐
              │ INTEGRATION CENTER       │
              │ (external systems)       │
              └────────────┬─────────────┘
                           ▼
              ┌──────────────────────────┐
              │ GOVERNOR + CALM + OS     │
              │ SPARK · FLAME · FIRE     │
              └──────────────────────────┘
```

---

## Primary workflows

### Morning headquarters

1. Shari opens Executive Command Center™  
2. Status bar: mission, focus, energy, momentum, risk, opportunity  
3. Six questions answered from composed intelligence  
4. One mission · one recommendation · one next action  
5. Optional: expand panel or review Assistant queue (drafts)  

### Research → decision

1. Research Center or alert surfaces evidence  
2. Opportunity Discovery ranks business bet  
3. Simulation compares paths  
4. Judgment pyramid selects primary recommendation  
5. Builder prepares implementation packet (draft)  
6. Shari approves → Orchestrator / Team Hub / external systems  

### Overnight

1. Overnight Executive Cycle runs (scheduled, future)  
2. Awareness + Relationship Intelligence detect change  
3. Discovery Engine composes brief  
4. Judgment updates pyramid  
5. Command Center morning view reflects overnight work  

---

## Information flow

| Direction | Rule |
|-----------|------|
| **Ingest** | Integrations, Companion aggregates, research, analytics → sample repos (V1) → production stores (implementation) |
| **Compose** | Engines produce views; no engine renders UI directly except via room component |
| **Aggregate** | Command Center calls compose functions — leaf imports to avoid cycles |
| **Present** | One voice via Judgment + Governor; Calm Intelligence applies Rule of One/Three |
| **Persist** | Intelligence Registry hooks; lineage `originatedFromId`; graph `connectionIds` |

---

## Decision flow

```
Signal → Evidence (Research) → Opportunity rank → Simulation (optional)
    → Judgment scores → Primary recommendation → Permission → Action
```

**Shari is always the decision authority.** Founder never marks a decision "made" without explicit confirmation.

---

## Learning flow

```
Recommendation → Shari decision → Outcome (recorded) → Learning loop
    → Memory Theater replay → Institutional Memory → Future Judgment weights
```

Patterns are **observations** with tentative confidence — never shame labels.

---

## Relationship map (ecosystem)

| Founder connects to | Relationship |
|---------------------|--------------|
| **Spark Companion™** | Ethical signal ingest; shared Spark canon; separate UX |
| **Spark Estate™** | Visual philosophy; not merged navigation |
| **PostCraft™** | Campaign prep, content pipeline |
| **GHL** | Nurture, contacts, workflows |
| **Cursor / GitHub** | Build packets, implementation |
| **Google Workspace** | Docs, calendar, drive |
| **Team Hub™** | Execution after founder decides |
| **Analytics** | Revenue and funnel context |

Founder is **above** tools — not inside them.

---

## Marketing orchestration flow

Canonical diagram: [FOUNDER_MARKETING_ORCHESTRATION.md](./FOUNDER_MARKETING_ORCHESTRATION.md)

```
Founder Studio™ → recommendations → prepares everything
  ├─ PostCraft™ (content, campaigns, assets)
  └─ GoHighLevel (workflows, email, funnels, CRM, memberships, automations)
        ▼
Founder receives status and analytics back
```

Runtime: `lib/executiveIntegration/marketingOrchestration.ts` · UI: Executive Integration Center flow panel.

---

## Future implementation priorities

See [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md). Summary:

1. Replace sample data  
2. Connect real systems  
3. Activate intelligence (existing engines)  
4. UX refinement  
5. Automation (permission-gated)  
6. Continuous learning  

---

## Known future integrations

| System | Status V1 | Target phase |
|--------|-----------|--------------|
| Cursor | Sample shortcuts | Phase 2 |
| GitHub | Sample status | Phase 2 |
| Google OAuth | Partial routes exist | Phase 2 harden |
| GHL | Dashboard routes exist | Phase 2 |
| PostCraft | API routes exist | Phase 2 |
| Companion signals | Architecture defined | Phase 2–3 |
| Analytics / revenue | Ecosystem APIs partial | Phase 2–3 |
| Scheduled overnight jobs | Sample compose only | Phase 4–5 |

---

## Authoritative definitions (one per concept)

| Concept | Authoritative document / code |
|---------|------------------------------|
| What Founder is | [FOUNDER_V1.md](./FOUNDER_V1.md) |
| Experience law | [FOUNDER_EXPERIENCE_CONSTITUTION.md](./FOUNDER_EXPERIENCE_CONSTITUTION.md) |
| Vision & promise | [FOUNDER_MASTER_BLUEPRINT.md](./FOUNDER_MASTER_BLUEPRINT.md) |
| Design principles | [FOUNDER_DESIGN_PRINCIPLES.md](./FOUNDER_DESIGN_PRINCIPLES.md) |
| Freeze rules | [ARCHITECTURE_FREEZE.md](./ARCHITECTURE_FREEZE.md) |
| Engine list | `lib/intelligence/INTELLIGENCE_REGISTRY.md` |
| Room list | `lib/founderStudio/rooms.ts` |
| Command Center compose | `lib/executiveCommandCenter/services/executiveCommandCenterService.ts` |

Do not duplicate these definitions elsewhere without linking back.

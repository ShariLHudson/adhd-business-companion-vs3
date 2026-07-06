# Founder Document Index™

**Master index of important Spark, Founder, Companion, PostCraft, GHL, Cursor, and architecture documents.**

| | |
|---|---|
| **UI** | `/companion/founder/founder-knowledge-vault` |
| **Vault engine** | `lib/founderKnowledgeVault/` |
| **Recovery** | [FOUNDER_RECOVERY_GUIDE.md](./FOUNDER_RECOVERY_GUIDE.md) |

**Authority levels:** Constitution · Blueprint · Operating Manual · Prompt · Reference · Archive

---

## Constitutions (supreme experience law)

| Document | Path | Purpose | When to use | Authority |
|----------|------|---------|-------------|-----------|
| Founder Experience Constitution™ | `docs/founder/FOUNDER_EXPERIENCE_CONSTITUTION.md` | How Founder must feel | Any Founder UI or copy | Constitution |
| Entrepreneurial Transformation Constitution™ | `docs/ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md` | Member growth and hero principle | Ecosystem experiences | Constitution |
| Relationship Constitution | `docs/RELATIONSHIP_CONSTITUTION.md` | How people feel in UI and rooms | All member-facing work | Constitution |
| The Friend We All Deserve™ | `docs/THE_FRIEND_WE_ALL_DESERVE.md` | How Spark speaks | Conversation and prompts | Constitution |

---

## Blueprints (vision and architecture)

| Document | Path | Purpose | When to use | Authority |
|----------|------|---------|-------------|-----------|
| Founder Master Blueprint™ | `docs/founder/FOUNDER_MASTER_BLUEPRINT.md` | SPARK Intelligence Blueprint — executive philosophy | Strategic decisions | Blueprint |
| Founder V1 | `docs/founder/FOUNDER_V1.md` | 15-minute architecture orientation | Onboarding, handoffs | Blueprint |
| Architecture Freeze | `docs/founder/ARCHITECTURE_FREEZE.md` | Frozen vs. allowed evolution | Before new engines/rooms | Blueprint |
| Founder V1 Implementation Transition | `docs/founder/FOUNDER_V1_IMPLEMENTATION_TRANSITION.md` | Build phase — five priorities | Every implementation sprint | Blueprint |
| Founder Architecture Summary | `docs/founder/FOUNDER_ARCHITECTURE_SUMMARY.md` | Systems and relationship map | Engineering orientation | Blueprint |
| No Feature Creep | `docs/founder/NO_FEATURE_CREEP.md` | Eight-question feature gate | Every proposed feature | Blueprint |

---

## Operating manuals (how systems run)

| Document | Path | Purpose | When to use | Authority |
|----------|------|---------|-------------|-----------|
| Executive Resources Center | `docs/founder/EXECUTIVE_RESOURCES_CENTER.md` | Single hub for external tools and departments | Before adding external resources | Operating Manual |
| Spark Master Library | `docs/founder/SPARK_MASTER_LIBRARY.md` | Permanent knowledge index | Finding any important document | Operating Manual |
| Google Drive Structure | `docs/founder/GOOGLE_DRIVE_STRUCTURE.md` | Master storage folders | File organization | Operating Manual |
| AI Knowledge / NotebookLM | `docs/founder/AI_KNOWLEDGE_NOTEBOOKLM.md` | Vault → Drive → NotebookLM | Large document research | Operating Manual |
| Master Library Index | `docs/founder/MASTER_LIBRARY_INDEX.md` | Master catalog of all knowledge | Document registration | Reference |
| Master Prompt Library | `docs/founder/MASTER_PROMPT_LIBRARY.md` | Organized prompts by area | Prompt lookup | Prompt |
| Executive Integration Center | `docs/founder/EXECUTIVE_INTEGRATION_CENTER.md` | Mission Control — external systems | Integration work | Operating Manual |
| Executive Research Center | `docs/founder/EXECUTIVE_RESEARCH_CENTER.md` | Research department flow | Research features | Operating Manual |
| Implementation Roadmap | `docs/founder/IMPLEMENTATION_ROADMAP.md` | Five-priority build phases | Post-V1 sprints | Operating Manual |
| Intelligence Registry | `lib/intelligence/INTELLIGENCE_REGISTRY.md` | Objects × engines × relationships | New objects/engines | Operating Manual |
| Executive Execution System | `docs/founder/EXECUTIVE_EXECUTION_SYSTEM.md` | Decision-to-execution lifecycle | Execution flows | Operating Manual |

---

## Prompts (implementation and AI)

| Document | Path | Purpose | When to use | Authority |
|----------|------|---------|-------------|-----------|
| Founder Marketing Orchestration | `docs/founder/FOUNDER_MARKETING_ORCHESTRATION.md` | PostCraft + GHL flow | Marketing integration | Prompt |
| Founder GHL Prompts | `docs/founder-ghl-prompts.md` | GHL workflows and CRM | GHL work | Prompt |
| Conversation Architecture Freeze | `docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md` | Frozen conversation stack | Conversation changes | Prompt |
| Spark Human Voice Rules | `docs/SPARK_HUMAN_VOICE_RULES.md` | Voice QA | All Spark copy | Prompt |

---

## Reference (supporting specs)

| Document | Path | Purpose | When to use | Authority |
|----------|------|---------|-------------|-----------|
| Founder Design Principles | `docs/founder/FOUNDER_DESIGN_PRINCIPLES.md` | Permanent design law | UI decisions | Reference |
| GitHub Roadmap | `docs/founder/GITHUB_ROADMAP.md` | Milestones M0–M7 | Prioritization | Reference |
| Executive Value Score | `docs/founder/EXECUTIVE_VALUE_SCORE.md` | Issue scoring formula | GitHub triage | Reference |
| Estate Architectural Authority | `docs/estate/ESTATE_ARCHITECTURAL_AUTHORITY.md` | Estate canon manifest | Estate work | Reference |
| Spark Estate Bible | `docs/estate/Spark Estate Bible.md` | Estate places and objects | Room design | Reference |

---

## Archive (completed milestones)

| Document | Path | Purpose | When to use | Authority |
|----------|------|---------|-------------|-----------|
| Founder V1 Completion Report | `docs/founder/FOUNDER_V1_COMPLETION_REPORT.md` | V1 freeze record | Historical context | Archive |

---

## Cursor rules (agent guardrails)

Located in `.cursor/rules/`. Key rules:

| Rule | Path | Purpose |
|------|------|---------|
| Founder Knowledge Vault | `.cursor/rules/founder-knowledge-vault.mdc` | Protect documents — no duplication |
| Master Library | `.cursor/rules/master-library.mdc` | Check Master Library before duplicating docs |
| The Friend We All Deserve | `.cursor/rules/the-friend-we-all-deserve.mdc` | Companion voice |
| Estate Architectural Authority | `.cursor/rules/estate-architectural-authority.mdc` | Estate canon |
| Conversation Architecture Frozen | `.cursor/rules/spark-conversation-architecture-frozen.mdc` | No conversation redesign |
| Intelligence-Ready Architecture | `.cursor/rules/intelligence-ready-architecture.mdc` | Permanent data hooks |

---

## Conflict resolution

When implementation conflicts with documents, **higher authority wins:**

1. Founder Experience Constitution™  
2. SPARK Intelligence Blueprint / Founder Master Blueprint™  
3. Architecture Freeze · No Feature Creep  
4. Operating manuals and room specs  
5. Reference docs  

**Prefer the simpler approach** that preserves the higher-authority document.

---

## Maintenance rule

When a new important constitution, blueprint, or master prompt is created:

1. Add it to **Founder Knowledge Vault** sample data (`lib/founderKnowledgeVault/sample/vaultData.ts`)  
2. Register in **Spark Master Library** (`lib/sparkMasterLibrary/sample/libraryData.ts`)  
3. Add rows to **this index**, **MASTER_LIBRARY_INDEX.md**, and **MASTER_PROMPT_LIBRARY.md** (if prompt)  
4. Do not duplicate existing authority documents

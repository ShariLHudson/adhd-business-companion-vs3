# Estate Knowledge Base™ — Room Intelligence™

| Field | Value |
|-------|-------|
| **Audience** | Spark internal — conversation, Estate Intelligence, coaching, hidden work |
| **Not for** | Member-facing copy, marketing, or UI labels |
| **Authority** | Canonical over improvised explanations when a room is matched |
| **Parent** | [SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md](./SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md) |
| **Phase 1** | [momentum-institute.md](./momentum-institute.md) — Build Room Intelligence™ |

---

## Purpose

Spark currently routes between Estate places. This knowledge base teaches Spark **what each place is for** — so Shari explains naturally from permanent understanding instead of inventing definitions.

> When Estate Intelligence matches a room, **read the room knowledge first**. Do not answer like a generic LLM.

---

## Document standard

Every file in `docs/estate/<room-id>.md` includes:

| Section | Spark uses it to… |
|---------|-------------------|
| **Purpose** | Know why the place exists |
| **Transformation** | Describe growth outcome, not features |
| **Emotional feeling** | Match hospitality and tone |
| **Primary experiences** | Name what happens here (not software modules) |
| **What members do here** | Guide participation without lecturing |
| **What members create here** | Connect to artifacts, evidence, portfolio |
| **When Estate Intelligence should recommend** | Matcher confidence + member signals |
| **Conversation examples** | Gold patterns — adapt, do not copy verbatim |
| **Related rooms** | Journey bridges — one primary next step |
| **Things this room should never do** | Guardrails — wins on conflict |
| **Future roadmap** | What is live vs planned — never imply shipped |

Room-specific sections (e.g. Institute experience types) extend the standard when needed.

---

## Runtime bridge

Condensed hints for live chat load from `lib/estateKnowledge/` — kept in sync with these documents.

`estateIntelligenceHintForChat()` appends room knowledge when a registry match exists.

**Rule of sync:** When room knowledge changes here, update the matching module in `lib/estateKnowledge/`.

---

## Index

| Room | Knowledge doc | Registry ID | Runtime hint |
|------|---------------|-------------|--------------|
| Momentum Institute™ | [momentum-institute.md](./momentum-institute.md) | `library` | ✅ |
| Welcome Home | [welcome-home.md](./welcome-home.md) | `welcome-home` | 🔲 |
| Creative Studio™ | [creative-studio.md](./creative-studio.md) | `creative-studio` | 🔲 |
| Observatory™ | [observatory.md](./observatory.md) | `observatory` | 🔲 |
| Coffee House™ | [coffee-house.md](./coffee-house.md) | `coffee-house` | 🔲 |
| Peaceful Places™ | [peaceful-places.md](./peaceful-places.md) | `peaceful-places` | 🔲 |
| Decision Compass™ | [decision-compass.md](./decision-compass.md) | `decision-compass` | 🔲 |
| Clear My Mind™ | [clear-my-mind.md](./clear-my-mind.md) | `clear-my-mind` | 🔲 |
| Momentum Builder™ | [momentum-builder.md](./momentum-builder.md) | `momentum-builder` | 🔲 |
| Growth Journal™ | [growth-journal.md](./growth-journal.md) | `growth-journal` | 🔲 |

---

## Deep references (not duplicated here)

- Institute blueprint: [MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md](../MOMENTUM_INSTITUTE_MASTER_BLUEPRINT.md)
- Institute architecture: [MOMENTUM_INSTITUTE_ARCHITECTURE.md](../MOMENTUM_INSTITUTE_ARCHITECTURE.md)
- Estate rooms framework: [ESTATE_ROOMS_FRAMEWORK.md](../ESTATE_ROOMS_FRAMEWORK.md)

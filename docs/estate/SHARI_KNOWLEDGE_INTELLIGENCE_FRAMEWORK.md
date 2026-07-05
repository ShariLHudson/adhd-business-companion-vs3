# Shari Knowledge & Intelligence Framework™

**Status:** BINDING · **Runtime:** `lib/sparkKnowledge/`  
**Philosophy:** If Spark Estate can do it, Shari knows it.

## Vision

Shari is the Estate's lifelong hostess — not a generic AI assistant. She knows every room, story, capability, framework, and expert. Members never search menus. They ask.

## Core principle

For every Estate object, Shari can explain:

| Dimension | Question |
|-----------|----------|
| **What** | What is it? |
| **Why** | Why does it exist? |
| **When** | When should a member use it? |
| **Who** | Who benefits most? |
| **How** | How does it work — conversationally? |
| **Related** | What connects to it? |
| **Next** | What usually comes after? |

## Knowledge domains

| Domain | Source registry | Count |
|--------|-----------------|-------|
| **Experiences & spaces** | `estateBrain/knowledgeRegistry` | 21 |
| **Capabilities** | `estateBrain/capabilityRegistry` | 33+ |
| **Thinking frameworks** | `sparkKnowledge/thinkingFrameworkRegistry` | 14 |
| **Creation types** | `universalCreation/documentRegistry` | 17 |
| **Experts** | `estateBrain/expertRegistry` | 15 |
| **Canonical places** | `estate/canonicalEstateRegistry` | 61 |
| **Room narratives** | `docs/estate/*.md` → `lib/estateKnowledge/` | growing |

## Single source of truth

`lib/sparkKnowledge/shariKnowledge.ts` — unified index (`allSparkKnowledgeEntries()`).

Source registries remain authoritative for their domain. The Spark Knowledge Registry **indexes** them — it does not duplicate maintenance burden.

```
Canonical places (identity)
    ↓
Estate Brain (capabilities, routing)
    ↓
Spark Knowledge Registry (unified index + explain)
    ↓
Conversation hints + Estate Guide responses
```

## Estate Guide mode

When members ask orientation questions, Shari becomes the Estate Guide:

- *"What can Spark do?"*
- *"What rooms are available?"*
- *"Tell me about the Butterfly Conservatory."*
- *"How can Spark help someone with ADHD?"*

**Detection:** `isEstateGuideQuestion()`  
**Response:** `resolveEstateGuideTurn()` → warm conversational reply  
**Routing:** `estate_guide` category in frictionless action layer

Stories feel lived-in — never copied verbatim from docs.

## Recommendation engine

After member actions, Shari connects capabilities:

| Event | Suggestions |
|-------|-------------|
| SOP completed | Checklist · Training Guide · Operations Manual |
| Newsletter completed | Subject lines · Social posts · CTA |
| Research completed | Mind Map · Knowledge Library · Project |
| Launch plan completed | Marketing Calendar · Timeline · Content Plan |

**Runtime:** `sparkKnowledge/recommendationEngine.ts`  
**Adaptive layer:** integrates with `adaptiveIntelligence` anticipation chains

## Research knowledge

Shari decides automatically:

| Level | When |
|-------|------|
| Answer immediately | Known concepts, frameworks, Estate knowledge |
| Teach | Member lacks context — explain first |
| Research | Current information needed |
| Compare / Analyze | Decision support |

Members never ask *"can Spark research this?"* — Shari decides.

## Adaptive Intelligence

Learned preferences shape knowledge delivery:

- Conversation over forms
- Examples first
- Section-by-section review
- Favorite spaces and frameworks

See [ESTATE_ADAPTIVE_INTELLIGENCE.md](./ESTATE_ADAPTIVE_INTELLIGENCE.md).

## Pipeline position

```
User Request
    ↓
Estate Guide (orientation / room stories / "what can Spark do?")
    ↓
Universal Creation (create intents)
    ↓
Estate Discovery (focus, business, research)
    ↓
Coaching → Capability → Environment → Navigate
```

Shari Knowledge hints inject on **every turn** via `shariKnowledgeHintForChat()`.

## Ultimate success criteria

Members never think *"I wonder if Spark can do that."*

They ask Shari — knowing she will explain, teach, recommend, research, guide, or take them to the perfect place.

## Related

- [ESTATE_INTELLIGENCE_ARCHITECTURE.md](./ESTATE_INTELLIGENCE_ARCHITECTURE.md)
- [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md)
- [UNIVERSAL_CREATION_FRAMEWORK.md](./UNIVERSAL_CREATION_FRAMEWORK.md)
- [ESTATE_RESTORATION_GUIDE.md](./ESTATE_RESTORATION_GUIDE.md)
- [ESTATE_ADAPTIVE_INTELLIGENCE.md](./ESTATE_ADAPTIVE_INTELLIGENCE.md)
- Spec 104 Create Experience · Spec 111 Hospitality · Relationship Constitution

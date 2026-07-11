# Spark Companion — Architecture Index

**Foundational principle:** **THE RELATIONSHIP OWNS THE WORK.**

**Product operating system (binding):** [architecture/SPARK_INTELLIGENCE_BLUEPRINT.md](./architecture/SPARK_INTELLIGENCE_BLUEPRINT.md) — SPARK™, FLAME™, FIRE™, Founder Studio™, Companion™, PostCraft™, Team Hub™, GoHighLevel, and the Intelligence Pipeline™. All ecosystem features must align with this blueprint before implementation.

This index lists **binding architecture documents** for conversation, creation, and the Estate. Implementation specs (105–119), Wisdom Layer (120–131), and Estate canon are authoritative in their own domains — this index covers the **orchestration stack** added in 2026-07.

---

## Master orchestration

| Document | Role |
|----------|------|
| [SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md](./SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md) | **Conversation Intelligence** — master pipeline, layer order, ownership boundaries |
| [SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./SPARK_COMPANION_RUNTIME_ARCHITECTURE.md) | **Companion Runtime** — Mermaid flow: message → intent → recognition → capabilities → composition → memory → room routing → facade → response |
| [estate/recognition/library/151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md](./estate/recognition/library/151_SPARK_COMPANION_RUNTIME_ARCHITECTURE.md) | **Architecture Library #151** — same runtime map (numbered index copy) |

---

## Intelligence stack (top → bottom)

Each layer **declines or advises**; none side-steps the pipeline.

```
Conversation Intelligence          ← master orchestration
    ↓
Conversation Mode Intelligence   ← what mode is the member in? (Capture · Create · …)
    ↓
Conversation Session             ← relationship task spine · memory · artifacts
    ↓
Creation Guidance Intelligence   ← idea → finished work (when ask · act · draft · review · complete)
    ↓
Studio Readiness Intelligence    ← when the Studio opens (populated)
    ↓
Creating Together                ← member-facing creation (Estate Place + panel)
    ↓
Studio Registry                  ← capability surfaces inside places
    ↓
Artifact                         ← email · SOP · map · project · …
    ↓
Member Journey                   ← longitudinal momentum · wins · growth
```

| Layer | Document |
|-------|----------|
| Conversation Intelligence | [SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md](./SPARK_CONVERSATION_INTELLIGENCE_ARCHITECTURE.md) |
| Conversation Mode | [CONVERSATION_MODE_INTELLIGENCE.md](./CONVERSATION_MODE_INTELLIGENCE.md) |
| Conversation Session | [CONVERSATION_SESSION_ARCHITECTURE.md](./CONVERSATION_SESSION_ARCHITECTURE.md) |
| Creation Guidance | [CREATION_GUIDANCE_INTELLIGENCE.md](./CREATION_GUIDANCE_INTELLIGENCE.md) |
| Studio Readiness | [STUDIO_READINESS_INTELLIGENCE.md](./STUDIO_READINESS_INTELLIGENCE.md) |
| Creating Together | [ESTATE_CREATION_EXPERIENCE.md](./ESTATE_CREATION_EXPERIENCE.md) |
| Studio Registry | [ESTATE_CREATION_EXPERIENCE.md §4](./ESTATE_CREATION_EXPERIENCE.md) |
| Member Journey | [MEMBER_JOURNEY_ARCHITECTURE.md](./MEMBER_JOURNEY_ARCHITECTURE.md) |

---

## Creation Guidance — ownership (binding)

**Owns:** when Spark asks · acts · drafts · reviews · completes (creation lifecycle).

**Does not own:** conversation routing · Estate recommendations · Studio opening decisions · Session memory (session store persists; guidance updates `creationGuidance` fields only).

Full spec: [CREATION_GUIDANCE_INTELLIGENCE.md](./CREATION_GUIDANCE_INTELLIGENCE.md)

---

## Sibling authorities

| Document | Role |
|----------|------|
| [architecture/SPARK_INTELLIGENCE_BLUEPRINT.md](./architecture/SPARK_INTELLIGENCE_BLUEPRINT.md) | **Ecosystem OS** — SPARK · FLAME · FIRE · products · pipeline · design & development constitution |
| [ADAPTIVE_CREATION_INTELLIGENCE.md](./ADAPTIVE_CREATION_INTELLIGENCE.md) | Research Create · knowledge-gap detection (sub-step of Creation Guidance) |
| [estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md](./estate/ESTATE_INTELLIGENCE_ARCHITECTURE.md) | Estate place + capability judgment |
| [estate/UNIVERSAL_CREATION_FRAMEWORK.md](./estate/UNIVERSAL_CREATION_FRAMEWORK.md) | Universal Creation **adapter** (internal — not member-facing) |
| [CONVERSATION_REGRESSION_AUDIT.md](./CONVERSATION_REGRESSION_AUDIT.md) | Evidence · regression inventory |
| [SPARK_CONVERSATION_BUG_REVERSE_ENGINEERING.md](./SPARK_CONVERSATION_BUG_REVERSE_ENGINEERING.md) | Bug map · engineering passes |

---

## Estate canon (places · objects)

| Index | Path |
|-------|------|
| Estate documentation | [estate/README.md](./estate/README.md) |
| Architectural authority | [estate/ESTATE_ARCHITECTURAL_AUTHORITY.md](./estate/ESTATE_ARCHITECTURAL_AUTHORITY.md) |

---

## Member experience canon (unchanged)

Specs **105–119** · Wisdom Layer **120–131** · [SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md) · [THE_FRIEND_WE_ALL_DESERVE.md](./THE_FRIEND_WE_ALL_DESERVE.md)

# Spark Ecosystem V4 — Foundation Architecture

| Field | Value |
|-------|-------|
| **Version** | 4.0 |
| **Status** | Foundation — document first, implement in order |
| **Branch** | `v4.0-development` |
| **Principle** | [The Member Wins™](./THE_MEMBER_WINS.md) |
| **Conversation layer** | Specs 105–119 **frozen** — V4 extends orchestration & discovery, does not redesign conversation philosophy |

---

## What V4 Is

Spark V4 is not a collection of features.

Spark V4 is the **architecture that connects everything into one seamless companion experience**.

Members interact with **one intelligent companion** — Shari — in **one living Estate**. They never see models, routers, engines, or modules. Engineering serves that illusion.

### The V4 question (every decision)

> Does this make Spark feel more natural, reduce cognitive load, improve trust, or improve discoverability?

If not — reconsider.

---

## Design north star

> **Spark is not software. Spark is a place where conversations help people think, create, and grow.**

---

## Architectural layers

V4 organizes the ecosystem into five connected layers. Lower layers are invisible; upper layers are felt.

```
┌─────────────────────────────────────────────────────────────┐
│  MEMBER EXPERIENCE — Estate, rooms, frosted conversation    │
├─────────────────────────────────────────────────────────────┤
│  DISCOVERY — Key, Guide, conversation, suggestions, daily │
├─────────────────────────────────────────────────────────────┤
│  COMPANION INTELLIGENCE — Wisdom 120–131, Brain, Memory     │
├─────────────────────────────────────────────────────────────┤
│  AI ORCHESTRATION — Capability matrix, routing, evaluation  │
├─────────────────────────────────────────────────────────────┤
│  SPARK OS — Constitution, Response Architecture, Objects    │
└─────────────────────────────────────────────────────────────┘
```

### Layer 1 — Spark OS (permanent)

**Authority:** `spark-intelligence-foundation/`

| Engine | Role |
|--------|------|
| [00 Constitution](./spark-intelligence-foundation/00-spark-constitution.md) | Non-negotiables |
| [006 Response Architecture](./spark-intelligence-foundation/006-spark-response-architecture.md) | Every reply pipeline |
| [09 Performance & Routing](./spark-intelligence-foundation/09-spark-performance-routing-engine.md) | Minimum necessary intelligence |
| [10 Response Evaluation](./spark-intelligence-foundation/10-spark-response-evaluation-engine.md) | Pre-delivery quality gate |
| [003 Business Brain](./spark-intelligence-foundation/003-business-brain.md) | Living business map |
| [007 Context Strategy](./spark-intelligence-foundation/007-context-strategy.md) | MVC — never load everything |

V4 **implements** these engines progressively. V4 does **not** replace conversation specs 105–119.

### Layer 2 — AI Orchestration (V4 new emphasis)

**Document:** [AI_CAPABILITY_MATRIX.md](./AI_CAPABILITY_MATRIX.md)

Internal routing across model families by **capability**, not by brand. Members always receive **Spark** — one voice, one relationship.

Outputs:

- Capability matrix (what each model class does best)
- Routing rules (when to invoke which capability)
- Model-agnostic surfaces (conversation, memory, discovery copy)
- Unified evaluation before delivery

### Layer 3 — Companion Intelligence (frozen + extend quietly)

**Authority:** Specs 105–131, Observation Mode

- Conversation Engine, Guardrails, State Machine, Flow Engine, Wisdom Layer
- Business Brain Memory & Retrieval (117)
- Hidden Work Engine (118)
- Companion Memory (112)

V4 adds **routing and discovery** behind these — not new conversation patterns ad hoc.

### Layer 4 — Discovery System (V4 new)

**Document:** [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md)

Members never need a feature map. Capabilities surface through:

- Discovery Key™
- Estate Guide™
- Conversation
- Smart Suggestions
- Daily Invitation
- Direct Request
- Search

Every capability must be reachable through **multiple paths**.

### Layer 5 — Member Experience (V4 entry)

**Documents:** [WELCOME_HOME_FLOW.md](./WELCOME_HOME_FLOW.md) · [Spec 109 Frosted Workspace](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md)

| Moment | Experience |
|--------|------------|
| First launch | Cinematic Welcome Home — environment is the UI |
| Post-welcome | Frosted conversation surface (tested standard — do not redesign) |
| Returning | Normal home conversation — no forced replay |
| Ongoing | Estate rooms when helpful — conversation travels |

---

## One Companion — not modules

From `AGENTS.md` companion architecture:

1. **One Companion** — need → context → right workspace → conversation continues
2. **One shared brain** — every interaction feeds shared intelligence
3. **Companion-led navigation** — Spark goes with the member; never "open the feature"
4. **Calm-home entry** — continue meaningful work, not last page visited
5. **Arrival Intelligence** — greeting and presence from `evaluateArrivalIntelligence()`, not hard-coded UI

V4 reinforces this: **navigation is secondary; conversation is primary.**

---

## V4 system map

| System | V4 role | Primary doc |
|--------|---------|-------------|
| Welcome Home | First belonging moment | [WELCOME_HOME_FLOW.md](./WELCOME_HOME_FLOW.md) |
| Frosted Conversation | Universal chat surface | Spec 109 |
| Discovery Key™ | Gentle capability unlock | [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md) |
| Estate Guide™ | Guided orientation | [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md) |
| Spark Cards™ | Living wisdom | [SPARK_CARD_FRAMEWORK.md](./SPARK_CARD_FRAMEWORK.md) |
| Daily Discoveries™ | One invitation per day | [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md) |
| AI Orchestration | Internal model routing | [AI_CAPABILITY_MATRIX.md](./AI_CAPABILITY_MATRIX.md) |
| Conversation QA | Pre-ship + continuous eval | [CONVERSATION_TEST_FRAMEWORK.md](./CONVERSATION_TEST_FRAMEWORK.md) |
| Business Brain™ | Context + retrieval | Spec 117 |
| Response Evaluation | Score before delivery | OS 010 + V4 framework |

---

## What V4 explicitly removes from first impression

On first launch, members must **not** see:

- Left navigation / sidebar
- Top navigation bar
- Dashboard layout
- Google integration panel
- Transparent washes over the environment
- "Good morning" heading
- Chat input (until welcome completes)

The **Estate fills the screen**. The environment **is** the experience.

**Implementation (V4.0 alpha):** `WelcomeHomeFirstLaunch` · `lib/welcomeHome/` · `welcome-home-first-launch.css`

---

## Frosted chat — the V4 conversation standard

The frosted conversation implementation validated in Spark Alpha / home testing is the **canonical surface**. Do not redesign.

| Element | Implementation |
|---------|----------------|
| Workspace shell | `companion-workspace-frosted` · `workspaceFloatingCardShellClass()` |
| Input glass | `input-glass-conversation` on `ChatInputBar` |
| Layout authority | `lib/workspaceLayoutTokens.ts` · `lib/companionDesk/workspaceLayout.ts` |
| Spec | [Spec 109](./SPARK_FROSTED_CONVERSATION_WORKSPACE_FRAMEWORK.md) |
| CSS | `companion-chat.css` · `companion.css` · `cinematic-background.css` |

Post-welcome home must adopt this stack — not a new chat component.

---

## Intelligence-ready objects (unchanged rule)

Every object registers in `lib/intelligence/INTELLIGENCE_REGISTRY.md` with `IntelligenceReadyHooks`. V4 discovery and routing **consume** objects — they do not fork storage.

---

## Relationship to V3 freeze

| V3 (frozen) | V4 (extends) |
|-------------|--------------|
| Conversation specs 105–119 | Orchestration, discovery, welcome cinematic |
| Wisdom Layer 120–131 | Routing that serves wisdom, not replaces it |
| Observation Mode | Expanded eval framework |
| Gold Standards + CT tests | V4 gates (routing, discovery, speed) |

**Rule:** V4 architecture changes require evidence from [CONVERSATION_TEST_FRAMEWORK.md](./CONVERSATION_TEST_FRAMEWORK.md) — not single-session opinion. [Rule of Three](./SPARK_OBSERVATION_MODE.md) still applies to prompt changes.

---

## Implementation order (recommended)

Document first ✅ — then build in this sequence:

### Phase 1 — Belonging (weeks 1–2)

1. **Welcome Home cinematic** — refine dolly (exterior → door → foyer sequence per [WELCOME_HOME_FLOW.md](./WELCOME_HOME_FLOW.md))
2. **Founder audio script** — Estate, conversations, places, Discovery Key, Guide, Cards, Daily Discoveries
3. **Post-welcome frosted handoff** — wire `companion-workspace-frosted` + `input-glass-conversation` as standard exit state
4. **Returning member path** — persistence + replay from Profile

### Phase 2 — Discovery foundation (weeks 3–4)

5. **Discovery Key™** — object model, UI affordance, conversation triggers
6. **Estate Guide™** — guided tour state machine (conversation-led, not menu tour)
7. **Discovery registry** — map capabilities → discovery paths (see DISCOVERY_SYSTEM.md)
8. **Smart Suggestions** — one primary suggestion, max three choices

### Phase 3 — AI Orchestration (weeks 5–7)

9. **Capability Matrix** — internal types + routing table
10. **Router v1** — classify request → capability profile → provider adapter
11. **Model-agnostic response envelope** — Spark voice normalization layer
12. **Fallback chain** — primary → secondary → safe local reply

### Phase 4 — Quality gate (weeks 8–9)

13. **Pre-delivery evaluation** — extend OS 010 with V4 dimensions
14. **Automated CT runner** — CI smoke on CT-01, CT-05, CT-09, CT-10, CT-11
15. **Founder dashboard hooks** — internal only, not member-facing

### Phase 5 — Daily rhythm (weeks 10+)

16. **Daily Discoveries™** — one invitation, hospitality language
17. **Spark Card introductions** — via discovery, not library dump
18. **Cross-path validation** — every capability reachable 2+ ways

---

## Success measures (V4)

| Measure | Not the measure |
|---------|-----------------|
| Quality of next decision | Time in app |
| Relief after conversation | Feature count |
| Trust bank deposits | Model showcase |
| Discoverability without menus | Tutorial completion |
| Pre-delivery eval pass rate | Raw token volume |

---

## Related documents

| Doc | Purpose |
|-----|---------|
| [AI_CAPABILITY_MATRIX.md](./AI_CAPABILITY_MATRIX.md) | Internal model routing |
| [DISCOVERY_SYSTEM.md](./DISCOVERY_SYSTEM.md) | How capabilities surface |
| [WELCOME_HOME_FLOW.md](./WELCOME_HOME_FLOW.md) | First-launch journey |
| [CONVERSATION_TEST_FRAMEWORK.md](./CONVERSATION_TEST_FRAMEWORK.md) | Permanent QA |
| [SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md](./SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md) | What not to redesign |
| [ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md](./ENTREPRENEURIAL_TRANSFORMATION_CONSTITUTION.md) | Hero principle |

---

## Constitutional statement

Spark V4 builds **entrepreneurs** through **one companion** in **one place**.

Engineering serves belonging, clarity, and trust — never the other way around.

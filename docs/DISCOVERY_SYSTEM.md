# Discovery System — Spark V4

| Field | Value |
|-------|-------|
| **Status** | V4 foundation document |
| **Principle** | Members never need a feature map |
| **Parent** | [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md) |
| **Related** | [T-014 Ecosystem Connection](./ECOSYSTEM_CONNECTION_FRAMEWORK.md) · [Spec 131 Outcome Discovery](./SPARK_WISDOM_LAYER_FRAMEWORK.md) · [T-011 Spark Cards](./SPARK_CARD_FRAMEWORK.md) |

---

## Core philosophy

> **Members should discover capabilities gradually — through conversation and invitation — not through menus.**

Spark is one companion in one Estate. Features do not announce themselves. **Capabilities reveal when relevant.**

### The discovery promise

- No overwhelm on day one
- No "here are 47 tools" dashboards
- Every capability reachable **multiple ways**
- Discovery feels like **hospitality**, not marketing

---

## Discovery objects (member-facing)

| Object | Role | First introduced |
|--------|------|------------------|
| **Discovery Key™** | Unlocks one capability at a time — gentle, optional | Welcome Home founder audio |
| **Estate Guide™** | Conversation-led orientation through places | Welcome Home + post-welcome UI |
| **Spark Cards™** | Living entrepreneurial wisdom | Conversation + Daily Discoveries |
| **Daily Discoveries™** | One invitation per day — curiosity, not homework | After first week rhythm |
| **Smart Suggestions** | Contextual next step (max 3) | During conversation |
| **Conversation** | Primary discovery path — always | Immediate |
| **Direct Request** | "Help me plan my day" → capability | Immediate |
| **Search** | Find assets, memories, past work | When member asks |

---

## Seven discovery methods

### 1. Discovery Key™

**Metaphor:** A small key that opens one door at a time.

| Behavior | Rule |
|----------|------|
| Surfaces | One capability invitation |
| Timing | After welcome, or when Brain detects readiness |
| Language | "You might enjoy…" — never "You should use…" |
| Decline | Valid forever — no nagging |
| Storage | Intelligence-ready unlock record |

**V4 implementation target:** `lib/discovery/discoveryKey.ts` + corner icon (see Welcome Home)

### 2. Estate Guide™

**Metaphor:** A warm guide who walks beside you — not a slideshow.

| Behavior | Rule |
|----------|------|
| Format | Conversation-first; environment optional |
| Pace | One place per invitation |
| Exit | "Stay here" always valid |
| Replay | Profile → Welcome Home / Guide |

**Never:** "Opening the Conservatory…" · forced room switches

**Aligns with:** Spec 108 Environment Integration

### 3. Conversation

The **primary** discovery path.

Spark recognizes intent → offers capability → asks permission → proceeds.

Examples:

- "I'm overwhelmed" → support mode, maybe Clear My Mind invitation
- "I need a post" → Create conversation
- "What did we decide about pricing?" → Brain retrieval

### 4. Smart Suggestions

| Rule | Spec |
|------|------|
| One primary suggestion | T-003 |
| Max three choices | Universal Experience |
| Contextual only | Brain + journey stage |
| Dismissible | No guilt |

**Implementation:** suggestion bubbles on frosted surface — not sidebar promos.

### 5. Daily Invitation (Daily Discoveries™)

| Rule | Detail |
|------|--------|
| Frequency | One per day maximum |
| Tone | Curiosity — "something wonderful" |
| Skip | No streak penalty |
| Content | Spark Card, place, capability, reflection |

**Related:** [T-016 Daily Discoveries](./DAILY_DISCOVERIES_FRAMEWORK.md) (when published)

### 6. Direct Request

Member states goal in natural language. Spark routes ([AI_CAPABILITY_MATRIX.md](./AI_CAPABILITY_MATRIX.md)) and opens the right **place** — not the right "feature."

### 7. Search

Conversational retrieval first: "Show me my marketing plan."

Traditional search indexes Business Assets™, projects, memories — secondary UI.

---

## Capability registry (discovery view)

Every Spark capability registers **discovery metadata**:

```ts
type SparkCapabilityDiscovery = {
  id: string;
  label: string;           // member language — not engineering name
  placeLanguage: string;   // "the Library" not "content module"
  discoveryPaths: DiscoveryPath[];
  readinessSignals: string[];
  introCopy: string;       // one sentence, Shari voice
  permissionRequired: boolean;
};
```

### Example paths (each capability ≥ 2 paths)

| Capability | Path A | Path B | Path C |
|------------|--------|--------|--------|
| Plan My Day | Conversation | Discovery Key | Estate Guide stop |
| Clear My Mind | Conversation | Overwhelm signal | Smart Suggestion |
| Create™ | Direct request | Spark Card link | Daily Discovery |
| Peaceful Places | Discovery Key | Estate Guide | Fatigue signal |
| Spark Cards | Daily Discovery | Gallery | Conversation teach moment |
| Business Brain recall | Conversation | Search | Retrieval test CT-10 |

---

## Discovery timing (anti-overwhelm)

| Member stage | What surfaces |
|--------------|---------------|
| First 30 seconds | Welcome Home only — environment |
| First session | Frosted chat + three invitations |
| First week | Discovery Key + Guide icons; no feature dump |
| Established | Daily Discoveries + contextual suggestions |
| Returning after absence | Recovery flow (T-007) — not backlog guilt |

### Founder welcome audio introduces (once)

- Welcome to Spark Estate
- Spark is organized around **conversations and places**
- Capabilities appear over time
- Discovery Key™, Estate Guide™, Spark Cards™, Daily Discoveries™
- "Just tell Shari what you want to accomplish"

**Never overwhelm** — audio is calm; visuals stay minimal.

---

## UI affordances (V4)

| Affordance | Location | Visibility |
|------------|----------|------------|
| Discovery Key icon | Post-welcome, lower-left cluster | Fades in after welcome |
| Estate Guide icon | Post-welcome, lower-left cluster | Fades in after welcome |
| Frosted conversation | Center-bottom | Standard Spec 109 |
| Folded Estate map | Bottom-right (when enabled) | Optional — Spec 108 |
| Smart suggestions | Inside frosted panel | Contextual |

**Hidden on first launch:** sidebar, top bar, Google panel, dashboard chrome.

---

## Intelligence integration

| Engine | Discovery role |
|--------|----------------|
| Arrival Intelligence | Greeting + readiness — not feature list |
| Outcome Discovery (131) | Hoped success before solution |
| Opportunity Recognition (126) | Estate invite — permission only |
| Business Brain (117) | "You might need X again" — hospitality |
| Guidance Engine (005) | One natural next step |
| Performance Routing (09) | Don't activate all modules at once |

---

## Hospitality language (discovery copy)

| Instead of | Say |
|------------|-----|
| "Open Plan My Day" | "We could shape today together if you'd like." |
| "New feature unlocked!" | "Something opened up that might help." |
| "You haven't tried Create" | — (never guilt) |
| "Click here to learn" | "Want me to show you around?" |

Passes [Relationship Constitution](./RELATIONSHIP_CONSTITUTION.md) Shari test.

---

## Permissions

Discovery **proposes**. Member **decides**.

- Discovery Key opens an **invitation** — not auto-navigation
- Estate Guide asks before changing rooms
- Daily Discovery is one tap to accept or ignore
- Brain remembers readiness only with permission (112)

---

## Metrics (internal only)

| Measure | Purpose |
|---------|---------|
| Discovery acceptance rate | Which invitations resonate |
| Path diversity | Are capabilities found multiple ways? |
| Overwhelm signals | Decline + silence after dump |
| Time to first meaningful action | Belonging → momentum |

**Not measured:** streaks, badge counts, "features tried" leaderboards.

---

## Implementation order

1. Discovery metadata registry (`lib/discovery/registry.ts`)
2. Wire Welcome Home icons → Key + Guide handlers
3. Founder audio script aligned to discovery objects
4. Conversation triggers for top 10 capabilities
5. Daily Discoveries scheduler (one/day)
6. Cross-path audit — every capability ≥ 2 paths

---

## Related documents

- [WELCOME_HOME_FLOW.md](./WELCOME_HOME_FLOW.md)
- [SPARK_V4_ARCHITECTURE.md](./SPARK_V4_ARCHITECTURE.md)
- [ECOSYSTEM_CONNECTION_FRAMEWORK.md](./ECOSYSTEM_CONNECTION_FRAMEWORK.md)
- [SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md](./SPARK_ENVIRONMENT_INTEGRATION_FRAMEWORK.md)
- [ESTATE_ROOMS_FRAMEWORK.md](./ESTATE_ROOMS_FRAMEWORK.md)

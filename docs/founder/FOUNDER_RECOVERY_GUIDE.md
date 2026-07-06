# Founder Recovery Guide™

**Plain English — for Shari when direction feels confusing**

You do not need to rebuild everything. Most answers already live in one of a few places.

---

## Start here (60 seconds)

1. Open **Founder Studio** → **Founder Knowledge Vault™** (`/companion/founder/founder-knowledge-vault`)  
2. Open **Founder Document Index** (`docs/founder/FOUNDER_DOCUMENT_INDEX.md`)  
3. Read **Founder V1** (`docs/founder/FOUNDER_V1.md`) for the executive summary  

That is usually enough to remember what matters.

---

## Where the main docs live

| What | Where |
|------|--------|
| **Founder governance** | `docs/founder/` — constitutions, blueprints, roadmaps |
| **Master document index** | `docs/founder/FOUNDER_DOCUMENT_INDEX.md` |
| **Estate canon** | `docs/estate/` — Constitution, Bible, Living in Spark Estate |
| **Companion conversation law** | `docs/` — specs 100–131, freeze docs, voice rules |
| **Engineering blueprint** | `lib/intelligence/INTELLIGENCE_REGISTRY.md` |

---

## Where prompts live

| Type | Location |
|------|----------|
| **Founder room specs** | `docs/founder/EXECUTIVE_*.md`, `FOUNDER_*.md` |
| **GHL prompts** | `docs/founder-ghl-prompts.md` |
| **Companion conversation** | `docs/SPARK_CONVERSATION_*.md`, `docs/THE_FRIEND_WE_ALL_DESERVE.md` |
| **Cursor agent rules** | `.cursor/rules/*.mdc` |
| **Vault UI (sample index)** | `/companion/founder/founder-knowledge-vault` |

---

## Where Cursor rules live

`companion-app/.cursor/rules/`

The most important for protecting architecture:

- `founder-knowledge-vault.mdc` — check vault before duplicating docs  
- `the-friend-we-all-deserve.mdc` — how Spark speaks  
- `estate-architectural-authority.mdc` — estate canon wins over legacy code  
- `spark-conversation-architecture-frozen.mdc` — conversation stack is complete  

---

## Where Founder architecture lives

| Layer | Path |
|-------|------|
| **Rooms and routes** | `lib/founderStudio/rooms.ts` |
| **Executive engines** | `lib/executive*/` (Integration, Research, Judgment, etc.) |
| **Founder bridges** | `lib/founder/services/*Bridge.ts` |
| **UI** | `components/founderStudio/` |
| **Summary doc** | `docs/founder/FOUNDER_ARCHITECTURE_SUMMARY.md` |

**Executive Headquarters:** `/companion/founder/executive-command-center`  
**Mission Control (integrations):** `/companion/founder/executive-integration-center`  
**AI tools (extensions only):** `/companion/founder/ai-extensions-center`

---

## Where Companion architecture lives

| Layer | Path |
|-------|------|
| **Conversation engine** | `lib/sparkCoreIntelligence/conversationEngine/` |
| **Specs (frozen)** | `docs/SPARK_CONVERSATION_ARCHITECTURE_FREEZE.md` |
| **Voice** | `docs/SPARK_HUMAN_VOICE_RULES.md`, `docs/THE_FRIEND_WE_ALL_DESERVE.md` |
| **Estate UI** | `docs/SPARK_ESTATE_UI_PHILOSOPHY.md`, estate Bible |

Companion is **not** Founder. Different constitution for places vs. friendship.

---

## PostCraft / GoHighLevel integration notes

| Topic | Document / code |
|-------|-----------------|
| **Marketing flow** | `docs/founder/FOUNDER_MARKETING_ORCHESTRATION.md` |
| **Integration Center** | `docs/founder/EXECUTIVE_INTEGRATION_CENTER.md` |
| **GHL prompts** | `docs/founder-ghl-prompts.md` |
| **Live connection logic** | `lib/executiveIntegration/integrationConnection.ts` |
| **Dashboards** | `/ecosystem/dashboard` (PostCraft) · `/ghl/dashboard` (GHL) |

Founder orchestrates. PostCraft creates. GoHighLevel delivers.

---

## How to restore direction

1. **Stop adding features** — read `docs/founder/NO_FEATURE_CREEP.md`  
2. **Check the freeze** — `docs/founder/ARCHITECTURE_FREEZE.md`  
3. **Ask:** Does this pass the Founder Experience Constitution?  
4. **Ask:** Would this feel like software, or like running my company?  
5. **Use the vault** — if a doc already exists, extend it; do not duplicate  

---

## What NOT to rebuild

- Conversation architecture (Specs 105–131) — **frozen**  
- Wisdom layer (120–131) — **complete**  
- Founder V1 engine list — **frozen** unless override documented  
- Estate canon — **change implementation, not the Bible**  
- Duplicate constitutions or blueprints with slightly different names  

---

## Source of truth (priority order)

1. **Founder Experience Constitution™**  
2. **Founder Master Blueprint™** (SPARK Intelligence Blueprint)  
3. **Architecture Freeze** + **No Feature Creep**  
4. **Founder Document Index** (this ecosystem's map)  
5. **Intelligence Registry** (engineering)  
6. Sample data in code — **temporary until Phase 2 live connections**  

---

## If you are lost in code

Open Cursor with rule `founder-knowledge-vault.mdc` active.

Say: *"Read FOUNDER_RECOVERY_GUIDE and FOUNDER_DOCUMENT_INDEX before proposing changes."*

You are the hero. Founder organizes. Spark carries complexity.

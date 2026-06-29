# Intelligence Registry

**Internal only — never user-facing.**

Blueprint for the ADHD Business Ecosystem™. When a new intelligence engine ships in two or five years, the question is not "What data do we need?" but "Which registered objects does it enrich, and which hooks already exist?"

Maintain this document when adding **object types**, **storage keys**, or **intelligence engines**.

---

## The standard

| Principle | Meaning |
|-----------|---------|
| **Build once. Enrich forever.** | Same object evolves (thought → task → project). No duplication. |
| **Relationships over content** | Store edges, lineage, confidence — not only text fields. |
| **Invisible evolution** | Users use the companion; intelligence compounds quietly. |
| **Hooks today, engines tomorrow** | Optional fields in V1; engines consume them later without migrations. |

Shared hook shape: `lib/intelligence/intelligenceReadyTypes.ts` → `IntelligenceReadyHooks`

```ts
id, createdAt, updatedAt?,
originatedFromId, originatedFromKind?,
connectionIds?,           // Living Intelligence Graph
intelligenceMeta?         // per-engine enrichments — never bulk-expose in UI
```

---

## Sprint gate (every feature)

1. What is this object?
2. What relationships might it eventually have?
3. Which intelligence engines could benefit?
4. What metadata should exist now even if unused?
5. Will this support features we have not imagined?

If any answer is "unknown" — redesign before shipping.

---

## Object registry

### Core living objects

| Object | Kind | Primary storage | V1 user features | Future intelligence |
|--------|------|-----------------|------------------|---------------------|
| **Thought** | `thought` | `companionStore` → `BrainDumpEntry` | Clear My Mind capture, My Thoughts organize | Founder, Narrative, Opportunity, Content, Decision, Growth, Pattern, LIG |
| **Collection** | `collection` | `companion-thought-collections-v1` → `ThoughtCollection` | My Thoughts garden, many-to-many | LIG, Narrative themes, Mind Landscape |
| **Capture session** | `capture-session` | `captureSessionId` on thoughts + `clearMyMindIntelligence` | Continuous capture batches | Pattern, Recovery, Narrative rhythm |
| **Project** | `project` | `companionStore` → `Project` | Projects workspace, horizons | Business, Recovery, Pattern, Automation, Project |
| **Project item** | `project-item` | `companionStore` → `ProjectItem` | Sections, tasks, subtasks | Project, Growth, Automation |
| **Time block** | `time-block` | `companionStore` → `TimeBlock` | Plan My Day, calendar | Calendar, Recovery, Pattern, Growth |
| **Day state** | `day-state` | `companionStore` → `DayState` | Adjust My Day, energy | Recovery, Pattern, Arrival, Environment |
| **Conversation** | `conversation` | `companionStore` messages + chat API | Companion chat | Narrative, Relationship, Learning, Founder, Trust |
| **Conversation turn** | `conversation-turn` | `StoredMessage` | Thread history | All conversation-derived engines |
| **Decision** | `decision` | `lib/decision-intelligence/` | Decision Compass, support methods | Decision, Founder, Business, Narrative |
| **Opportunity** | `opportunity` | `lib/opportunity-intelligence/` | Opportunity surfacing (founder) | Opportunity, Business, Offer, Audience |
| **Relationship** | `relationship` | `lib/relationship-intelligence/` | People context, touchpoints | Relationship, Audience, Opportunity, Narrative |
| **Client avatar** | `client-avatar` | `companionStore` → `IdealClientAvatar` | AIRA, messaging | Audience, Offer, Content, Relationship |
| **Business profile** | `business-profile` | `companion-business-profile-v1` | Onboarding context | Business, Founder, Content, Offer |
| **Template** | `template` | `companionStore` → `TemplateItem` | Create, email, content | Content, PostCraft, Automation |
| **Snippet** | `snippet` | `companionStore` → `Snippet` | Reusable copy | Content, Automation |
| **Content draft** | `content-draft` | PostCraft / ecosystem APIs | Drafts, publishing | Content, SEO, Social, GHL |
| **Momentum event** | `momentum-event` | `companionStore` momentum | Movement XP (no streaks) | Growth, Recovery, Pattern |
| **Reminder** | `reminder` | `reminderAt` on thought + scheduling | Thought reminders | Calendar, Automation, Recovery |
| **Founder event** | `founder-event` | `lib/ecosystem/events` | Analytics, dashboard | Founder, Business, Ecosystem |
| **Intelligence signal** | `intelligence-signal` | `lib/intelligence-layer/signalStore` | Trust inspector (internal) | All engines via signal bus |

### Planned / partial (register before UI ships)

| Object | Kind | Notes | Future intelligence |
|--------|------|-------|---------------------|
| **Calendar event** | `calendar-event` | Google Workspace bridge | Calendar, Relationship, Automation |
| **Document** | `document` | Uploads, Google docs | Learning, Content, Business |
| **Voice session** | `voice-session` | TTS / voice companion | Narrative, Learning, Relationship |
| **Journal entry** | `journal-entry` | `lib/growthJournalStore.ts` — Growth primary DB (private reflection) | Narrative, Recovery, Founder, Growth |
| **Portfolio entry** | `project` | `lib/growthPortfolioStore.ts` — Growth primary DB (creative work) | Growth, Content, Narrative, LIG |
| **Growth capture** | `capture-session` | `lib/growthCapture/` — universal inbox before filing | Growth, Arrival, Companion Presence |
| **Evidence entry** | `document` | `lib/evidenceBankStore.ts` — proof archive | Growth, Business, Pattern, LIG |
| **Asset** | `document` | `lib/assetLibrary/` — single store for uploads; referenced by Portfolio, Evidence, Journal, Capture, Wins, Journey, Reports | Growth, Content, Business, LIG |
| **Gallery memory** | `gallery-memory` | `lib/gallery/` — experiential wall frames (curated from growth + asset library) | Narrative, Growth, Environmental Experience |
| **Peaceful place** | `peaceful-place` | `lib/peacefulPlaces/` — immersive estate destinations (Covered Deck™, Cozy Café™, Nature Escape™, etc.) with workspace-safe zones, layered audio spec, image brief | Environment, Recovery, Narrative, Companion Presence |
| **Garden banner menu item** | `garden-menu-destination` | `lib/peacefulPlaces/gardenBannerMenu.ts` — curated cloth-tag menus per path sign; future Arrival may warm-glow a recommended banner without forcing navigation | Arrival, Companion Presence, Recovery |
| **Offer** | `offer` | Product / service definitions | Offer, Audience, Opportunity |
| **Automation rule** | `automation` | GHL / workflow hooks | Automation, Business |

---

## Intelligence engine registry

| Engine | Code home (primary) | Consumes objects | Writes to |
|--------|---------------------|------------------|-----------|
| **Living Intelligence Graph** | `lib/arrivalIntelligence/livingIntelligenceGraph.ts`, thought `connectionIds` | Thought, Collection, Project, Relationship, Decision | `connectionIds`, `intelligenceMeta.living-intelligence-graph` |
| **Narrative Intelligence** | `lib/arrivalIntelligence/narrativeContext.ts` | Conversation, Thought, Project, Day state | `intelligenceMeta.narrative` |
| **Arrival Intelligence** | `lib/arrivalIntelligence/` | Day state, LIG arrivals, last activity | Greeting, home — not raw user data |
| **Companion Presence** | `lib/companionPresence/` | Conversation, emotional state, workspace | Presence copy only |
| **Founder Intelligence** | `lib/ecosystem/intelligence/`, founder workspace | Events, opportunities, decisions, projects | Founder dashboard, reports |
| **Decision Intelligence** | `lib/decision-intelligence/` | Decision, loops, cognitive load | `decisionStore`, support methods |
| **Opportunity Intelligence** | `lib/opportunity-intelligence/` | Opportunities, business profile, relationships | `opportunityStore` |
| **Business Intelligence** | `lib/ecosystem-intelligence/`, business profile | Profile, projects, content, revenue signals | Ecosystem snapshot |
| **Growth Intelligence** | `lib/momentum-intelligence/`, momentum events | Momentum, projects, thoughts handled | Momentum signals |
| **Recovery Intelligence** | `lib/recovery-intelligence/` | Day state, overwhelm, return patterns | Recovery insights |
| **Pattern Intelligence** | `lib/loop-intelligence/`, pattern awareness prefs | Loops, struggles, time-of-day | Loop store, signals |
| **Relationship Intelligence** | `lib/relationship-intelligence/` | Relationship, conversation, thoughts (person) | `relationshipStore` |
| **Content Intelligence** | PostCraft, templates, snippets | Template, draft, avatar | Content suggestions |
| **Learning Intelligence** | `lib/intelligence-layer/learningGates.ts` | Signals, trust, outcomes | Profile evolution |
| **Automation Intelligence** | GHL, ecosystem actions | Projects, content, calendar | External + events |
| **Project Intelligence** | `lib/founderWorkspace/intelligence/` | Project, items, time blocks | Project brain API |
| **Calendar Intelligence** | Google calendar routes, time blocks | Time block, reminder | Scheduling |
| **Audience Intelligence** | Avatars, business profile | Client avatar, profile | Messaging, offers |
| **Offer Intelligence** | Opportunity + business | Offer (planned), avatar | Opportunity engine |
| **Environment Intelligence** | `lib/environment-intelligence/` | Day state, workspace context | Environment scoring |
| **Environmental Experience Intelligence** | `lib/gallery/environmentExperience.ts` | Gallery visit, season, time, weather | Estate atmosphere, lighting, audio layers |
| **Homestead Room Architecture** | `lib/companionHomestead/homesteadRoomRegistry.ts` | App section, place id, room shell | Permanent background + signature motion per room |
| **Gallery Demo Mode** | `lib/gallery/galleryDemoMode.ts`, `galleryDemoCatalog.ts` | Scripted journey scenes (no user PII) | Demo exhibitions only |
| **Gallery Curator Intelligence** | `lib/gallery/galleryCuratorIntelligence.ts` | Gallery memory archive, signals, rotation | Today's visible exhibition (12–20) |
| **Reflection Intelligence** | `lib/gallery/galleryReflectionIntelligence.ts` | Journal entries (private) | Wall wisdom — meaning without copied text |
| **Clear My Mind Intelligence** | `lib/clearMyMindIntelligence.ts` | Capture sessions, thoughts | LIG ingest (silent) |
| **Relief Intelligence** | `lib/reliefIntelligence.ts` | Capture behavior signals (voice, rhythm, return) | Companion voice tone only — never UI |
| **Ecosystem Intelligence** | `lib/ecosystemIntelligence.ts` | Cross-domain snapshot | Whole-system insight |
| **Trust / signal bus** | `lib/intelligence-layer/` | Chat, features, emotions | `IntelligenceSignal` store |

---

## Homestead rooms (companion home)

Canonical catalog: `lib/companionHomestead/homesteadRoomRegistry.ts` → `COMPANION_HOMESTEAD_ROOMS`

| Room | Purpose | Background | Signature motion | Sections |
|------|---------|------------|------------------|----------|
| Living Room | Everyday conversation | Cozy room + window (homestead scene) | Time-of-day lighting | `home`, `today`, `welcome-room` |
| Sunroom | Focus My Brain | Butterfly video + plants | Butterflies drifting | `focus` |
| Game Room | Momentum Games | Game room plate | Playful ambient | `games`, `activities` |
| Library | Learning | Warm bookshelves / reading nook | Dust motes, page-turn | `how-do-i` |
| Study | Planning | Elegant office | Morning light on desk | `plan-my-day`, `time-block` |
| Peaceful Places | Regulation | Chosen destination | Nature-specific (rain, waves, leaves, snow) | `focus-audio`, `breathe` |

Living Room lighting: `lib/homesteadScene/`. Signature motion layers: `HomesteadRoomSignatureMotion` + `homestead-room-motion.css`.

---

```
Thought ──collection──► Collection
   │                        │
   ├──projectId──────────► Project ──items──► ProjectItem
   ├──connectedPerson───► Relationship (string today; id future)
   ├──reminderAt────────► Reminder / TimeBlock
   ├──connectionIds─────► LIG edges (future typed connections)
   └──originatedFrom────► Thought | Conversation | … (evolution lineage)

Conversation ──signals──► IntelligenceSignal ──► all engines
FounderEvent ──refs──────► Project | Thought | Workspace
```

**Evolution without duplication:** `originatedFromId` + `originatedFromKind` when a thought becomes a project item, decision, or content draft.

---

## Storage index (local-first V1)

| Key / module | Object kinds |
|--------------|--------------|
| Brain dump list (`companionStore`) | `thought` |
| `companion-thought-collections-v1` | `collection` |
| Projects / items keys in `companionStore` | `project`, `project-item` |
| Time blocks, day state keys | `time-block`, `day-state` |
| Chat / messages keys | `conversation`, `conversation-turn` |
| `companion-business-profile-v1` | `business-profile` |
| Avatar list in `companionStore` | `client-avatar` |
| `lib/decision-intelligence/decisionStore` | `decision` |
| `lib/opportunity-intelligence/opportunityStore` | `opportunity` |
| `lib/relationship-intelligence/relationshipStore` | `relationship` |
| `lib/intelligence-layer/signalStore` | `intelligence-signal` |
| `companion-living-graph-arrivals-v1` | LIG arrival slice |
| `lib/ecosystem/events` | `founder-event` |
| `lib/gallery/` (planned persistence) | `gallery-memory`, gallery visit state |

### Life Area Intelligence (`classifyLifeArea`)

| Engine | Reads | Writes |
|--------|-------|--------|
| `classifyLifeArea` | task text, corrections, projects, contacts | — |
| Learning layer | corrections store | `companion-life-area-learning-v1` |
| Smart Life Areas | plan item titles | user life areas on accept |

Docs: `docs/plan-my-day/LIFE_AREA_INTELLIGENCE.md`

---

## Adding a new object (checklist)

- [ ] Add row to **Object registry** above
- [ ] Extend `EcosystemObjectKind` in `intelligenceReadyTypes.ts` if new kind
- [ ] Type includes `IntelligenceReadyHooks` fields (or subset with comment)
- [ ] Document storage key and ingest/event hook
- [ ] List which engines **read** vs **write**
- [ ] V1 UI uses only user-facing fields
- [ ] No second table for the same conceptual thing

---

## Adding a new intelligence engine (checklist)

- [ ] Add row to **Intelligence engine registry**
- [ ] Add `IntelligenceEngineId` key
- [ ] Declare which objects it reads (registry rows)
- [ ] Declare write target: `intelligenceMeta.<engine>` and/or signal bus
- [ ] Never require users to re-enter or reconnect existing data
- [ ] Ship behind calm surface — Intelligence Paradox

---

*Last aligned with: My Thoughts visual architecture, Clear My Mind continuous capture, `BrainDumpEntry` LIG hooks.*

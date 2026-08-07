# Chamber Intelligence System — Proposed Architecture

| Field | Value |
|-------|-------|
| **Status** | **Architecture proposal — no runtime changes made.** Awaiting approval. |
| **Date** | 2026-08-07 |
| **Scope** | Make the 24 Chamber experts reliable sources of high-quality guidance |
| **Constraints honored** | No separate agents · no separate chat engines · no new rooms · strengthen existing Chamber architecture |
| **Related** | `CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md` · `CHAMBER_ACTIVATION_PHASE_C_PREFLIGHT_REVIEW.md` · `CHAMBER_EXPERTISE_CONTRIBUTION_TESTS.md` · `CHAMBER_ACTIVATION_PHASE_D_COLLABORATION_LANGUAGE.md` |

---

## 0. The headline finding

**Most of the intelligence you're asking for already exists — as authored markdown, unreachable at runtime.**

Every one of the 24 Expert Intelligence Profiles already contains a Proven Framework Library (§4, five frameworks each with Purpose / When / How Spark explains it / ADHD application / Example), an ADHD Founder Intelligence Layer (§6), an ADHD-Friendly Adaptations table (§7, traditional → why it fails → Spark adaptation → why better), Signature Questions (§5), and Research Intelligence (§10, including trusted source types and evidence standards).

None of that reaches the model today. The runtime registry (`chamberExpertRegistry.ts`) carries only an activation digest: name, thinking pattern, activation signals, expertise areas, relationships, intent/estate affinities.

**So this is not a "write new expert knowledge" project. It is a "make authored knowledge selectively reachable at runtime, without blowing the prompt budget" project.** That reframing drives every decision below.

### The constraint that shapes the design

Measured on the current branch:

| Request | Current Chamber hint size |
|---------|----------------------------|
| "I need to create a client onboarding process." | 1,714 chars (~430 tokens) |
| "I want to build a business strategy." | 2,405 chars (~600 tokens) |

That is *before* adding frameworks, knowledge sources, or ADHD translations. Naively attaching all of §4 + §6 + §7 + §10 for a primary plus three supporting experts would produce a 6,000–10,000 token block on every qualifying turn — expensive, slow, and self-defeating: a model given fifty considerations reverts to generic listing, which is the exact failure mode this work exists to prevent.

**Therefore the central architectural problem is selection, not storage.**

---

## 1. Current-state audit

| Component | Where | Status | Role in new architecture |
|-----------|-------|--------|---------------------------|
| `chamberExpertRegistry` | `lib/chamberExpertise/chamberExpertRegistry.ts` | Live — 24 entries, activation digest | **Stays thin.** Becomes the activation layer only |
| `chamberExpertiseHintForChat` | `lib/chamberExpertise/chamberExpertiseHintForChat.ts` | Live — thinking pattern + themes + collaboration bridge | **Becomes a composer** over selected intelligence, not the owner of it |
| `resolveChamberExpertActivation` | `lib/chamberExpertise/resolveChamberExpertActivation.ts` | Live — multi-signal fusion, anti-keyword-only | Unchanged. Still answers "who helps?" |
| `chamberCollaborationBridgeLine` | `lib/chamberExpertise/chamberCollaborationLanguage.ts` | Live — Phase D fusion language | Unchanged |
| Expert Thinking Patterns | 24 profiles §2 + registry field | Live — **one sentence each** | **Expand** to structured multi-facet (see §4.2) |
| Framework libraries | 24 profiles §4 (markdown) | Authored, **not runtime** | **Compile** into intelligence modules |
| ADHD layers | 24 profiles §6/§7 (markdown) | Authored, **not runtime** | **Compile** into translation rules |
| Research intelligence | 24 profiles §10 (markdown) | Authored, **not runtime** | **Compile** into knowledge-source records |
| Signature questions | 24 profiles §5 (markdown) | Authored, **not runtime** | **Compile**, selected 1 per turn |
| Knowledge Fingers | Uploaded specs only | **No runtime, by prior decision** | Stays a *concept*, realized as fields — not a system (§3) |
| Spark Experience Library | Member Journey Library, Spec 103 | Validation layer, not runtime | Unchanged — validates output quality, doesn't select content |
| Work Recognition | `intentRoutingIntelligence.ts` (`IntentCategory`), `estateBrain` route | Live | Unchanged — feeds activation, now also feeds framework selection |
| Universal Reasoning Journey | Not implemented under that name; `lib/universalCreation/` is the live journey | Live (creation journey) | Unchanged — owns *outcome*, consumes expertise |

---

## 2. Overlap analysis (the question you asked me to answer first)

| Pair | Overlap? | Resolution |
|------|----------|------------|
| Chamber Expert ↔ Knowledge Finger | **High risk.** Both claim "how an expert thinks" | Finger becomes a **field set inside** the expert intelligence module (thinking pattern + frameworks). **Do not build a Finger runtime.** Reaffirms the prior decision recorded in `BUSINESS_BUILD_ROLE_DEFINITION.md` §7 |
| Chamber Expert ↔ Spark Experience Library | None | Library *validates* experience quality; Chamber *supplies* domain substance. Different layers |
| Chamber Expert ↔ Work Recognition | None (clean consumer relationship) | Work Recognition classifies the request; Chamber consumes that classification. Already wired |
| Chamber Expert ↔ Universal Reasoning/Creation Journey | None if boundaries hold | Journey owns the **outcome and stages**; Chamber owns the **lens**. Risk only if Build Types start authoring their own expert questions — guard in §11 |
| Framework Library ↔ Create Build Types | **Medium risk.** Both hold "how to produce X" | Build Type = artifact *structure* (sections, completion criteria). Framework = *reasoning* move (Promise–Proof–Path). A Build Type may cite a framework; it must not redefine one |
| Knowledge Sources ↔ existing research routing | **Medium risk.** Estate Brain already routes research (`research.known/current/deep/monitor`) | Chamber supplies *what would need checking and what counts as evidence*; Estate Brain still owns *how research runs*. **No second research engine** |
| Chamber registry ↔ Estate Brain `expertRegistry` (15) ↔ Phase 33 (6) | **Known pre-existing duplication** | Unchanged here. Alias map exists; consolidation remains deferred Phase E |

### The four-layer separation you asked me to define

| Layer | Question it answers | Owner | Must not own |
|-------|---------------------|-------|--------------|
| **Chamber Expert** | *Who helps?* | `resolveChamberExpertActivation` + activation registry | Frameworks, journey stages, research execution |
| **Knowledge Finger** | *What intelligence is available?* | **Fields inside the expert intelligence module** — thinking pattern, frameworks, questions, ADHD rules | Its own runtime, its own registry, its own activation path |
| **Research** | *What current information is needed?* | Chamber declares triggers + evidence standard; **Estate Brain executes** | Becoming a second research engine or fetching sources itself |
| **Build Journey** | *What outcome is being created?* | `lib/universalCreation/` (Build Types, stages, completion) | Domain expertise content — it consumes, never authors |

---

## 3. Proposed architecture

```
                    Work Recognition (existing, live)
              IntentCategory · Estate capability · topic
                              │
                              ▼
        ┌─────────────── ACTIVATION LAYER (existing, thin) ───────────────┐
        │  chamberExpertRegistry (24 digests)                              │
        │  resolveChamberExpertActivation → { primary, supporting,         │
        │                                     possible, confidence }       │
        └──────────────────────────────┬───────────────────────────────────┘
                                       │ activated expert ids only
                                       ▼
        ┌──────────── INTELLIGENCE LAYER (new, deep, per-expert) ─────────┐
        │  chamberIntelligence/experts/<PREFIX>.ts                         │
        │    · thinkingPattern (expanded, multi-facet)                     │
        │    · frameworks[]        (each with its own selection triggers)  │
        │    · signatureQuestions[]                                        │
        │    · adhdTranslations[]  (traditional → adapted)                 │
        │    · knowledgeSources    (research triggers + evidence standard) │
        └──────────────────────────────┬───────────────────────────────────┘
                                       │ everything available
                                       ▼
        ┌──────────────── SELECTION LAYER (new — the real work) ──────────┐
        │  selectExpertContribution(expert, request, budget)               │
        │    picks: 1 thinking facet · 1–2 frameworks · 1 question         │
        │           · 0–2 ADHD translations · research flag (bool)         │
        │    under a hard token budget                                     │
        └──────────────────────────────┬───────────────────────────────────┘
                                       ▼
        ┌──────────── COMPOSITION LAYER (existing, extended) ─────────────┐
        │  chamberExpertiseHintForChat + chamberCollaborationBridgeLine    │
        │  → one internal hint in the existing intentHint stack            │
        └──────────────────────────────┬───────────────────────────────────┘
                                       ▼
                        One Shari response. No announced experts.
```

### Why this shape

1. **Activation stays hot and cheap.** All 24 digests load on every turn for matching; the deep modules are only *read* for the 1–4 experts that activated.
2. **Selection is a first-class layer, not an afterthought.** This is what prevents the "fifty considerations → generic list" failure and keeps the prompt affordable.
3. **Composition already exists.** No new hint plumbing, no new engine — `chamberExpertiseHintForChat` gains richer input, not a new job.
4. **Every new concept lands as a field inside an existing owner.** Nothing here becomes a parallel system.

### Prompt budget (proposed, enforceable in tests)

| Element | Budget |
|---------|--------|
| Primary expert block | ≤ 220 tokens |
| Each supporting expert block | ≤ 90 tokens |
| Collaboration bridge | ≤ 60 tokens |
| Guardrail footer | ≤ 90 tokens (fixed) |
| **Hard cap, whole Chamber hint** | **≤ 550 tokens** |

Roughly the current ceiling — so this adds *substance density*, not prompt weight. A test asserts the cap.

---

## 4. Data models

Proposed as new types in `lib/chamberIntelligence/types.ts`. The existing `ChamberExpertRegistryEntry` is **unchanged**.

### 4.1 Expert intelligence module (the new deep record)

```ts
export type ChamberExpertIntelligence = {
  id: ChamberExpertId;                 // reuses existing canonical prefix
  thinkingPattern: ExpertThinkingPattern;
  frameworks: readonly ExpertFramework[];
  signatureQuestions: readonly ExpertQuestion[];
  adhdTranslations: readonly AdhdTranslation[];
  knowledgeSources: ExpertKnowledgeSources;
  /** Source of truth for humans; drift-checked in tests. */
  profilePath: string;
};
```

### 4.2 Expanded thinking pattern (replaces the single sentence)

Your example — *Systems: notices repeated friction · finds unnecessary decisions · creates repeatable paths · looks for missing handoffs* — is four distinct facets, not one sentence. Modeled accordingly, so the selector can surface the facet that fits the request:

```ts
export type ExpertThinkingPattern = {
  /** One-line signature move (existing registry field, retained). */
  summary: string;
  /** What this expert sees that others miss. */
  notices: readonly string[];
  /** What it actively looks for and often finds. */
  finds: readonly string[];
  /** What it builds/protects as a result. */
  creates: readonly string[];
  /** Absences it checks for — the "missing handoff" class. */
  checksForMissing: readonly string[];
};
```

### 4.3 Framework (structure that can grow — no hardcoded advice)

```ts
export type ExpertFramework = {
  id: string;                          // "promise-proof-path"
  name: string;                        // "Promise–Proof–Path"
  category: string;                    // "positioning" | "messaging" | ... (per-expert vocabulary)
  purpose: string;
  /** Selection triggers — when this framework earns its place this turn. */
  whenToUse: readonly string[];
  /** How Spark explains it in plain language (never jargon-dumped). */
  sparkExplanation: string;
  /** Required: how it changes for an ADHD founder. */
  adhdApplication: string;
  example: string;
  /** Optional provenance. Absent = Spark-original, and that's fine. */
  origin?: { kind: "spark" | "established" | "adapted"; note?: string };
};
```

**Category vocabularies are per-expert and open-ended** (Marketing: positioning / audience research / messaging / offers / content strategy / customer journey; Systems: SOP creation / workflow design / automation / documentation / process improvement; Events: attendee journey / experience design / agenda architecture / logistics / engagement). New categories require no schema change.

### 4.4 ADHD translation layer (required on every expert)

```ts
export type AdhdTranslation = {
  id: string;
  /** The conventional recommendation this replaces. */
  traditional: string;
  /** Why it tends to fail for an ADHD founder — specialty-specific, never generic. */
  whyItFails: string;
  /** What Spark offers instead. */
  sparkAdaptation: string;
  whyBetter: string;
  /** Triggers so it's applied only when relevant. */
  appliesWhen: readonly string[];
};
```

This directly encodes your example: traditional *"Create a detailed 90-day marketing calendar"* → adaptation *"Before creating a large plan, let's create a simple system you can realistically maintain."*

### 4.5 Knowledge sources (architecture only — no external connections)

```ts
export type ExpertKnowledgeSources = {
  /** Topics in this domain that go stale and may need current information. */
  volatileTopics: readonly string[];
  /** Types of sources this expert trusts. Types, not URLs — no fetching in v1. */
  trustedSourceTypes: readonly string[];
  /** What counts as enough evidence to move. */
  evidenceStandard: string;
  /** When to hand off to the existing research capability. */
  researchTriggers: readonly string[];
};
```

**No fetching, no crawling, no source registry with live URLs.** When a research trigger fires, the selector sets a boolean flag and the *existing* Estate Brain research routing decides what actually happens.

### 4.6 Selection output (what the composer receives)

```ts
export type SelectedExpertContribution = {
  expertId: ChamberExpertId;
  role: "primary" | "supporting";
  thinkingFacets: readonly string[];        // 1–3, chosen by fit
  frameworks: readonly ExpertFramework[];   // 0–2 primary, 0–1 supporting
  question?: ExpertQuestion;                // at most one per turn, total
  adhdTranslations: readonly AdhdTranslation[]; // 0–2
  researchSuggested: boolean;
  estimatedTokens: number;                  // enforced against budget
};
```

---

## 5. File structure

```
lib/chamberExpertise/                 ← EXISTING, unchanged (activation)
  chamberExpertRegistry.ts
  resolveChamberExpertActivation.ts
  chamberCollaborationLanguage.ts
  chamberExpertiseHintForChat.ts      ← extended to compose selections
  legacyExpertAliasMap.ts
  types.ts

lib/chamberIntelligence/              ← NEW (deep intelligence)
  types.ts                            ← models in §4
  index.ts
  selectExpertContribution.ts         ← the selection layer
  intelligenceRegistry.ts             ← id → module lookup
  experts/
    MKT.ts   SYS.ts   EVT.ts   STR.ts   CR.ts   FIN.ts
    SALES.ts CNT.ts   PM.ts    AI.ts    RES.ts  ...  (24 total)
  __tests__/
    selection.test.ts
    budget.test.ts
    profileDrift.test.ts              ← markdown ↔ runtime consistency
    contributionQuality.test.ts       ← extends Phase C.5 tests
```

One file per expert keeps diffs reviewable and lets the 24 be migrated incrementally — a half-migrated state is valid (see §6).

---

## 6. Migration plan

Each phase is independently revertible and leaves the system working.

| Phase | Work | Runtime behavior change |
|-------|------|--------------------------|
| **I-1** | Types + empty registry + selector with a null-safe fallback. No expert modules yet. | **None** — selector returns nothing; hint unchanged |
| **I-2** | Migrate **3 pilot experts** (Marketing, Systems, Events — the three with quality tests) from markdown §4/§5/§6/§7/§10 into modules. Selector live but **behind a per-expert opt-in list**. | Only those 3 produce enriched hints |
| **I-3** | Quality review of pilot output against Phase C.5 contribution tests + budget cap. **Approval gate.** | None (review only) |
| **I-4** | Migrate remaining 21 experts in batches of ~7. | Enriched hints per migrated expert |
| **I-5** | Expand thinking patterns from one sentence to the four-facet model (§4.2) across all 24. Registry `expertThinkingPattern` retained as `summary`. | Richer facet selection |
| **I-6** | Drift tests + budget tests enforced in CI. Remove the opt-in list. | Full system on |

**Fallback guarantee at every phase:** if an expert has no intelligence module, `chamberExpertiseHintForChat` behaves exactly as it does today (thinking-pattern summary + expertise themes). No expert is ever worse off mid-migration.

### Source-of-truth policy

Markdown profiles remain the **human** source of truth; compiled modules are the **runtime** source. `profileDrift.test.ts` asserts every runtime framework name and ADHD translation appears in its markdown profile, so the two cannot silently diverge. (Auto-generation from markdown was considered and rejected for v1 — the markdown is prose-formatted for humans, and a parser would be a fragile new dependency for a one-time migration.)

---

## 7. Example: Marketing Intelligence Profile (`experts/MKT.ts`)

Content drawn from the existing `MKT_Expert_Intelligence_Profile.md` — this is compilation, not invention.

```ts
export const MKT_INTELLIGENCE: ChamberExpertIntelligence = {
  id: "MKT",
  thinkingPattern: {
    summary:
      "Notices when a message is technically true but unclear to a stranger. Connects what the audience actually needs to what the offer already provides — before reaching for more channels.",
    notices: [
      "unclear positioning",
      "messages that make sense only to the founder",
      "channel count rising while inquiries stay flat",
    ],
    finds: [
      "the gap between what the audience needs and what the offer says",
      "vanity metrics that change no decision",
    ],
    creates: ["one clear promise", "one channel home", "one finishable experiment"],
    checksForMissing: ["a next step after someone becomes interested", "proof a stranger would believe"],
  },

  frameworks: [
    {
      id: "promise-proof-path",
      name: "Promise–Proof–Path",
      category: "positioning",
      purpose: "Tighten marketing to something buyable.",
      whenToUse: ["posts get likes but no inquiries", "message is mushy", "offer is invisible"],
      sparkExplanation:
        "What you promise, why they should believe you, and the next step they take.",
      adhdApplication: "Three anchors — easy to restart after a gap.",
      example: "Promise = calmer client onboarding · Proof = case story · Path = book a 20-min call.",
    },
    {
      id: "one-channel-home",
      name: "One Channel Home",
      category: "content strategy",
      purpose: "End multi-platform burnout.",
      whenToUse: ["guilt across 4+ networks", "posting everywhere, landing nowhere"],
      sparkExplanation:
        "We'll pick the home where your people already listen — everything else is optional.",
      adhdApplication: "Reduces decision load and context switching.",
      example: "Newsletter home; social only to point back.",
    },
    {
      id: "30-day-experiment",
      name: "30-Day Marketing Experiment",
      category: "audience research",
      purpose: "Replace fantasy annual plans.",
      whenToUse: ["'I need a marketing plan'", "low consistency history", "unclear what works"],
      sparkExplanation:
        "One hypothesis, one channel, one offer, one number that tells us if it worked.",
      adhdApplication: "Novelty with a finish line; learnable.",
      example: "8 personal outreach notes/week for 30 days → track conversations booked.",
    },
    // + trust-asset-ladder (offers), soft-launch-loop (customer journey)
  ],

  signatureQuestions: [
    { id: "repeat-back", text: "If someone repeated your offer back to a friend, what sentence do you hope they'd use?", reveals: "positioning clarity" },
    { id: "warm-attention", text: "Where do you already have warm attention you're underusing?", reveals: "channel fit" },
  ],

  adhdTranslations: [
    {
      id: "no-12-month-calendar",
      traditional: "Create a detailed 90-day (or 12-month) marketing calendar.",
      whyItFails:
        "Built in a hyperfocus weekend, abandoned by week three; the abandoned plan then becomes evidence of failure.",
      sparkAdaptation:
        "Before the big plan, build the simple version you can realistically maintain — one 30-day experiment with one metric.",
      whyBetter: "Finishable, learnable, and restartable without shame.",
      appliesWhen: ["marketing plan", "content calendar", "quarterly plan"],
    },
    {
      id: "no-post-everywhere",
      traditional: "Post daily on all platforms.",
      whyItFails: "Executive-function collapse; the streak becomes the goal instead of the conversation.",
      sparkAdaptation: "One channel home, batch-friendly, quiet weeks allowed with a written way back in.",
      whyBetter: "Presence without fracture.",
      appliesWhen: ["visibility", "consistency", "posting"],
    },
  ],

  knowledgeSources: {
    volatileTopics: ["platform features and reach", "ad benchmarks", "search/algorithm behavior"],
    trustedSourceTypes: [
      "the member's own customer language (calls, emails, reviews)",
      "platform-native documentation",
      "recent competitor positioning",
      "reputable industry benchmark reports",
    ],
    evidenceStandard:
      "Enough to improve the message or design the experiment — never a reason to delay showing up.",
    researchTriggers: ["channel norms may have changed", "pricing/ad costs cited", "competitor claim needs checking"],
  },

  profilePath: "docs/.../MKT_Expert_Intelligence_Profile.md",
};
```

## 8. Example: Systems Intelligence Profile (`experts/SYS.ts`) — abridged

```ts
thinkingPattern: {
  summary: "Notices friction before the founder names it. Reduces repeated decisions into a written path. Creates the repeatable route once, so willpower is never the plan again.",
  notices: ["repeated friction", "work that depends on memory", "tools multiplying without a flow"],
  finds: ["unnecessary decisions being re-made weekly", "the step that always gets skipped when rushed"],
  creates: ["repeatable paths", "load-bearing checklists", "a single home for the process"],
  checksForMissing: ["handoffs", "a defined 'done'", "what happens before and after the work"],
},
frameworks: [
  { id: "mvp-process",       category: "SOP creation",        name: "Minimum Viable Process", whenToUse: ["recurring chaos", "new service delivery"], /* ... */ },
  { id: "trigger-path-done", category: "workflow design",     name: "Trigger–Path–Done",      whenToUse: ["I forget to begin", "no clear start"], /* ... */ },
  { id: "load-bearing-list", category: "documentation",       name: "Load-Bearing Checklist", whenToUse: ["quality slips when rushed"], /* ... */ },
  { id: "exception-ladder",  category: "process improvement", name: "Exception Ladder",       whenToUse: ["overbuilding for rare cases"], /* ... */ },
  { id: "boredom-survival",  category: "process improvement", name: "Boredom Survival Design",whenToUse: ["history of abandoned systems"], /* ... */ },
],
adhdTranslations: [
  { id: "no-sop-library-first", traditional: "Document everything / build the full SOP library.",
    whyItFails: "Overwhelm → avoidance; nothing gets written at all.",
    sparkAdaptation: "One MVP process for the hottest pain, in ≤7 steps.",
    whyBetter: "Momentum and relief, and it actually gets used.",
    appliesWhen: ["documentation", "SOP", "process"] },
],
knowledgeSources: {
  volatileTopics: ["tool pricing and features", "automation capabilities", "compliance checklists"],
  trustedSourceTypes: ["vendor documentation", "peer founder ops notes", "one trusted review"],
  evidenceStandard: "Research picks the tool only after the process is clear.",
  researchTriggers: ["choosing a platform", "automation limits", "integration questions"],
},
```

## 9. Example: Events Intelligence Profile (`experts/EVT.ts`) — abridged

```ts
thinkingPattern: {
  summary: "Notices the transformation guests are meant to feel before building the agenda. Designs the experience arc, logistics, energy, and ADHD-friendly pacing so the event feels held from invitation through aftercare.",
  notices: ["the agenda being built before the transformation is named", "pacing that ignores human energy"],
  finds: ["the moment attendees decide whether they belong", "the logistics gap that becomes day-of panic"],
  creates: ["an experience arc", "a run of show", "recovery space in the schedule"],
  checksForMissing: ["aftercare", "quiet/decompression options", "who is responsible on the day"],
},
frameworks: [
  { id: "transformation-first", category: "attendee journey",   name: "Transformation Before Agenda", whenToUse: ["planning an event", "building an agenda too early"], /* ... */ },
  { id: "experience-arc",       category: "experience design",  name: "Arrival → Arc → Aftercare",     whenToUse: ["multi-day event", "retreat"], /* ... */ },
  { id: "run-of-show",          category: "logistics",          name: "Run of Show",                   whenToUse: ["day-of coordination", "multiple moving parts"], /* ... */ },
  { id: "energy-budget",        category: "engagement",         name: "Energy Budget",                 whenToUse: ["multi-day", "ADHD audience", "founder is also host"], /* ... */ },
  { id: "adhd-pacing",          category: "agenda architecture",name: "ADHD-Friendly Pacing",          whenToUse: ["ADHD attendees", "long sessions"], /* ... */ },
],
adhdTranslations: [
  { id: "no-packed-agenda", traditional: "Fill both days with back-to-back valuable sessions.",
    whyItFails: "ADHD attendees (and the ADHD host) crash; retention of everything drops, not just the last session.",
    sparkAdaptation: "Fewer sessions, real decompression blocks, one anchor moment per day.",
    whyBetter: "People remember and act on what they actually absorbed.",
    appliesWhen: ["retreat", "multi-day", "agenda", "workshop"] },
],
```

---

## 10. Expert quality tests

**Already built and passing** (Phase C.5, `chamberExpertiseContribution.test.ts`) — your three examples are exactly the existing cases:

| Input | Asserted influence | Status |
|-------|--------------------|--------|
| "I need a marketing strategy." | audience · positioning · channels · message · testing (not "here are marketing ideas") | ✅ passing |
| "I need to create a client onboarding process." | Systems: repeatability · steps · handoffs · documentation — Client Relationships: trust · communication · member experience | ✅ passing |
| "I want to plan a two-day ADHD business retreat." | transformation · attendee experience · logistics · energy management · ADHD pacing (not "create an agenda") | ✅ passing |

**To add with this architecture:**

| New test | Asserts |
|----------|---------|
| `budget.test.ts` | Composed hint ≤ 550 tokens for any activation, including 3 supporting experts |
| `selection.test.ts` | Framework selection is triggered, not dumped: "I need a marketing plan" selects the 30-Day Experiment, *not* all five frameworks |
| `selection.test.ts` | At most one signature question surfaces per turn (Spec 106: one question at a time) |
| `selection.test.ts` | An ADHD translation only appears when its `appliesWhen` matches |
| `profileDrift.test.ts` | Every runtime framework/translation exists in the matching markdown profile |
| `contributionQuality.test.ts` | Adding frameworks doesn't regress existing theme coverage |

---

## 11. Risks and duplication concerns

| # | Risk | Severity | Mitigation |
|---|------|----------|------------|
| 1 | **Prompt bloat → generic answers.** More considerations can *reduce* quality — the exact failure this project targets | **High** | Selection layer is mandatory, not optional; hard 550-token cap enforced by test; frameworks carry their own triggers |
| 2 | **Markdown ↔ runtime drift.** Two sources of the same knowledge | **High** | `profileDrift.test.ts` in CI; markdown = human truth, module = runtime truth, explicitly documented |
| 3 | **Knowledge Finger resurrection.** A future spec could rebuild Fingers as a parallel system | **High** | §2 records the decision: Finger = fields inside the expert module. Any Finger runtime proposal must first explain why these fields are insufficient |
| 4 | **Research scope creep** into a second research engine | **Medium** | Chamber emits a *flag and evidence standard only*; Estate Brain owns execution. No URLs, no fetching in the data model |
| 5 | **Build Types authoring their own expert questions**, duplicating framework/question libraries | **Medium** | Guard: Build Type question banks must source from the matching expert's `signatureQuestions`. Add to Build Type review checklist |
| 6 | **Three expert ID systems still exist** (canonical 24, Estate Brain 15, Phase 33 6) | **Medium** | Unchanged pre-existing debt; alias map covers it; Phase E consolidation still deferred — this proposal does not worsen it |
| 7 | **24 × 5 frameworks = 120 records to maintain** | **Medium** | One file per expert; incremental migration; markdown already authored, so this is compilation not authorship |
| 8 | **ADHD translations becoming generic** ("ADHD people struggle with organization") | **Medium** | Template rule already bans generic ADHD statements; `appliesWhen` + `whyItFails` force specialty specificity; review gate at I-3 |
| 9 | **Selection logic becoming its own mini-engine** with opaque scoring | **Low–Medium** | Reuse the existing trigger-matching approach from `resolveChamberExpertActivation` (same tokenizer, same multi-signal discipline) rather than inventing a second scorer |
| 10 | **Latency** from loading 24 deep modules | **Low** | Static imports of small objects; only activated experts are read. Measured before/after at I-3 |

---

## 12. What I need approved before writing code

1. **The two-layer split** — activation registry stays thin; deep intelligence lives in `lib/chamberIntelligence/`
2. **Selection over inclusion** — with the ~550-token cap as a hard, tested constraint
3. **Knowledge Sources = architecture only** in v1 — types, triggers, evidence standards; no external fetching, no URL registry
4. **Markdown remains human source of truth**, compiled modules are runtime truth, drift enforced by test
5. **Migration order** — 3 pilot experts (Marketing, Systems, Events) → review gate → remaining 21
6. **Knowledge Finger stays a concept, not a system** (reaffirming the earlier decision)

On approval I'd start with **I-1 and I-2 only** (types, selector, three pilot experts behind an opt-in list), then stop for the I-3 quality review before touching the other 21 — matching the phased pattern that worked for Phases A–D.

**No runtime changes have been made for this proposal.**

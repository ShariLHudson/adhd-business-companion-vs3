# 076‑061 — Section‑Level Research Component (Section Research™)

**Status:** Design standard — approved for the Create redesign plan. **Not yet implemented.**
**Bundle:** 05 V2 — Contextual Research (`076_060_BUNDLE_05_V2_MANIFEST.md`)
**Extends:** [076‑051 Contextual Research Engine](./076_051_CONTEXTUAL_RESEARCH_ENGINE.md) · [076‑052 Research Request Model](./076_052_RESEARCH_REQUEST_MODEL.md) · [076‑053 Evidence & Source Framework](./076_053_EVIDENCE_AND_SOURCE_FRAMEWORK.md) · [076‑055 Research Write‑Back](./076_055_RESEARCH_WRITEBACK.md) · [076‑056 Research History](./076_056_RESEARCH_HISTORY.md)
**Consumed by:** [056 Create Experience Redesign Standard](../056_CREATE_EXPERIENCE_REDESIGN_STANDARD.md) (requirement 11)
**Reuses:** Research Library (`lib/researchLibrary/`, [standard](../../../research/RESEARCH_LIBRARY_AND_USE_THIS_RESEARCH_STANDARD.md)) · Contextual Workspace pattern (`components/companion/contextualWorkspace/ContextualResearchPanel.tsx`)

## Mission

Research must be available inside **every individual section** of a creation. If an SOP has
25 sections, each section has its own Research action, automatically scoped to that
section's topic plus the overall creation — with no re‑explaining, no navigation away,
and no research ever overwriting the member's own words.

This is **one reusable component**, not per‑creation‑type research tools. It works
identically for SOPs, courses, marketing plans, emails, articles, checklists, client
materials, and every future Create type, because it binds to the Universal Creation
Engine's section model — not to any specific creation type.

## One Question Rule check

*"Want me to look into this part for you? Here's what I found — take whatever helps."*
That is the whole experience. The member never sees "research request model,"
"evidence framework," or "write‑back." (Intelligence Paradox: simple surface, deep backend.)

## Member experience — per section

Every section of every creation offers, inline beneath the section (Contextual
Workspace pattern — expandable panel, never a route change, never a modal that hides
the member's work):

| Action | What happens |
|--------|--------------|
| **Research this section** | Starts (or resumes) research scoped to this section. Shari already knows the creation, the section, and what the member has written — the member adds nothing unless they want to steer. |
| **View saved research** | Reopens everything previously found for this section — findings, sources, dates, strength — exactly where they left it. |
| **Add selected findings** | The member checks the findings they want; only those are inserted, as clearly attributed research blocks. Never automatic, never an overwrite. |
| **Save to Evidence Vault** | Selected findings become durable research‑evidence records the member can rely on anywhere, independent of this creation. |
| **Save for later** | Findings are kept on the section's research thread without inserting anything. The member's place in the creation is untouched. |

Guarantees:

1. **Never overwrites.** Research is always *offered*; the member chooses what to add.
   Insertion appends (or inserts at the member's chosen point) — it never replaces text.
2. **Never loses their place.** The panel opens beneath the active section; the section
   draft and cursor context persist through open/close/research/insert. Saving research
   never navigates.
3. **Always honest.** Live‑research truthfulness statuses from the Research Library
   standard apply verbatim (`current_research_completed` only when a provider actually
   ran; otherwise stable‑knowledge labeling + Retry Current Research).
4. **Sourced vs. own ideas is always visible.** Inserted research renders as an
   attributed block (source, date, strength) distinguishable from the member's own
   writing — in the editor, in previews, and in exports.

## Findings review (what the member sees before adding)

Each finding card shows, in member language:

- the finding itself (one clear statement, not a source dump)
- **source** — title/publisher, with link when public
- **dates** — published date and "checked" (retrieval) date
- **evidence strength** — a single calm label derived from the existing
  `ResearchFindingRecord` fields (`confidence` × `verificationStatus` × `freshness`):
  **Strong** · **Solid** · **Worth verifying** — never raw enum values
- a checkbox for selection

Selection state is per finding. "Add selected findings," "Save to Evidence Vault," and
"Save for later" all operate on the current selection.

## Architecture — one brain, thin binding

**No new research engine.** The component is a scoped front door to the Research
Library engine, exactly as chat's "Research This" is (`queueResearchThis` /
`ContextualResearchRequest`). New code is limited to: the reusable panel UI, the
section scope contract, the insertion/provenance model, and the vault adapter.

```
SectionResearchPanel (one reusable component)
  │  scope: SectionResearchScope
  ▼
buildContextualResearchRequest()          ← existing, lib/researchLibrary/contextualResearch.ts
  sourceExperience: "create-section"
  sourceEntityId:   creationId
  sourceSelectionIds: [sectionId]
  surroundingContext: creation outline + section body
  ▼
ResearchSession / ResearchCollectionRecord ← existing engine + storage
  ▼
SectionResearchThread (new, per creation+section)   ← anchoring, selection, insertions
```

### Section scope contract (the only thing hosts provide)

Every Create type already flows through the Universal Creation Engine (056 binding
platform rule). The engine's creation model exposes sections; the host passes:

```ts
type SectionResearchScope = {
  creationId: string;            // canonical Creation Record id
  creationKind: string;          // "sop" | "course" | "marketing-plan" | "email" | …
  creationTitle: string;
  creationOutline: string;       // section titles, for whole-creation context
  sectionId: string;             // STABLE id — survives reordering and retitling
  sectionTitle: string;
  sectionBody: string;           // member's current draft for this section
  memberSteer?: string;          // optional: what the member typed to direct research
};
```

A creation type qualifies for Section Research the moment its sections carry stable
ids — no per‑type research code, ever. (Non‑sectioned creations — a single short
email — are one section: the whole body.)

### Section research thread (new persistent object)

One thread per `(creationId, sectionId)`, intelligence‑ready:

```ts
type SectionResearchThread = {
  id: string;
  creationId: string;
  creationKind: string;
  sectionId: string;
  sectionTitleSnapshot: string;          // for orphan recovery if a section is deleted
  researchCollectionId: string;          // the Research Library collection backing this thread
  researchSessionIds: string[];
  selectedFindingIds: string[];          // current review selection
  insertedFindingIds: string[];          // findings added to the section
  savedForLaterFindingIds: string[];
  vaultRecordIds: string[];              // durable research-evidence records created from here
  status: "never-run" | "in-progress" | "has-findings" | "saved";
  // Intelligence-ready hooks (lib/intelligence/intelligenceReadyTypes.ts)
  originatedFromId: string;              // creationId
  originatedFromKind: string;            // creationKind
  connectionIds: string[];               // LIG edges
  intelligenceMeta?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastOpenedAt: string;
};
```

Threads persist independently of the chat transcript and of the panel being open —
"reopen the research later" is a read of the thread, not a re‑run.

### Insertion & provenance (write‑back, 076‑055)

Insertion never mutates the member's paragraphs. Each accepted finding becomes a
**research block** appended at the member's insertion point:

```ts
type SectionResearchInsertion = {
  id: string;
  findingId: string;                     // → ResearchFindingRecord (source, dates, strength)
  threadId: string;                      // → section + creation
  sectionId: string;
  creationId: string;
  insertedAt: string;
  displayText: string;                   // member-editable rendering of the finding
  attribution: {
    sourceTitle: string;
    publisher: string | null;
    publicationDate: string | null;
    retrievalDate: string;
    strengthLabel: "strong" | "solid" | "worth-verifying";
  };
};
```

Binding lineage rule — research added to a section stays linked, for the life of the
creation, to: **the original source · the evidence rating · the section where it was
used · the overall creation.** Editing the display text never severs the link;
deleting the block archives the insertion (the finding stays on the thread). The
backing `ResearchCollectionRecord` records usage via its existing
`linkedCreationPackageIds` + `approvedFindingIds` / `savedFindingIds` fields.

Rendering: research blocks are visually quiet but unmistakable — a soft left border,
source line, and strength label — so sourced information and the member's own ideas
never blur, including in print/export.

### Save to Evidence Vault (adapter — DECIDED 2026‑08‑04)

The existing Evidence Vault (`lib/evidenceBankStore.ts`, durable domain
`evidence_vault`) is the **personal proof** vault — wins, growth, courage. Research
findings are a different kind of evidence (external, sourced, dated).

**Decision (Shari, binding for the implementing sprint):**

1. **Sibling durable domain.** "Save to Evidence Vault" writes a durable
   **research‑evidence** record in a new domain `research_evidence`, following the
   `evidence_vault` domain pattern from `feat/evidence-vault-durable-save`
   (`lib/durableRecords/domains/`). Personal proof and sourced research are **never
   flattened into one record type**.
2. **One Vault, two calm views.** The Evidence Vault surfaces both domains inside
   the same experience with two views: **"My Proof"** and **"Saved Research."**
   The member sees one Vault; storage stays honest about what each record means.
3. **Shared infrastructure, distinct meaning.** Reuse the shared durable‑record
   infrastructure (schema‑versioned domains, upsert/fetch/list/soft‑delete,
   migration pattern) where appropriate — but each domain keeps its own schema,
   filters, labels, and meaning. No shared "generic evidence" supertype.
4. **Personal‑proof records are untouched.** `EvidenceEntry` keeps its existing
   reflective, growth‑focused purpose and fields (what happened, what it proves,
   who benefited…). This design adds nothing to that schema.

**Research‑evidence record — required fields:**

```ts
type ResearchEvidenceRecord = {
  id: string;
  finding: string;                       // the claim, in member language
  source: {                              // original source — never severed
    title: string;
    publisher: string | null;
    url: string | null;
    publicationDate: string | null;
    retrievalDate: string;               // when we checked it
  };
  citation: string;                      // ready-to-use attribution line
  reliability: {                         // reliability context, member-facing
    strengthLabel: "strong" | "solid" | "worth-verifying";
    confidence: "high" | "medium" | "low";
    verificationStatus: "verified" | "partially_verified" | "unverified";
    freshness: "current" | "stable" | "unknown";
  };
  soWhat: string;                        // "So what?" — why this matters to the member
  connectedWork: {                       // where it has been used / belongs
    creationId: string | null;
    creationKind: string | null;
    sectionId: string | null;
    threadId: string | null;             // SectionResearchThread
    researchCollectionId: string | null;
    connectionIds: string[];             // LIG edges to other work
  };
  externalDocumentLinks: string[];       // supporting documents outside the Estate
  createdAt: string;
  updatedAt: string;
};
```

**Scope guard:** this decision authorizes only the sibling domain + two‑view Vault
surfacing as part of the Section Research design. It does **not** authorize
implementing broader research functionality beyond what the approved
`feat/evidence-vault-durable-save` branch scope already covers.

## Reusability proof (the test for "one component")

The panel takes only `SectionResearchScope` and callbacks
(`onInsert(insertions)`, `onThreadChange(thread)`). It must ship with zero imports
from any creation‑type module. Adoption cost per Create type = wiring the scope from
the Universal Creation Engine's section model. If any creation type "needs its own
research panel," the design has been violated — fix the scope contract instead.

First adopters (in redesign‑plan order): SOP builder → course builder → marketing
plan → email/articles/checklists/client materials → all remaining Create types.
`IdealClientBuilder`'s `ContextualResearchPanel` migrates onto this component last
(it is the pattern's ancestor; behavior is a superset of what it does today).

## Out of scope for V1 (typed, not built — Intelligence‑Ready)

- Cross‑section suggestions ("this finding also fits section 12") — `connectionIds` is ready.
- Freshness re‑checks ("this source is 14 months old — want me to re‑verify?") — dates are stored.
- Deep/collaborative research modes (076‑057 / 076‑058) behind the same panel.
- Creation‑level research rollup view (all sections' research in one place).

## Certification checklist (release gate for the implementing sprint)

1. Every section of a 25‑section SOP exposes all five actions; each is scoped correctly.
2. Research never modifies section text without an explicit "Add selected findings."
3. Insertion appends attributed blocks; member text is byte‑identical around them.
4. Close panel → navigate away → return: thread, selection, and findings intact.
5. "Save for later" inserts nothing and loses nothing.
6. Vault research records carry source, dates, citation, reliability context,
   "So what?", connected work (creation + section + LIG edges), and external
   document links. Personal-proof records are unchanged.
6a. The Vault shows two calm views — "My Proof" and "Saved Research" — backed by
    the two distinct durable domains; no record ever changes type between them.
7. A brand‑new creation type gains Section Research with zero research‑specific code.
8. Live‑research status labels are truthful per the Research Library standard.
9. Sourced blocks are visually distinct from member text in editor and export.
10. Simplicity/cognitive‑load certification (Constitution 128) passes — the member
    vocabulary is exactly: research this section, saved research, add, save, later.

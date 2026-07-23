# Spark Estate™ Create Experience — Inventory & Gap Audit

**Date:** 2026-07-22
**Scope:** Every Create work type / experience in the repository — runtime, registries, blueprints, catalogs, certification, tests.
**Method:** File-path evidence only. Menu appearance, markdown spec, blueprint name, "generic LLM could draft," or Chamber-catalog mention do **not** count as implemented.
**Parent audit:** [SPARK_ESTATE_PRODUCTION_READINESS_AUDIT.md](./SPARK_ESTATE_PRODUCTION_READINESS_AUDIT.md) (§3.3 Create · P0-02/03/04)
**Ownership contract:** `lib/createEstate/createOwnershipContract.ts` — entry=`universalCreationEntrypoint` · Work=`universalWorkEngine` · UI=`createEstate` · lifecycle=`universalCreationEngine`

---

## 0. How to read this audit (definitions)

**The core finding in one sentence:** The Create menu presents ~29–30 consolidated "creation types" as if peers, but only **four** are true guided, structured, registered work-type experiences (Event Plan, Marketing Plan, Business Plan, Facebook Community). Everything else is a **single-artifact draft** generated through one shared content-generator workspace.

Two very different runtimes hide behind one menu:

1. **Guided Work-Type experiences** — registered in the Universal Work Engine (`registerWorkTypePackage` + `registerWorkTypeSchema`), backed by Blueprints (sections, adaptive questions, depth modes), a Workshop Map, section runtime, tasks/milestones, research attachment, cartography/project bridges, and a foundation cert test. Evidence: `lib/universalWorkEngine/packages/*`.
2. **Simple-artifact drafts** — a catalog label routed into the shared `ContentGeneratorPanel` / `CreateWorkspaceV2` draft flow with discovery questions → brief → LLM draft → edit → export. No work-type registration, no Blueprint, no Workshop Map. Evidence: `components/companion/ContentGeneratorPanel.tsx`, `lib/createTemplates.ts`, `lib/createWorkflow.ts`.

### Classification vocabulary (as required)

| Classification | Meaning in this audit |
|---|---|
| **Production Ready** | Registered + guided + state + save/resume + artifacts + tests **and** browser/production certification. **Zero Create items qualify** (`traceabilityMatrix.ts`: browser `NOT_RUN` on every standard). |
| **Runtime Complete** | Registered work type, guided workflow, structured state, save/resume, artifacts, automated unit/foundation tests PASS — certification pending (browser NOT_RUN). |
| **Mostly Complete** | Registered + guided but a material dimension unverified (e.g. deliverable manifests missing, uneven blueprint depth). |
| **Partial** | A real draft flow exists (simple artifact via content generator) but no guided phases / registration / Workshop Map. |
| **Prototype** | Runtime exists but shallow / demo-grade / behind a single blueprint stub. |
| **Docs Only** | Specification/blueprint prose exists; no runtime registration. |
| **Planned** | Named in a roadmap/registry; no runtime. |
| **Missing** | Implied by menu/marketing; no runtime and no spec depth. |
| **Duplicate / Fragmented** | Same capability owned by ≥2 stacks/paths. |

### Experience-type vocabulary (as required)

`simple artifact` · `multi-artifact package` · `guided creation` · `business system` · `program or offer` · `ongoing experience` · `implementation project`

---

## 1. Canonical Create Experience Inventory (deduplicated)

Legend: ✅ present/verified · 🟡 partial/adapter · 🔴 absent · Tests = automated unit/foundation (not browser) · Browser = authenticated Founder validation · Cert = honest production certification.

Row order: guided work-type experiences first, then simple-artifact catalog groups (deduplicated by parent type), then the routed-away item.

| # | Canonical Name | User-Facing Name | Experience Type | Primary Owner (runtime) | Supporting Chambers | Runtime Registration | Guided Workflow | Structured State | Save/Resume | Artifact Package | Visual Support | Export | Create→Project Handoff | Automated Tests | Browser Validation | Certification | Classification | Evidence Paths | Important Gaps |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Event Plan | Event | multi-artifact package / guided creation | `universalWorkEngine/packages/eventPlan` + `lib/eventsIntelligence` | Events, Marketing, Content | ✅ `registerEventPlanWorkType` (imported by UWE index) | ✅ 11 event blueprints + adaptive Qs | ✅ section runtime + state machine | ✅ event record store / resume | ✅ event asset registry | 🟡 Cartographers maps hidden-pending | ✅ ExportActions/Google | ✅ `projectSync` | ✅ 12 `*.foundation.cert.test.ts` PASS | 🔴 NOT_RUN | 🔴 NOT_CERTIFIED | **Runtime Complete** | `lib/universalWorkEngine/packages/eventPlan/*`, `lib/eventsIntelligence/*`, `eventBlueprintDefinitions.ts` | Advanced ops (433–438: go/no-go, event-day, contingency, auto-visuals) missing; browser NOT_RUN |
| 2 | Marketing Plan | Marketing Plan | guided creation | `universalWorkEngine/packages/marketingPlan` | Marketing, Content | ✅ `registerMarketingPlanWorkType` (imported by UWE index) | 🟡 1 blueprint (`marketing_plan.simple`) + adaptive Qs | ✅ section runtime | ✅ universal section lifecycle | 🟡 sections only, thin asset set | 🔴 none dedicated | ✅ ExportActions | 🟡 via UCE `projectSync` | ✅ `marketingPlan.foundation.cert.test.ts` | 🔴 NOT_RUN | 🔴 NOT_CERTIFIED | **Runtime Complete** | `lib/universalWorkEngine/packages/marketingPlan/*`, `marketingPlanBlueprint.ts` | Only one blueprint depth family; not full 563–574 Marketing intelligence |
| 3 | Business Plan | Business Plan | business system / guided creation | `universalWorkEngine/packages/businessPlan` | Finance, Horizons, Leadership | ✅ `registerBusinessPlanWorkType` (imported by UWE index) | ✅ ~60 industry blueprints in 12 collections | ✅ section runtime | ✅ universal section lifecycle | 🟡 **deliverable manifests mostly missing** | 🔴 none | ✅ ExportActions | 🟡 via UCE | ✅ `businessPlan.foundation.cert.test.ts` + collection browserChecklist tests | 🔴 NOT_RUN | 🔴 NOT_CERTIFIED | **Mostly Complete** | `businessBlueprintDefinitions.ts`, `*CollectionDefinitions.ts`, `233_236_MASTER_CREATEABILITY_GAP_REGISTER.md` | Dozens of promised deliverables (pricing models, KPI dashboards) have **no Createability Manifest** → 067/069 overclaim risk |
| 4 | Facebook Community | Facebook Community | ongoing experience / business system | `universalWorkEngine/packages/facebookCommunity` | Marketing, Client Relationships, Content, Creative Studio, Events, Project Mgmt | ✅ **registered on the live path** — UWE `index.ts` bare side-effect import + Anywhere-Origin resolver calls `ensureFacebookCommunityWorkTypeRegistered()` | ✅ 1 blueprint, 22 sections, 3 depth modes, adaptive Qs | ✅ section runtime + domain phases | ✅ universal section lifecycle | ✅ 12 named deliverables declared | 🟡 banner brief only ("where available") | ✅ export flag | ✅ explicit-only project bridge | ✅ `facebookCommunity.foundation.cert.test.ts` (17) + `facebookCommunity.liveRegistration.test.ts` (7) | 🔴 NOT_RUN | 🔴 NOT_CERTIFIED | **Runtime Complete** | `lib/universalWorkEngine/packages/facebookCommunity/*`, `workTypeSchema/schemas/facebookCommunityMap.ts`, `launch/inferWorkTypeAndBlueprint.ts`, docs 587–598 | Live-path registration + natural-language routing now proven by import-only tests; guided Blueprint attaches on Begin/Anywhere-Origin. Remaining: browser validation NOT_RUN; banner stays a brief (no image engine on this path, by design) |
| 5 | Email (+ Follow-Up) | Email | simple artifact | `createEstate` UI → `ContentGeneratorPanel` | Content, Client Relationships | 🔴 no work-type schema | 🔴 discovery Qs → draft only | 🟡 `CreateWorkflowState` draft state | ✅ `createDraftPersistence` | 🔴 single artifact | 🔴 | ✅ | 🟡 `ProjectPickerModal` | 🟡 catalog/intent unit tests | 🔴 NOT_RUN | 🔴 | **Partial** | `createParentTypes.ts` (email), `createCatalogData.ts`, `ContentGeneratorPanel.tsx` | No structured phases; subtypes are prompt-shaping only |
| 6 | Social Content | Social Content | simple artifact | content-generator | Content, Marketing | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` (social-content) merges Social/Facebook/LinkedIn Post + Video Script | Platform-specific labels collapsed to prompt variants |
| 7 | Article or Blog | Article or Blog | simple artifact | content-generator | Content | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` (Blog Post) | — |
| 8 | Newsletter | Newsletter | simple artifact | content-generator | Content, Marketing | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | — |
| 9 | Presentation | Presentation | simple artifact | content-generator | Content, Learning | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` (presentation) | Deck visuals not generated |
| 10 | Script | Script | simple artifact | content-generator | Content | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` (Video Script) | — |
| 11 | Marketing Campaign | Marketing Campaign | multi-artifact package | content-generator | Marketing | 🔴 (no work type) | 🔴 | 🟡 draft | ✅ | 🔴 (should be multi-email) | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` (marketing-campaign) merges Email Sequence + Email Campaign | Multi-touch series promised, single-draft delivered |
| 12 | Offer | Offer | simple artifact / program or offer | content-generator | Marketing, Finance | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | Offer economics not modeled |
| 13 | Sales Funnel | Sales Funnel | multi-artifact package | content-generator | Marketing | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | Funnel = several linked assets; one draft only |
| 14 | Lead Magnet | Lead Magnet | simple artifact | content-generator | Marketing | 🔴 | 🟡 "richest guided flow in catalog" (still template) | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createOptionAudit.ts` | Template-guided, not work-type guided |
| 15 | Promotion (Flyer) | Promotion | simple artifact | content-generator | Marketing, Creative Studio | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 (no image gen) | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` (promotion) | Flyer implies visual; text only |
| 16 | Launch | Launch | multi-artifact package | content-generator | Marketing, Events | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` (Launch Plan) | Overlaps Event Plan (launch event) + Marketing |
| 17 | Sales Page | Sales Page | simple artifact | content-generator | Marketing | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | — |
| 18 | Landing Page | Landing Page | simple artifact | content-generator + `connectedAssetEditor` | Marketing | 🟡 asset editor path | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts`, `lib/connectedAssetEditor` | — |
| 19 | Client Onboarding | Client Onboarding | guided creation (light) | content-generator | Client Relationships | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | Could be a multi-artifact system |
| 20 | Proposal | Proposal | simple artifact | content-generator | Client Relationships, Finance | 🟡 `isProposalArtifact` special-casing | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `artifactType.ts`, `createCatalogData.ts` | `resolveWorkTypeIdFromLabel`→`proposal` but no schema registered |
| 21 | Client Communication | Client Communication | simple artifact | content-generator | Client Relationships | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` merges Check-In/Referral/Testimonial | — |
| 22 | Course | Course | guided creation | content-generator | Learning, Content | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` (Course Outline) | Only an outline; not curriculum system |
| 23 | 5-Day Plan | 5-Day Plan | simple artifact | content-generator | Momentum | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | — |
| 24 | Strategy | Strategy | simple artifact | content-generator | Marketing, Leadership | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` merges Marketing/Content Strategy | — |
| 25 | Standard Operating Procedure | Standard Operating Procedure | simple artifact | content-generator | AI/Tech, Operations | 🟡 `resolveWorkTypeIdFromLabel`→`sop` (no schema) | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createParentTypes.ts` merges SOP/Process/Automation/GHL Workflow | Label resolves to id with **no registered schema** |
| 26 | Checklist | Checklist | simple artifact | content-generator | Momentum, Operations | 🟡 `resolveWorkTypeIdFromLabel`→`checklist` (no schema) | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | id maps but no schema |
| 27 | Guide | Guide | simple artifact | content-generator | Learning, Knowledge | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` (Training Guide) | — |
| 28 | Template (AI Prompt) | Template | simple artifact | content-generator | AI/Tech | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createOptionAudit.ts` (Claude Prompt→AI Prompt) | — |
| 29 | Reference Document | Reference Document | simple artifact | content-generator | — | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` (Document→Other Document) | Deliberate catch-all |
| 30 | Content Calendar | Content Calendar | simple artifact | content-generator | Content, Marketing | 🔴 | 🔴 | 🟡 draft | ✅ | 🔴 | 🔴 | ✅ | 🟡 | 🟡 | 🔴 | 🔴 | **Partial** | `createCatalogData.ts` | — |
| — | Client Avatar | (routed away) | — | Client Avatars room (`route: "client-avatars"`) | Client Relationships | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | n/a | **Duplicate/Fragmented** (correctly re-homed) | `createCatalogData.ts` (route), `createOptionAudit.ts` (keep:false) | Appears in catalog data but not a Create output |

**Row totals:** 4 registered guided work types (rows 1–4) · 26 simple-artifact parent types (rows 5–30) · 1 routed-away. **Zero Production Ready.** 2 Runtime Complete, 1 Mostly Complete, 1 Runtime Complete-with-caveat, 26 Partial.

---

## 2. Visible Menu vs. Actual Capability (~29 items) — overstatement callouts

The consolidated Create menu (`CREATE_PARENT_TYPES`, 30 parent types across 7 categories with the "Personal" category empty ⇒ ~29 visible) presents every card as an equal "creation type." Underlying data (`CREATE_CATALOG`) has **42 catalog labels** (41 creatable; Client Avatar routes away).

**Overstatements (menu implies a system; runtime delivers a draft):**

| Menu card | Implies | Actually is | Evidence |
|---|---|---|---|
| **Sales Funnel** | Multi-page/multi-email funnel system | One LLM draft | `createCatalogData.ts` + no work type |
| **Marketing Campaign** | Sequenced multi-email campaign | One draft | `createParentTypes.ts` (merges Email Sequence + Campaign) |
| **Launch** | Coordinated launch program | One "Launch Plan" draft | overlaps Event + Marketing |
| **Course** | Curriculum/course system | One outline draft | catalog "Course Outline" |
| **Client Onboarding** | Onboarding system (docs + sequence) | One draft | catalog |
| **Offer** | Priced/economically modeled offer | One draft | catalog |
| **Promotion / Flyer** | Designed visual asset | Text only (no image generation) | catalog; no image engine on this path |
| **SOP / Checklist / Proposal** | Structured work types (labels resolve to work-type ids) | No registered schema → generic draft | `workTypeSchema/registry.ts` `resolveWorkTypeIdFromLabel` returns ids with no `registerWorkTypeSchema` |

**Honest reading:** ~29 cards, **4 real guided experiences**, ~26 single-artifact drafts, 3 "phantom work types" (SOP, Checklist, Proposal) whose ids resolve but have no schema.

---

## 3. Existing but Hidden / Under-surfaced Experiences

| Experience | Status | Evidence | Note |
|---|---|---|---|
| **Facebook Community (587–598)** | Runtime Complete; **surfaced** in menu (`createParentTypes.ts` `facebook-community`) and Begin detection (`resolveCreateBeginOutcome.ts`); **live-path registration now proven** | `lib/universalWorkEngine/packages/facebookCommunity/*`, docs `facebook-community-587-598/587–598` | **Fixed 2026-07-22:** UWE `index.ts` now has bare side-effect imports for `registerFacebookCommunityWorkType` + `registerFacebookCommunityBlueprints` (tree-shake-proof), `resolveAnywhereOriginWork.ts` calls `ensureFacebookCommunityWorkTypeRegistered()`, and `inferWorkTypeAndBlueprint.ts` detects FB + attaches the guided Blueprint. Proven by `facebookCommunity.liveRegistration.test.ts` (import-only registration + NL routing, no manual `ensure`). Browser validation still NOT_RUN. |
| **11 named Event blueprints** | Runtime Complete; only "Event" surfaced as one card | `eventBlueprintDefinitions.ts` (networking, workshop, webinar, retreat, conference, summit, product launch, book launch, challenge, masterclass, fundraiser gala) | Rich depth hidden behind a single menu card + subtype question. |
| **~60 industry Business blueprints** | Mostly Complete (structure); deliverables unverified | `*CollectionDefinitions.ts` (12 collections) | Enormous hidden surface behind one "Business Plan" card; deliverable promises not manifested. |
| **Connected Asset Editor** | Partial runtime | `lib/connectedAssetEditor` | Landing-page/asset-first entry exists but not menu-surfaced as its own experience. |
| **Explore Ideas** | Partial | `lib/createEstate/exploreIdeas/*` | Idea browse/recommendation surface. |

---

## 4. Duplicate & Fragmentation Audit (one canonical owner per overlap)

| Overlap | Systems found | Recommended single owner | Evidence |
|---|---|---|---|
| **Create orchestration stacks** | `universalCreationEntrypoint` (entry) · `universalCreation` (legacy chat-doc adapter) · `universalCreationEngine` (lifecycle) · `universalWorkEngine` (identity) · `platformIntent/blueprintRegistry` (alias) | Entry=`universalCreationEntrypoint`; adapters/quarantine per contract | `createOwnershipContract.ts`, `legacyCreateShellQuarantine.ts` |
| **Blueprint registries** | UWE `blueprints/registry` (canonical) vs `platformIntent/blueprintRegistry` (alias) | UWE packages | `createOwnershipContract.ts` marks platformIntent adapter-only |
| **Work-type resolution** | `resolveWorkTypeIdFromLabel` (schema registry) vs `matchCatalogFromText`/`detectCreateTypeFromPrompt`/`isXCreationRequest` (Begin) | Consolidate detection into one resolver feeding UWE | `workTypeSchema/registry.ts`, `resolveCreateBeginOutcome.ts` |
| **Catalog vs parent types** | `CREATE_CATALOG` (42 labels) vs `CREATE_PARENT_TYPES` (30) vs `CREATE_OPTION_AUDIT` | Parent types as member surface; catalog as legacy resolver map | `createParentTypes.ts`, `createOptionAudit.ts` |
| **"Marketing Campaign" vs "Email Sequence" vs "Email Campaign"** | 3 labels, 1 job | Marketing Campaign parent type | `createOptionAudit.ts` (already consolidated in taxonomy, not in runtime depth) |
| **"Launch" vs Event (launch event) vs Marketing** | 3 owners touch launches | Event Plan owns the *event*; Marketing owns *campaign*; Launch = coordinating package | catalog + eventBlueprints (product_launch, book_launch) |
| **Simple-artifact workspace** | `ContentGeneratorPanel` + `CreateWorkspaceV2Panel` + `CreateGuidedMinimalPanel` + legacy split shell | Single Create Estate workspace (066) | `HARDENING_066_*`, `legacyCreateShellQuarantine.ts` |
| **Client Avatar** | Create catalog data + Client Avatars room | Client Avatars room (not a Create output) | `createCatalogData.ts` (`route`), `createOptionAudit.ts` (`keep:false`) |

---

## 5. Artifact vs. Experience Audit

**Simple artifacts** (one deliverable, best as content-generator drafts — appropriate as-is): Email, Social Content, Article/Blog, Newsletter, Script, Sales Page, Landing Page, Client Communication, Reference Document, Template/AI Prompt, Checklist, Guide, Content Calendar, Presentation, 5-Day Plan.

**Mislabeled as artifacts but are really experiences** (currently deliver a single draft, should be multi-artifact packages / systems):

| Menu card | Should be | Why |
|---|---|---|
| Sales Funnel | multi-artifact package (pages + emails + offer) | funnel is inherently multi-asset |
| Marketing Campaign | multi-artifact package (sequenced emails + calendar) | "campaign" ≠ one email |
| Launch | implementation project / package | launch coordinates event + marketing + content |
| Course | guided creation → program/offer | curriculum, lessons, sales |
| Client Onboarding | business system | docs + sequence + checklist + touchpoints |
| Offer | program or offer (with economics) | pricing/positioning belongs to a model, not prose |
| Strategy | guided creation | strategy deserves discovery + structure |
| SOP | guided creation (registered work type) | id already resolves; needs schema |

**Correctly modeled as experiences:** Event Plan, Marketing Plan, Business Plan, Facebook Community.

---

## 6. Missing End-to-End Create Experiences

Fields: name · primary user · why · frequency · Chamber owner · supporting · phases · artifacts · effort · business value · consolidation? · priority.

1. **Sales Funnel System** — solo founder/marketer — funnels are top-requested and currently faked as one draft — occasional/high-stakes — Marketing — Content, Creative Studio — (offer → landing → opt-in → email sequence → thank-you → tracking) — landing page, opt-in, 3–7 emails, thank-you, metrics plan — L — very high — **consolidate** Sales Funnel + Lead Magnet + Landing/Sales Page + Marketing Campaign — **P1**.
2. **Offer & Pricing Builder** — service/product founder — offer economics never modeled — recurring — Finance — Marketing — (audience → promise → deliverables → pricing/tiers → guarantee → positioning) — offer doc, pricing model, sales bullets — M — high — consolidate with Offer — **P1**.
3. **Course / Program Builder** — coach/educator — only an outline exists — occasional — Learning — Content, Marketing — (outcome → curriculum → modules/lessons → delivery → pricing → launch) — curriculum map, lesson outlines, sales page, launch plan — L — high — consolidate Course + Launch — **P2**.
4. **Client Onboarding System** — service business — one draft, should be a system — recurring — Client Relationships — Operations — (welcome → agreement → intake → kickoff → milestones → feedback) — welcome kit, intake form, SOP, email sequence — M — high — consolidate Client Onboarding + Client Communication — **P2**.
5. **SOP / Process System (registered)** — operations owner — id resolves but no schema — recurring — AI/Tech / Operations — Momentum — (trigger → steps → roles → tools → checks → automation notes) — SOP doc, checklist, automation brief — M — high — consolidate SOP/Process/Automation/GHL — **P1**.
6. **Marketing Campaign Sequencer** — marketer — "campaign" delivers one email — recurring — Marketing — Content — (goal → audience → sequence map → per-email drafts → schedule) — 3–7 linked emails, calendar — M — high — consolidate Marketing Campaign/Email Sequence — **P1**.
7. **Content Strategy System** — content creator — strategy is one draft — periodic — Marketing/Content — Knowledge — (goals → pillars → channels → cadence → calendar) — strategy doc, pillar map, calendar — M — medium — consolidate Strategy + Content Calendar — **P2**.
8. **Lead Magnet + Delivery Kit** — marketer — magnet without opt-in/delivery — occasional — Marketing — Creative Studio — (idea → outline → asset → opt-in → delivery email) — magnet, opt-in copy, delivery email — S — medium — consolidate with Lead Magnet — **P2**.
9. **Product/Book Launch Program** — founder/author — launch faked as plan; event blueprints exist but not stitched to marketing — occasional/high-stakes — Events + Marketing — Content — (positioning → assets → timeline → runway → launch day → follow-up) — launch plan, email/social kit, day-of runbook — L — high — bridge Event (product_launch/book_launch) + Marketing — **P2**.
10. **Proposal / SOW System (registered)** — service founder — id resolves, no schema — recurring — Client Relationships/Finance — — (scope → deliverables → pricing → terms → next steps) — proposal, pricing table, terms — M — high — consolidate Proposal — **P1**.
11. **Visual Promotion (Flyer with imagery)** — local/event business — flyer is text-only; no image gen on this path — occasional — Creative Studio — Marketing — (offer → layout brief → copy → image) — flyer copy + image brief/asset — M — medium — consolidate Promotion — **P3**.
12. **Presentation/Deck Builder (with slides)** — coach/speaker — deck without slide structure/visuals — occasional — Content/Learning — Creative Studio — (goal → outline → slide-by-slide → speaker notes) — deck outline, slide content, notes — M — medium — **P3**.

---

## 7. Consolidation Map

```
GUIDED WORK TYPES (UWE-registered — keep, deepen)
  Event Plan ──────── owns: all gatherings incl. launch *events* (11 blueprints)
  Marketing Plan ──── owns: ongoing marketing tactics/dates
  Business Plan ───── owns: whole-business planning (60 industry blueprints)
  Facebook Community  owns: community as a system

PROMOTE TO GUIDED WORK TYPES (P1) — labels/ids already exist, add schema+blueprint
  SOP System        ⇐ SOP + Process + Automation + GHL Workflow
  Proposal System   ⇐ Proposal
  Sales Funnel      ⇐ Sales Funnel + Lead Magnet + Landing Page + Sales Page (assets) + Marketing Campaign (emails)
  Offer Builder     ⇐ Offer
  Marketing Campaign⇐ Email Sequence + Email Campaign

KEEP AS SIMPLE ARTIFACTS (content-generator is correct)
  Email · Social Content · Article/Blog · Newsletter · Script · Client Communication ·
  Reference Document · Template/AI Prompt · Checklist · Guide · Content Calendar · 5-Day Plan · Presentation

ROUTE AWAY (not Create outputs)
  Client Avatar → Client Avatars room
```

---

## 8. Recommended Create Taxonomy (progressive categories)

Keep the seven member-facing categories (`CREATE_BROWSE_CATEGORIES`) but relabel each card's *depth* honestly:

- **Quick drafts** (simple artifact, 1 deliverable): Email, Social Content, Article/Blog, Newsletter, Script, Client message, Checklist, Guide, Reference Doc, Template, Content Calendar, 5-Day Plan, Presentation, Sales/Landing Page.
- **Guided experiences** (registered work type, structured phases, multiple artifacts): Event, Marketing Plan, Business Plan, Facebook Community — **and (after P1)** SOP, Proposal, Sales Funnel, Offer, Marketing Campaign.
- **Systems / programs** (P2+): Course, Client Onboarding, Launch program.

Progressive disclosure: category → parent type → (subtype question only when >1 shape) → confirm → open. This already matches `createParentTypes.ts`; the gap is *runtime depth*, not taxonomy.

---

## 9. Build Priorities

**Next 10 (highest value, evidence-backed):**
1. Browser-validate the 4 guided experiences (Event, Marketing Plan, Business Plan, Facebook Community) to unblock any CERTIFIED row (P0-02).
2. ✅ **Done (2026-07-22)** — Facebook Community registration fixed on the live open path (UWE `index.ts` side-effect import + Anywhere-Origin `ensure` + FB inference/blueprint attach); proven by `facebookCommunity.liveRegistration.test.ts`.
3. Register **SOP** work type + blueprint (id already resolves).
4. Register **Proposal** work type + blueprint (id already resolves).
5. Register **Checklist** schema (id resolves, no schema) or explicitly keep as simple artifact.
6. Build **Sales Funnel** as multi-artifact package.
7. Build **Marketing Campaign** sequencer (multi-email).
8. Author **Createability Manifests** for Business Plan deliverables actually shipped; hide unmanifested promises (P0-04).
9. Build **Offer & Pricing** experience.
10. Deepen **Marketing Plan** beyond the single `marketing_plan.simple` blueprint.

**Next 25 (add):** Client Onboarding system · Course/Program builder · Content Strategy system · Lead Magnet + delivery kit · Launch program (Event↔Marketing bridge) · Visual Promotion (image gen) · Presentation/Deck builder · per-industry Business deliverable manifests (pricing models, KPI dashboards) · Connected Asset Editor surfacing · Explore Ideas polish · Create→Project handoff browser proof (J-003) · export/print parity across guided types · Cartography/Visual map unlock for Event once mapRegistry honest.

**Do Not Build Yet:** New Chamber-specific Create engines · duplicate blueprint registries · a parallel image/content-calendar engine for Facebook Community (587 forbids) · Intent Memory durable store (Spec 131 future) · any CERTIFIED claim before browser validation · new work types before SOP/Proposal/Funnel land.

---

## 10. Executive Findings (count questions)

- **How many Create work types are visible in the menu?** ~29–30 parent types (`CREATE_PARENT_TYPES`, "Personal" category empty), over **42 underlying catalog labels** (41 creatable; Client Avatar routes away).
- **How many are genuine guided, registered, structured experiences?** **4** — Event Plan, Marketing Plan, Business Plan, Facebook Community (all `registerWorkTypePackage` + Blueprint + section runtime + foundation cert test).
- **How many are simple-artifact drafts (content generator)?** **~26** parent types (~37 catalog labels).
- **How many "phantom" work types (id resolves, no schema)?** **3** — SOP, Checklist, Proposal (`resolveWorkTypeIdFromLabel`).
- **How many are Production Ready (certified)?** **0.** Every Create standard 045–069 is `TESTING`/`IN_IMPLEMENTATION` with `browser: NOT_RUN` (`traceabilityMatrix.ts`); `matrixHasInvalidCertificationClaims()` guards against false CERTIFIED.
- **How many Runtime Complete?** **3** (Event, Marketing Plan, Facebook Community) + **1 Mostly Complete** (Business Plan, deliverable manifests missing).
- **How many registered blueprints exist?** Event 11 + Business ~60 + Marketing 1 + Facebook Community 1 ≈ **73** blueprints behind 4 cards.
- **Largest gap:** Business Plan deliverable promises (pricing models, KPI dashboards) lack Createability Manifests (dozens of `critical` rows in `233_236_MASTER_CREATEABILITY_GAP_REGISTER.md`) → Spec 067/069 overclaim.
- **Duplicate systems:** 3 Create orchestration stacks + 2 blueprint registries (contract-tamed as adapters, not deleted).

---

*End of Create Experience audit — 2026-07-22. The Create menu describes the experiences we intend; this document describes which the repository actually runs.*

# Create Taxonomy Audit & Recommendations (178)

**Status:** Audit complete · **No implementation yet** · **Do not deploy** until findings are reviewed.

**Scope:** Information architecture, workflow depth, and usability — not a visual redesign.

**Authority surfaces audited**
| Surface | Path | Role |
|---------|------|------|
| Canonical picker catalog | `lib/createCatalogData.ts` | Inventory of record |
| Active picker filter | `lib/createEstate/activeCreationTypes.ts` | Hides routed items (Client Avatar) |
| Estate entrance | `components/companion/CreateEstateEntrancePanel.tsx` | Welcome Home → My Work → Create |
| Workflow open | `startFreshCreateFromEstate` → `content-generator` | One entry path |
| Discovery questions | `lib/createWorkflow.ts` | Type-specific vs DEFAULT |
| Templates | `lib/createTemplates.ts` | Dedicated vs `generic-default` |
| Alternate menus | `lib/createLauncherTypes.ts`, `PRIMARY_CREATE_ITEMS` | Inconsistent secondary lists |
| Estate brain CREATE | `lib/estateBrain/capabilityRegistry.ts` | Extra capabilities not in picker |

---

## 1. Current Create inventory

### Top-level categories (picker)

| Category | Items in picker | Notes |
|----------|----------------:|-------|
| Business Assets | 10 | Mix of pages, ops, AI prompt, GHL |
| Content | 9 | Social splintered; presentations here |
| Documents | 7 (+1 routed) | Client Avatar opens Client Avatars room |
| Marketing | 5 | Strategy / campaign / funnel mix |
| Planning | 3 | Thin category |
| Relationships | 4 | Mostly email-adjacent |
| Strategies | 2 | Thin; overlaps Strategy Library |
| **Active picker total** | **40** | + Client Avatar hidden via `route` |

### Full item inventory

| Category | Name | User problem | Launches | Workflow depth | Action |
|----------|------|--------------|----------|----------------|--------|
| Business Assets | Automation | Automate a process | Create workflow | Partial (DEFAULT Q + generic template) | Keep; deepen later |
| Business Assets | Checklist | Step list for a task | Create workflow | Partial | Keep |
| Business Assets | Claude Prompt | Prompt for AI tools | Create workflow | Partial | Rename → **AI Prompt**; move to AI & Prompts |
| Business Assets | GHL Workflow | HighLevel automation brief | Create workflow | Partial | Keep under Operations |
| Business Assets | Newsletter | Regular email to list | Create workflow | Working | Keep under Content / Email |
| Business Assets | Offer | Package / pricing offer | Create workflow | Working | Keep under Business / Sales |
| Business Assets | Process | How we do X | Create workflow | Partial | Merge under SOP parent (“What kind?”) |
| Business Assets | Sales Page | Long-form sell page | Create workflow | Partial (typed Q, generic template) | Keep under Sales / Websites |
| Business Assets | Landing Page | Capture / convert page | Create workflow | Working | Keep under Websites |
| Business Assets | Lead Magnet | Freebie for opt-in | Create workflow | Working (richest) | Keep under Marketing / Content |
| Content | Blog Post | Article / SEO content | Create workflow | Partial | Keep |
| Content | Email | One email | Create workflow | Working | Parent for Follow-Up subtype |
| Content | Email Sequence | Series of emails | Create workflow | Working | Merge with Email Campaign |
| Content | Facebook Post | FB-specific post | Create workflow | Partial | Merge under Social Post |
| Content | LinkedIn Post | LI-specific post | Create workflow | Partial | Merge under Social Post |
| Content | Presentation | Slides / talk deck | Create workflow | Partial | Move to Presentations |
| Content | Social Post | General social | Create workflow | Working | Parent; ask platform |
| Content | Video Script | Script for video | Create workflow | Partial | Keep under Content |
| Content | Workshop | Live / recorded workshop | Create workflow | Working | Keep; near Course |
| Documents | Business Plan | Formal business plan | Create workflow | Partial | Keep under Business |
| Documents | Document | Generic doc | Create workflow | Partial | Keep as catch-all or rename **Other Document** |
| Documents | Course Outline | Course structure | Create workflow | Working | Move to Training & Courses |
| Documents | Client Onboarding | New-client path | Create workflow | Working | Move to Client Experience |
| Documents | Client Avatar | Ideal client profile | **Routed** to Client Avatars | Placeholder in Create | Remove from Create list (already hidden) |
| Documents | Proposal | Client proposal | Create workflow | Working | Keep under Sales (single Proposal) |
| Documents | SOP | Standard operating procedure | Create workflow | Working | Parent for Process |
| Documents | Training Guide | Teach a process | Create workflow | Working | Move to Training & Courses |
| Marketing | Content Strategy | Content direction | Create workflow | Partial | Keep under Marketing Strategy |
| Marketing | Email Campaign | Campaign / nurture | Create workflow | Partial | Merge → Email Sequence |
| Marketing | Launch Plan | Launch timeline | Create workflow | Partial | Keep under Marketing |
| Marketing | Marketing Strategy | Overall marketing approach | Create workflow | Partial | Parent strategy bucket |
| Marketing | Sales Funnel | Funnel design | Create workflow | Working | Keep under Sales / Marketing |
| Planning | 5-Day Plan | Short planning sprint | Create workflow | Partial | Move to Personal Productivity or Business |
| Planning | Content Calendar | When to publish | Create workflow | Partial | Keep under Content / Marketing |
| Planning | Marketing Plan | Plan with tactics | Create workflow | Working | Clarify vs Marketing Strategy |
| Relationships | Client Check-In | Relationship touchpoint | Create workflow | Partial | Client Experience |
| Relationships | Follow-Up Email | One follow-up | Create workflow | Partial | Email subtype, not separate tile |
| Relationships | Referral Request | Ask for referral | Create workflow | Partial | Client Experience / Sales |
| Relationships | Testimonial Request | Ask for testimonial | Create workflow | Partial | Client Experience |
| Strategies | Business Strategy | High-level business strategy | Create workflow | Partial | Clarify vs Strategy Library |
| Strategies | Personal Companion Strategy | Personal strategy | Create workflow | Partial | Personal Productivity or Strategy Library |

### Outside-picker Create-named surfaces (orphans)

| Name | Where | Recommendation |
|------|--------|----------------|
| Workbook, Ad Copy, Podcast Outline, Book Chapter | `CREATE_LAUNCHER_TYPE_OPTIONS` only | Add to catalog with real workflows **or** remove from launcher |
| AI Images, Mind Map, Whiteboard, Templates, Long-form | Estate brain CREATE capabilities | Do not list in Create picker until workflows exist |
| Sales Script, Content Plan, Workflow | Artifact registry labels | Align labels with catalog or drop |
| Custom / Other | Launcher + V2 | Keep as escape hatch |
| Thank-You Email | Discovery map only | Make Email subtype |

---

## 2. Duplicate analysis

| Cluster | Current tiles | Consolidation |
|---------|---------------|---------------|
| **Email series** | Email Sequence + Email Campaign | One: **Email Sequence** → “Campaign, nurture, or sales series?” |
| **Email one-offs** | Email + Follow-Up Email (+ subtypes) | One: **Email** → “What kind of email?” |
| **Social** | Social Post + Facebook + LinkedIn | One: **Social Post** → “Which platform?” |
| **Marketing direction** | Marketing Strategy + Marketing Plan + Content Strategy + Launch Plan | Keep Strategy / Plan / Launch as three intents with clear one-line differences; do not add more |
| **Ops docs** | Process + SOP + Checklist + Training Guide | **SOP** parent with kinds; Checklist stays separate; Training Guide → Courses |
| **Offer stack** | Offer + Sales Page + Landing Page + Lead Magnet + Sales Funnel | Keep distinct (different outcomes); improve cross-links after create |
| **Learning** | Course Outline + Workshop + Training Guide | Course / Workshop parents; Training Guide as kind of Course or SOP |
| **Menus** | Estate picker (40) vs Launcher (17) vs PRIMARY (12) vs Brain (13) | **One menu source of truth** = `CREATE_CATALOG` |

Overloaded: Business Assets, Content.  
Too thin: Planning (3), Strategies (2).

---

## 3. Recommended taxonomy (intent-first)

Recommended top-level categories for Create (member language):

1. **Marketing & Growth** — Lead Magnet, Landing Page, Sales Funnel, Marketing Strategy, Marketing Plan, Launch Plan, Content Strategy, Content Calendar, Newsletter  
2. **Content & Social** — Social Post (platform), Blog Post, Video Script, Presentation, Email, Email Sequence  
3. **Sales & Offers** — Offer, Proposal, Sales Page, Referral Request  
4. **Client Experience** — Client Onboarding, Client Check-In, Testimonial Request  
5. **Operations & Systems** — SOP (incl. Process), Checklist, Automation, GHL Workflow  
6. **Training & Courses** — Course Outline, Workshop, Training Guide  
7. **Business Planning** — Business Plan, Business Strategy, 5-Day Plan  
8. **AI & Prompts** — AI Prompt (renamed Claude Prompt)  
9. **Documents** — Document (other), plus anything that does not fit above  

**Not in Create picker until real workflows exist:** Client Avatar (keep in Client Avatars), Mind Map, Whiteboard, AI Images, Workbook (unless promoted with a workflow).

**Defer / park:** Personal Companion Strategy → Strategy Library or Personal Productivity later.

Candidate list from the prompt that we **do not** need as empty top-level shells: Legal, Events, Finance, Team & HR, Branding, Communications — add only when there are ≥2 real creators each.

---

## 4. Items to merge

| Merge into | Absorb |
|------------|--------|
| Email Sequence | Email Campaign |
| Email | Follow-Up Email (as subtype) |
| Social Post | Facebook Post, LinkedIn Post |
| SOP | Process (as “Process / SOP kind”) |

---

## 5. Items to rename

| Current | Recommended |
|---------|-------------|
| Claude Prompt | **AI Prompt** |
| Document | **Other Document** (or hide behind “Something else”) |
| Personal Companion Strategy | Keep out of Create; use Strategy Library language |
| GHL Workflow | **Go High Level Workflow** (spell out for first-time users) |

---

## 6. Missing creation experiences

High value for ADHD entrepreneurs (not in picker today):

| Missing experience | Suggested category |
|--------------------|--------------------|
| About / Brand story | Branding / Marketing |
| FAQ / Objection handlers | Sales |
| Client welcome packet | Client Experience |
| Invoice / pricing one-pager | Sales / Finance |
| Meeting agenda | Operations / Productivity |
| Ad copy (launcher orphan) | Marketing |
| Podcast outline (launcher orphan) | Content |
| Workbook (launcher orphan) | Training |
| Case study | Marketing / Sales |
| Policy / simple agreement outline | Legal (when ready) |

Do not add tiles until each has a guided workflow (package rule: no dead cards).

---

## 7. Workflow gaps

Every active picker item opens `content-generator` — **no dead cards in the picker** — but depth varies.

### Fails “complete guided workflow” bar (type-specific Q + dedicated template + review/export path)

Approximate **~25 partial** types using DEFAULT discovery and/or `generic-default` template, including:

Automation, Checklist, Claude Prompt, GHL Workflow, Process, Sales Page (template), Blog Post, Facebook Post, LinkedIn Post, Presentation, Video Script, Business Plan, Document, Content Strategy, Email Campaign, Launch Plan, Marketing Strategy, 5-Day Plan, Content Calendar, Client Check-In, Follow-Up Email, Referral Request, Testimonial Request, Business Strategy, Personal Companion Strategy.

### Stronger / working (~15)

Newsletter, Offer, Landing Page, Lead Magnet, Email, Email Sequence, Social Post, Workshop, Course Outline, Client Onboarding, Proposal, SOP, Training Guide, Sales Funnel, Marketing Plan.

### Systemic gaps (all types)

| Requirement | Status |
|-------------|--------|
| One question at a time | Mostly yes via discovery engine |
| Pause / resume | Supported (`createPersistence`, Continue a Saved Creation) |
| Autosave | Present for drafts |
| Review / edit / approve | Present in Create workspace; uneven by type |
| Export / print | Allowlist incomplete vs catalog; Workbook/One-Pager in print list but not in picker |
| No parallel conflicting menus | **Fail** — launcher / PRIMARY / brain lists diverge |
| Authenticated click-every-option | Still pending per 149–151 live results |

### Explicit non-Create / placeholder

- Client Avatar — routed out (correct)  
- Audience Build “future settings” copy in launcher  
- Estate brain CREATE tools without catalog workflows  

---

## 8. Prioritized implementation roadmap

### P0 — Trust & coherence (before any new tiles)

1. Single source of truth: estate picker reads only `CREATE_CATALOG` / `listActiveCreationTypes`; retire or sync `CREATE_LAUNCHER_TYPE_OPTIONS` and `PRIMARY_CREATE_ITEMS`.  
2. Merge Email Campaign → Email Sequence; Follow-Up → Email subtype; Facebook/LinkedIn → Social Post platform step.  
3. Collapse education/noise; ensure every remaining tile has a one-line “use when…” description (catalog currently has none).  
4. Finish authenticated click-every-option checklist from 149–151.

### P1 — Intent taxonomy migration

5. Re-bucket categories to recommended taxonomy (section 3) without changing workflow engines.  
6. Rename Claude Prompt → AI Prompt; clarify Marketing Strategy vs Plan vs Launch in picker copy.  
7. SOP absorbs Process as a kind question.

### P2 — Deepen partial workflows (highest traffic first)

8. Social Post platform path + dedicated templates for FB/LI.  
9. Blog Post, Video Script, Presentation dedicated templates.  
10. Sales Page template parity with Landing Page.  
11. Relationship emails as Email subtypes with short guided paths.

### P3 — Fill missing experiences

12. Add Ad Copy / Workbook / Podcast Outline only with full guided workflows.  
13. Brand story / FAQ / welcome packet when ready.  
14. Do not expose Mind Map / Whiteboard / AI Images in Create until Create-owned.

---

## 9. Files that will need updating (when implementation is approved)

| Area | Files |
|------|--------|
| Taxonomy data | `lib/createCatalogData.ts`, `lib/createCatalog.ts`, `lib/createEstate/activeCreationTypes.ts` |
| Entrance / picker UI | `CreateEstateEntrancePanel.tsx`, `CreateCatalogPicker.tsx`, `lib/createEstate/copy.ts` |
| Launcher sync / retire | `lib/createLauncherTypes.ts`, `CreateLauncherPanel.tsx`, `lib/createTypePickers.ts` |
| Discovery / templates | `lib/createWorkflow.ts`, `lib/createTemplates.ts`, `lib/createTemplateFields.ts`, `lib/createGuidedBridge.ts`, `lib/createTypePickers.ts` (`SUBTYPES`) |
| Routing | `lib/createExperience/createExperienceRouting.ts`, `lib/openCreateWorkspace.ts`, CPC Create handlers |
| Estate brain | `lib/estateBrain/capabilityRegistry.ts`, `knowledgeRegistry.ts` |
| Registry / artifacts | `lib/artifactRegistry.ts`, `docs/estate/ESTATE_REGISTRY.md` |
| Tests | `lib/createEstate/*`, create catalog / workflow tests, welcome-home Create wiring |
| Docs | Spec 104 notes, this audit, future 178 implementation report |

---

## 10. Deploy recommendation

**Do not deploy** any Create taxonomy or menu changes until:

1. Founder reviews this audit (sections 1–8).  
2. Consolidation choices (Email / Social / SOP) are approved.  
3. P0 single-menu + merge work is implemented and authenticated.  
4. No new empty categories or orphan launcher tiles ship.

This document is **recommendations only** — no product code was changed for package 178.

---

## Category evaluation (summary)

| Current category | Natural for owners? | First-time findability | Missing / wrong |
|------------------|---------------------|------------------------|-----------------|
| Business Assets | Vague “assets” | Weak — too mixed | Pages, GHL, prompts, offers jumbled |
| Content | Strong | Good | Presentations odd here; social oversplit |
| Documents | Generic | Weak | Courses / onboarding misplaced |
| Marketing | Strong | Good | Email Campaign duplicates Content |
| Planning | OK | Weak (only 3) | Overlaps Marketing |
| Relationships | OK | OK | Follow-Up belongs under Email |
| Strategies | Confusing vs Strategy Library | Weak | Personal Companion Strategy misfit |

---

*Package prompt archived: `docs/navigation/178_CURSOR_CREATE_TAXONOMY_AUDIT_AND_WORKFLOW_REDESIGN.md`*

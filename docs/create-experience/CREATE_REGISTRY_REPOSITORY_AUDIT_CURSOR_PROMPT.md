# Cursor Prompt — Spark Estate Create Registry Repository Audit and Implementation Plan
## Audit First. Do Not Begin Broad Implementation Until the Current State Is Known.

You are working inside the existing Spark Estate repository.

This prompt accompanies:

`Spark Estate Create Master Inventory and Registry`

That document is the product and architecture source of truth for the Create catalog, planned creation types, business-profile personalization, avatar handling, Project handoffs, contextual help, lifecycle status, and future expansion.

Your first job is **not** to build every missing creation type.

Your first job is to inspect the current repository carefully, determine what is already present, identify what is actually working, map it to the master registry, and produce a grounded implementation plan.

Do not make assumptions from filenames, card labels, route names, screenshots, comments, or prior plans. Verify behavior in the code and, where possible, through tests or local execution.

---

# 1. Mission

Perform a comprehensive repository audit of Create and all systems that connect to it.

Determine:

- what Create currently contains
- how Create is architected
- which creation types are registered or hardcoded
- which user-facing cards are visible
- which builders exist
- which routes work
- which routes are incorrect
- which creation experiences are generic rather than type-specific
- which items save successfully
- which items reopen successfully
- which actions are implemented
- which actions are missing
- which items can become Projects
- whether Create and Projects preserve linked source-of-truth relationships
- how Business Profile data is currently used
- how saved avatars are currently used
- whether multiple avatars are supported
- whether Help Me Choose is connected
- whether free-text creation routing is connected
- whether Browse menus are connected
- whether contextual How Do I… exists
- which creation types are partially built, broken, duplicated, hidden, obsolete, or missing

Then create an implementation plan that migrates the platform toward the master registry without damaging working experiences.

---

# 2. Non-Negotiable Product Decisions

Preserve these decisions throughout the audit and future implementation.

## 2.1 Create and Projects are distinct but connected

Create is the source of truth for content.

Projects manages execution:

- tasks
- subtasks
- milestones
- dates
- dependencies
- progress
- execution context

Turning a creation into a Project must create a linked relationship, not duplicate the source content.

## 2.2 No unfinished user-facing choices

A creation type must not be visible to users unless:

- its route works
- its builder works
- save works
- reopen works
- required actions work
- its experience is specific enough to be genuinely useful

Do not leave dead cards, placeholder routes, fake actions, or generic Coming Soon pages in the normal catalog.

Planned items remain in the internal registry with `isUserVisible: false`.

## 2.3 One canonical registry

The final architecture must have one source of truth for creation types.

Do not maintain separate disconnected lists for:

- Create cards
- Browse menus
- Search
- Help Me Choose
- Shari routing
- Business Profile recommendations
- avatar prompts
- Projects
- How Do I…
- testing

These should all derive from the canonical registry or from strongly typed relationships to it.

## 2.4 Preserve working functionality

Do not replace stable working code merely to make it look architecturally cleaner.

Identify safe migration seams.

Use incremental migration where appropriate.

## 2.5 Keep the user experience simple

The internal registry can be extensive.

The default Create experience should remain simple:

1. Describe What You Need
2. Based on Your Business
3. Continue Previous Work
4. Help Me Choose
5. Browse by Goal

Do not expose the full complexity of the registry on the first screen.

## 2.6 Business Profile and avatars should reduce repetition

When Business Profile information exists, Create should use it.

When several businesses, brands, programs, or saved avatars exist, the experience should confirm the relevant context without making the user repeatedly re-enter it.

Profile completion prompts must be:

- optional
- affirming
- benefit-led
- relevant to the current work
- never blocking

## 2.7 Shari voice and platform language

Use:

- warm
- natural
- conversational
- clear
- reassuring
- context-aware language

Refer to Spark Estate as a **platform**, not an app, tool, or system in user-facing copy.

---

# 3. Audit Scope

Audit all repository areas that may affect Create.

Search broadly rather than assuming the feature is contained in one folder.

Include:

- Create home
- Create Browse
- creation cards
- creation categories
- creation subtype menus
- template registries
- builder registries
- builder components
- creation routes
- dynamic route handlers
- database schemas
- Supabase tables
- API routes
- server actions
- save services
- autosave logic
- retrieval logic
- recent work
- previous work
- archive
- Trash
- duplicate
- print
- export
- rename
- universal item actions
- Current Focus
- Continue Your Work
- Help Me Choose
- free-text Shari routing
- search
- Business Profile
- My Business Estate
- People I Help
- avatar storage
- multi-avatar support
- Projects
- Create-to-Project conversion
- project-source links
- contextual help
- How Do I…
- Chamber recommendations
- Cartography suggestions
- Board suggestions
- test coverage
- feature flags
- seed data
- deprecated code
- placeholder implementations

Also inspect any older or parallel Create implementations that may still be reachable.

---

# 4. Repository Discovery Tasks

## 4.1 Map the current architecture

Create a concise architecture map identifying:

- relevant directories
- key components
- registries
- route definitions
- data models
- state management
- persistence services
- recommendation services
- routing services
- Project conversion services
- profile and avatar services
- test locations

For each important file, state its purpose.

Do not dump every file in the repository. Focus on the files that control Create and its connections.

## 4.2 Locate every creation-type definition

Search for:

- card arrays
- category arrays
- template definitions
- string unions
- enums
- database seed records
- route maps
- switch statements
- aliases
- builder maps
- prompt maps
- hardcoded labels
- conditionals based on creation names

Create a deduplicated list of all creation types currently represented anywhere in the repository.

Record:

- displayed name
- internal ID
- route
- builder
- category
- source file
- whether user-visible
- whether duplicated elsewhere

## 4.3 Locate every user-facing Create entry point

Identify all ways a user can begin or reopen a creation:

- Create home
- Browse
- search
- Help Me Choose
- Shari conversation
- command routing
- recommendations
- recent work
- previous work
- Project links
- Chamber links
- direct URL
- deep links
- old saved item links

Verify whether these routes converge on one architecture or multiple disconnected flows.

## 4.4 Locate persistence and save behavior

Trace:

- creation record creation
- answer persistence
- autosave
- explicit save
- draft status
- update behavior
- retrieval
- reopen
- completion
- archive
- deletion
- restoration
- version handling

Identify any state that lives only in the browser and can be lost.

Identify any generic save engines that incorrectly handle type-specific experiences.

## 4.5 Locate Business Profile and avatar data

Determine:

- where business profiles are stored
- whether multiple business contexts are supported
- where saved avatars are stored
- whether more than one avatar can be selected
- whether avatar data is attached to creations
- whether profile and avatar data are used in recommendations
- whether this context is inherited by Projects
- whether user corrections are preserved

## 4.6 Locate Create-to-Project behavior

Trace the complete flow:

1. User chooses Turn Into Project.
2. A Project is created.
3. Source creation remains in Create.
4. Project stores a source reference.
5. Project can reopen the source creation.
6. Creation can open the linked Project.
7. Context is inherited.
8. Updates do not create uncontrolled duplication.

Report where the flow currently fails or is missing.

---

# 5. Current Creation-Type Audit

For each current or discoverable creation type, assign one grounded status.

```ts
type AuditStatus =
  | "working"
  | "working-with-limitations"
  | "partially-built"
  | "visible-but-broken"
  | "wrong-route"
  | "generic-placeholder"
  | "hidden-working"
  | "defined-only"
  | "duplicate"
  | "obsolete"
  | "missing";
```

Do not mark an item `working` merely because a component or route exists.

A working creation type must pass:

- correct entry routing
- appropriate builder
- answer persistence
- leave and reopen
- expected item actions
- correct display in previous work
- no destructive state loss
- appropriate completion behavior
- Project handoff where applicable

---

# 6. Audit Matrix

Create a machine-readable or markdown audit matrix with at least these columns:

| Field | Requirement |
|---|---|
| Registry ID | Proposed canonical ID |
| Display Name | Current user-facing name |
| Master Category | Category from the master inventory |
| Master Subcategory | Subcategory from the master inventory |
| Current Source | File or data source |
| Current Internal ID | Existing ID, slug, or key |
| Current Route | Current route |
| Expected Route | Recommended canonical route |
| Builder | Current builder/component |
| Builder Specificity | Specific, shared-configurable, generic, placeholder |
| User Visible | Yes/No |
| Entry Works | Yes/No/Unknown |
| Save Works | Yes/No/Unknown |
| Reopen Works | Yes/No/Unknown |
| Rename Works | Yes/No/Unknown |
| Duplicate Works | Yes/No/Unknown |
| Print Works | Yes/No/Unknown |
| Export Works | Yes/No/Unknown |
| Archive Works | Yes/No/Unknown |
| Trash/Restore Works | Yes/No/Unknown |
| Project Handoff | Yes/No/Not Applicable/Unknown |
| Business Profile Used | Yes/No/Partial |
| Avatar Used | None/Single/Multiple/Partial |
| Help Me Choose | Connected/Not Connected |
| Search | Connected/Not Connected |
| Shari Routing | Connected/Not Connected |
| How Do I | Connected/Not Connected |
| Audit Status | One status from Section 5 |
| Severity | Blocker/High/Medium/Low |
| Recommended Action | Keep, repair, migrate, hide, merge, retire, build |
| Evidence | File references and test findings |

Use `Unknown` where direct verification is not possible. Do not convert uncertainty into a confident answer.

---

# 7. Master Inventory Reconciliation

Compare the current repository list with the master inventory.

Produce four lists.

## 7.1 Existing and represented

Items in both the repository and master inventory.

Mark:

- exact match
- alias
- probable match
- needs product decision

## 7.2 Existing but absent from the master inventory

Do not delete these automatically.

Determine whether each should be:

- added to the registry
- treated as a subtype
- merged with another type
- retired
- preserved as a special experience outside Create

## 7.3 In the master inventory but not built

Mark these as internal planned items.

Do not generate user-facing cards.

Group by:

- release essential
- next
- later
- future

## 7.4 Duplicate or overlapping types

Identify conflicts such as:

- Landing Page appearing under both marketing and sales
- Proposal appearing under sales and clients
- Event Plan versus Online Event
- Guide versus How-To Guide
- Marketing Plan versus Marketing Strategy
- Content Plan versus Content Calendar
- Follow-Up Message versus Follow-Up Sequence

Recommend one canonical record with category discovery aliases or subtype relationships rather than duplicated builders.

---

# 8. Category and Menu Audit

Evaluate whether current category labels and navigation match the working hierarchy:

1. Write & Communicate
2. Market & Grow
3. Sell & Convert
4. Work With Clients
5. Plan an Experience
6. Build & Run the Business
7. Organize Knowledge
8. Develop Ideas
9. Personal & Community

Do not immediately rewrite the UI.

First report:

- current category names
- current category order
- current subcategories
- current depth
- dead or empty groups
- overcrowded groups
- duplicate cards
- cards connected to wrong categories
- user-visible unfinished cards
- items that need to become parent types
- subtype choices that belong inside builders

Recommend a migration map:

`Current Category → New Category → New Subcategory`

Maximum normal depth:

`Category → Subcategory → Creation Type`

Do not recommend fourth-level catalog menus.

---

# 9. Based on Your Business Audit

Determine whether the current platform can generate meaningful business-specific recommendations.

Audit available signals:

- business type
- services
- offers
- people helped
- saved avatars
- business stage
- current goals
- active Projects
- typical work
- recent creations
- channels
- team structure
- upcoming launches or events

Report:

- fields currently available
- fields currently reliable
- fields currently unused
- fields duplicated across profile areas
- whether multiple business contexts can be represented
- whether recommendation logic exists
- whether recommendation explanations exist
- what minimum data is needed for a useful first version

Recommend a first implementation that is useful without overengineering.

The first version may use deterministic weighted rules before advanced learning.

Example:

```ts
score =
  businessTypeMatch * 4 +
  activeGoalMatch * 4 +
  avatarMatch * 3 +
  activeProjectMatch * 3 +
  typicalWorkMatch * 2 +
  recentUseMatch * 1;
```

Do not implement this exact formula blindly. Inspect existing architecture and recommend the safest fitting approach.

---

# 10. Multiple-Avatar Audit

Verify whether users can:

- save more than one avatar
- distinguish avatars by business or offer
- select multiple avatars for a creation
- designate a primary avatar
- create one shared version
- create primary-plus-secondary messaging
- create adapted versions
- create separate versions
- edit the selected avatar context later
- inherit audience context into Projects

Report the current data model and limitations.

Recommend the minimum viable structure for storing:

```ts
type CreationAudienceContext = {
  avatarIds: string[];
  primaryAvatarId?: string;
  mode:
    | "shared-version"
    | "primary-plus-secondary"
    | "adapted-versions"
    | "separate-versions";
};
```

Use the repository's existing conventions where possible.

---

# 11. Contextual How Do I… Audit

Locate all help systems and determine whether Create and Projects currently provide page-aware guidance.

Audit:

- Create home help
- Browse help
- builder help
- previous work help
- Project home help
- task help
- source creation help
- profile and avatar help
- route-specific direct actions

Report:

- where help content is stored
- whether it is hardcoded
- whether it is searchable
- whether it knows the current page
- whether answers can open the relevant destination
- whether user-facing instructions match actual routes
- whether outdated help remains

Recommend how How Do I… can derive location and direct actions from the canonical creation registry.

---

# 12. Universal Item Actions Audit

Audit the saved-item action model across Create and Projects.

Expected actions where appropriate:

Visible:

- Open
- Continue
- Edit

More:

- Rename
- Save
- Print
- Duplicate
- Export
- Archive
- Delete
- Restore

Report:

- which actions exist
- where they differ
- which are nonfunctional
- whether autosave is real
- whether Delete uses Trash
- whether archive is reversible
- whether print/export remain disabled indefinitely
- whether action availability is based on capability or unfinished code

Recommend a capability-driven action model rather than repeated per-card logic.

---

# 13. Testing Requirements

## 13.1 Static tests

Add or recommend tests for:

- duplicate registry IDs
- invalid category IDs
- invalid subcategory IDs
- missing routes
- missing builders
- visible non-ready items
- broken relationship IDs
- missing project templates
- invalid audience rules
- invalid How Do I… action targets

## 13.2 Route smoke tests

For every visible type:

- open from Create home
- open from Browse
- open from search
- open from Help Me Choose where applicable
- open from free-text routing where applicable
- verify correct builder title and type
- create minimal content
- save
- leave
- reopen

## 13.3 Item-action tests

Verify:

- rename
- duplicate
- archive
- delete to Trash
- restore
- print
- export

## 13.4 Project handoff tests

For applicable types:

- convert to Project
- preserve source creation
- preserve context
- open source from Project
- open Project from source
- verify no duplicate source content is created

## 13.5 Profile and avatar tests

Test:

- no Business Profile
- partial Business Profile
- completed Business Profile
- one avatar
- several avatars
- multiple selected avatars
- user chooses no saved audience
- user adds a new audience during creation
- creation context inherited into Project

---

# 14. Required Audit Deliverables

Create the following files in a clearly named repository documentation or audit folder.

## 14.1 `create-registry-current-architecture.md`

Include:

- current architecture map
- key files
- data flow
- persistence flow
- routing flow
- profile/avatar flow
- Project handoff flow

## 14.2 `create-registry-audit-matrix.md`

Include the complete per-type audit matrix.

A CSV or JSON companion is welcome if useful, but the markdown report is required.

## 14.3 `create-registry-gap-analysis.md`

Include:

- existing versus master inventory
- missing release essentials
- duplicates
- obsolete items
- routing gaps
- persistence gaps
- action gaps
- profile/avatar gaps
- How Do I… gaps
- Project gaps

## 14.4 `create-registry-implementation-plan.md`

Include phased implementation with:

- dependencies
- risk
- expected user impact
- estimated complexity: S/M/L/XL
- suggested branch or PR boundaries
- files likely to change
- tests required
- rollback considerations

## 14.5 `create-registry-audit-summary.md`

A concise executive summary with counts:

- repository-defined creation types
- user-visible creation types
- working
- working with limitations
- partially built
- visible but broken
- wrong route
- generic placeholder
- duplicate
- obsolete
- missing release essentials
- save failures
- reopen failures
- Project handoff failures
- profile/avatar integration gaps
- recommended first implementation PR

---

# 15. Implementation Planning Sequence

The audit should recommend work in this order unless repository evidence strongly supports a safer sequence.

## Phase 1: Stabilize release blockers

Prioritize:

- save
- autosave
- reopen
- wrong routes
- dead cards
- current-focus state corruption
- destructive state loss
- Project/source linking
- universal actions

## Phase 2: Add the canonical registry foundation

Create strongly typed:

- categories
- subcategories
- creation items
- aliases
- relationships
- readiness
- visibility validation
- search metadata
- recommendation metadata
- audience metadata
- Project handoff metadata
- help metadata

Migrate a small set of working creation types first.

## Phase 3: Migrate Create discovery

Connect:

- Browse
- search
- Help Me Choose
- free-text routing
- recent work
- Based on Your Business

Do not maintain duplicate source arrays.

## Phase 4: Business and avatar context

Add:

- selected business context
- saved avatar selection
- multiple-avatar modes
- progressive profile prompts
- inherited Project context

## Phase 5: Contextual How Do I…

Make help:

- page-aware
- registry-aware
- route-aware
- action-oriented

## Phase 6: Certify release-essential builders

Build or repair only the highest-value release essentials first.

Do not attempt all planned types at once.

## Phase 7: Relationship intelligence

Add:

- Usually Created Together
- related assets
- bundle suggestions
- Chamber recommendations
- map recommendations
- Board recommendations

---

# 16. First Recommended Implementation PR

At the end of the audit, propose one contained first PR.

It should likely include only:

- canonical registry types
- category and subcategory records
- readiness and visibility validation
- migration of a small number of known-working creation types
- tests proving the registry works
- no major visual redesign

Do not include dozens of builders in the first PR.

The first PR should reduce future risk and establish a migration pattern.

Provide:

- proposed PR title
- exact scope
- files to add
- files to modify
- tests
- non-goals
- acceptance criteria

---

# 17. Acceptance Criteria for This Audit

The audit is complete only when:

- all current Create definitions have been located
- all user-visible Create entry points have been located
- all discoverable current creation types are listed
- each has an evidence-based status
- current routes and builders are mapped
- persistence is traced
- Business Profile and avatar integration is traced
- Create-to-Project behavior is traced
- current types are reconciled with the master inventory
- duplicates and aliases are identified
- release-essential gaps are listed
- the phased implementation plan is actionable
- the first PR is clearly bounded
- no unverified assumptions are presented as fact

---

# 18. Final Instruction

Start with discovery and evidence.

Do not begin broad implementation while auditing.

Do not rewrite the Create experience based only on this prompt.

Inspect the repository, document the current reality, identify the safest migration path, and then recommend the first contained implementation step.

The outcome should let the founder answer these questions confidently:

- What do we already have?
- What actually works?
- What is broken?
- What is missing?
- What should users see now?
- What should remain hidden?
- What should we fix first?
- How will the registry keep future additions connected automatically?

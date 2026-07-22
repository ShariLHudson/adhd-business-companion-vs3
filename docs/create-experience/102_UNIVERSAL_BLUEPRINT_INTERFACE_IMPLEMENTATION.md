# 102 — Universal Blueprint Interface Implementation

## Purpose

Build the universal user-facing Blueprint experience on top of the completed Universal Work Engine and Universal Blueprint Framework.

This must be one reusable interface for Event and every future Work Type. Do not build an Event-only Blueprint interface.

## Existing authoritative foundations

Use the existing implementations and reports as authoritative:

- `docs/create-experience/095_CREATE_CORE_OWNERSHIP_AUDIT.md`
- `docs/create-experience/096_UNIVERSAL_WORK_ENGINE_EXTRACTION_REPORT.md`
- `docs/create-experience/098_UNIVERSAL_BLUEPRINT_FRAMEWORK_REPORT.md`
- `docs/create-experience/099_BLUEPRINT_FRAMEWORK_BLOCKERS.md`
- `lib/universalWorkEngine/`
- `lib/universalWorkEngine/blueprints/`
- existing durable Blueprint storage implementation and reports, if already completed

Do not create competing registries, save paths, runtime engines, or Blueprint models.

## Primary outcome

A user must be able to begin, preview, select, adapt, reuse, save, and continue Blueprint-based work without needing to understand the architecture or navigate to a special technical area.

The interface must support:

- Start From Scratch
- Start From Blueprint
- Build From Previous Work
- Quick Start
- Guided Build
- Complete Planning
- Blueprint preview
- known-context reuse preview
- selective content reuse
- Save as Personal Blueprint
- Save as Company Blueprint
- change depth without creating duplicate Work
- return to the exact prior section
- accessible and ADHD-supportive interaction

## Universal ownership rule

The interface may call only approved Universal Work Engine and Blueprint public exports.

It may not:

- mint Work IDs
- directly access durable repositories
- create a private Blueprint registry
- create a private save system
- create an Event-specific runtime
- duplicate Blueprint definitions in UI files
- silently fall back to legacy templates

## Required entry experience

When a user begins compatible work, provide three primary paths:

1. Start From Scratch
2. Start From Blueprint
3. Build From Previous Work

Do not force a Blueprint when the user prefers to begin from scratch.

Do not display a large overwhelming catalogue by default.

Use progressive disclosure and context-aware recommendations.

## Blueprint browser

Create a universal Blueprint browser that supports:

- recommended Blueprints
- Spark Blueprints
- Personal Blueprints
- Company Blueprints
- recently used Blueprints
- compatible previous work
- search
- filters by Work Type
- filters by depth or complexity
- filters by personal/company/Spark source
- preview before use
- accessible list and card views where appropriate

Only show Blueprints compatible with the selected or inferred Work Type.

Unknown or incompatible Blueprint IDs must fail safely and visibly.

## Blueprint preview

The preview must show, in plain language:

- what the Blueprint helps create
- who it is for
- approximate level of detail
- available depth modes
- major sections
- likely deliverables
- suggested tasks and milestones
- commonly forgotten areas it will help cover
- what known information may be reused
- whether it creates or connects a Project
- relevant Chamber, Board, research, and Cartography support

Do not show technical schema names to the user.

## Depth selection

Support:

### Quick Start
Ask only what is required to produce a useful first version.

### Guided Build
Provide explanations, examples, adaptive questions, and suggested next steps.

### Complete Planning
Provide full expert depth, risk checks, implementation tasks, dependencies, research prompts, quality checks, and completion requirements.

Requirements:

- depth can be selected before initialization
- depth can be changed later
- changing depth preserves the same canonical Work ID
- changing depth does not erase user-entered content
- newly revealed sections are added without duplicating prior sections
- hidden system sections remain hidden
- user can see what will change before confirming a depth change

## Known-context reuse review

Before initializing from a Blueprint, show which known information can be reused.

Examples:

- business name
- audience
- offers
- brand preferences
- existing Project
- prior decisions
- dates
- people
- budget assumptions

Requirements:

- user may approve all, approve selected, edit, or decline reuse
- inferred information must be clearly marked
- confidential information must not be reused without approval
- reuse must be recorded in provenance
- no silent overwrite of member-entered content

## Build From Previous Work interface

Allow the user to:

- find compatible prior work
- preview reusable sections
- select only what to reuse
- exclude dates, private notes, completed tasks, outdated decisions, and confidential data
- see provenance
- create a new canonical Work item
- maintain a relationship to the source Work ID

The original Work item must remain unchanged.

## Save as Blueprint interface

Allow approved Work to be saved as:

- Personal Blueprint
- Company Blueprint

The review experience must:

- identify instance-specific names
- identify dates
- identify confidential information
- identify completed-state data
- identify private notes
- identify outdated decisions
- propose generic replacements where appropriate
- allow the user to include or exclude each item
- require explicit confirmation
- preserve the original Work item
- create a new Blueprint version rather than mutate a published version

Company Blueprint saving must enforce company scope and authorization.

## Resume and continuity

The interface must preserve:

- canonical Work ID
- current section
- current question
- depth mode
- selected Blueprint
- approved known-context reuse
- source Work provenance
- unsaved-recovery state
- Project and relationship context

Refresh, exit, and reopen must return to the correct place.

## Event Blueprint support

The interface must work with the five registered Event Blueprints:

- Business Luncheon
- Online Workshop
- One-Day Workshop
- Three-Day Retreat
- Book Signing

Do not hard-code these into the universal interface.

They must appear through Blueprint registry lookup.

## ADHD-supportive experience requirements

The interface must:

- avoid showing too many choices at once
- provide a recommended next step
- use plain language
- preserve progress automatically
- allow "I don't know"
- allow skip and return later
- explain why a question matters when helpful
- ask one primary question at a time
- distinguish energy from motivation where relevant
- support low-energy continuation
- provide visible reassurance that work is saved
- avoid making the user restart because they chose the wrong depth

## Accessibility

Meet existing Spark Estate accessibility contracts.

Include:

- keyboard navigation
- visible focus states
- screen-reader labels
- large readable typography
- appropriate contrast
- reduced-motion support
- no pointer-only interactions
- clear validation messages
- accessible modals and drawers
- logical heading order

## Required tests

Add automated tests proving:

- all three start paths work
- Blueprint browser uses the universal registry
- incompatible Blueprints are excluded
- unknown Blueprint IDs fail safely
- preview reflects registry data
- Quick Start, Guided Build, and Complete Planning preserve one Work ID
- changing depth does not duplicate work
- known-context reuse requires approval
- declined known-context values are not applied
- Build From Previous Work copies only selected content
- source provenance is preserved
- Save as Personal Blueprint requires review confirmation
- Save as Company Blueprint enforces scope
- confidential and instance-specific data is stripped unless explicitly retained
- refresh and resume preserve current location
- no direct durable repository access from UI or Work Type packages
- Event/Create regression remains passing
- Universal Work Engine regression remains passing
- Blueprint framework regression remains passing

## Browser verification

Verify in the real interface:

1. Start an Event from scratch.
2. Start an Event from Business Luncheon Blueprint.
3. Preview a Blueprint before use.
4. Change from Quick Start to Guided Build.
5. Confirm the same Work ID.
6. Reuse approved known information.
7. Decline one proposed reused value.
8. Build from compatible previous work.
9. Save completed work as a Personal Blueprint.
10. Review and strip instance details.
11. Refresh and resume.
12. Confirm no duplicate Work or Blueprint was created.

Record screenshots or equivalent browser evidence in the report where the repository's certification process supports it.

## Required documentation

Create:

- `docs/create-experience/102_UNIVERSAL_BLUEPRINT_INTERFACE_REPORT.md`
- `docs/create-experience/102_UNIVERSAL_BLUEPRINT_INTERFACE_BLOCKERS.md`

The report must include:

- authoritative files and exports
- interface architecture
- user flows
- depth-mode implementation
- known-context reuse
- previous-work reuse
- save-as-Blueprint experience
- accessibility
- tests added
- browser verification
- regression results
- unresolved risks

The blockers file must include only release-blocking issues. If none remain, state that clearly with evidence.

## Completion rule

Do not declare this complete unless:

- the interface is universal rather than Event-specific
- all three start paths work
- the five Event Blueprints appear through the registry
- depth switching preserves one Work ID
- known-context reuse is reviewable
- Save as Blueprint is protected
- Build From Previous Work is protected
- resume works after refresh
- no shadow registry or persistence path exists
- all regression suites pass

Do not build Marketing Plan.

Do not commit or push until implementation, tests, browser verification, reports, and blocker review are complete.

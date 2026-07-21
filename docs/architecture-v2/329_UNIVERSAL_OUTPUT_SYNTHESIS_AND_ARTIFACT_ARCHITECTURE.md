# 329 — Universal Output Synthesis and Artifact Architecture

## Purpose

Define how Spark Estate turns knowledge, capability contributions, user input, and Work state into coherent outputs without losing ownership, provenance, editability, or continuity.

## Output types

Spark Estate may create:

- plans
- strategies
- briefs
- reports
- checklists
- templates
- scripts
- emails
- social content
- presentations
- spreadsheets
- documents
- calculations
- decision summaries
- recommendations
- Project plans
- event plans
- learning materials
- marketing assets
- operating procedures
- dashboards
- assessments

## Canonical output contract

Every output must declare:

- output ID
- output type
- title
- originating Work ID
- business ID
- Collection ID when applicable
- Blueprint ID when applicable
- capability contributions
- source materials
- version
- status
- owner
- editable state
- approval state
- generated at
- updated at
- export formats
- provenance
- assumptions
- known limitations

## Output status

- draft
- awaiting review
- approved
- published
- superseded
- archived

## Synthesis principles

The synthesis layer must:

- preserve the user's voice
- remove duplicate contributor content
- resolve terminology
- preserve material disagreement
- distinguish fact from recommendation
- distinguish confirmed information from assumption
- adapt length and depth
- retain editability
- connect outputs to canonical Work

## User voice preservation

When generating content in the user's voice:

- use confirmed voice rules
- preserve meaning
- avoid inserting unsupported claims
- avoid flattening personality
- keep sensitive language aligned with user values
- allow direct correction
- retain source drafts where appropriate

## Multi-capability synthesis

When several capabilities contribute:

1. establish the primary output purpose
2. identify decisive capability
3. assemble supporting contributions
4. remove overlap
5. resolve conflict
6. identify assumptions
7. preserve provenance
8. produce one coherent artifact
9. request approval
10. store as canonical output

## Output variants

Variants may be used when genuinely useful.

Examples:

- concise versus detailed
- beginner-facing versus expert-facing
- internal versus client-facing
- formal versus conversational
- low-energy next step versus full implementation

Variants must share a parent output relationship.

## Export behavior

Exports must preserve:

- title
- version
- date
- user ownership
- source Work linkage when appropriate
- accessibility
- readable formatting

## Output update behavior

When an output changes:

- increment version
- preserve prior version
- record change reason
- retain approvals
- identify affected downstream artifacts
- avoid silently overwriting published material

## Artifact generation boundary

File-generation systems may render outputs but must not become the source of truth.

The source artifact remains connected to Universal Work.

## Required tests

- output creation
- user voice preservation
- multi-capability synthesis
- conflict disclosure
- assumption visibility
- versioning
- variants
- approval
- export
- edit and resume
- downstream dependency warning
- source-of-truth preservation

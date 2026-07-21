# 330 — Universal Work, Collection, Blueprint, and Project Bridge

## Purpose

Define the authoritative relationship between:

- Universal Work
- Collections
- Blueprints
- Projects
- Tasks
- Outputs
- Research
- Cartography

## Core rule

Create remains the source of truth for content.

Projects manages execution.

Collections organize experiences.

Blueprints guide implementation.

Universal Work owns canonical identity.

## Work ownership

Universal Work owns:

- Work ID
- Work Type
- title
- state
- history
- versions
- outputs
- relationships
- resume
- origin
- current owner
- approvals

## Collection relationship

A Work item may:

- originate from a Collection
- use several Collections
- appear in several Collection views
- transition between Collections

The Collection does not own the Work ID.

## Blueprint relationship

A Blueprint:

- creates or advances Work
- records Blueprint ID and version
- supplies guided structure
- may generate outputs
- may propose Projects
- may request capabilities

The Blueprint does not own separate persistence.

## Project relationship

A Project manages:

- execution plan
- tasks
- subtasks
- owners
- dates
- dependencies
- milestones
- status
- workload
- completion

A Project must link to source Work.

It must not duplicate the full source artifact.

## Intentional Create-to-Project handoff

A Project should be created only when:

- the user explicitly chooses execution
- the Work is ready enough
- the relationship is clear
- duplicate protection passes

The handoff should allow:

- use recommended Project
- customize
- browse other structures
- continue without a Project

## Task generation

Tasks must include:

- source Work ID
- Project ID
- originating Blueprint step when applicable
- owner
- status
- due date if approved
- dependencies
- effort estimate
- context
- completion evidence

## Research relationship

Research:

- supports Work
- retains sources
- proposes updates
- requires approval before material Work mutation
- remains linked to the Work and capability request

## Cartography relationship

Cartography visualizes:

- Work-to-Work relationships
- Work-to-Project relationships
- Work-to-Collection relationships
- Work-to-output relationships
- Work-to-business relationships
- dependency and influence

Cartography does not own source data.

## Completion synchronization

Project completion may update execution state.

It must not automatically mark source Work complete when:

- content approval remains
- outputs remain unpublished
- unresolved decisions remain
- maintenance continues

## Deletion and archive behavior

Deleting a Project must not delete source Work.

Archiving Work must preserve linked Project history.

Delete behavior must surface affected relationships.

## Required tests

- Collection-originated Work
- Blueprint-originated Work
- intentional Project handoff
- duplicate Project prevention
- task linkage
- Research approval
- Cartography visualization
- completion synchronization
- archive
- delete safety
- source content remains canonical
- exact resume across surfaces

# 298 — Canonical Work, Project, Operations & Resource Objects

## Purpose

Define the shared operational objects used by Create, Projects, Blueprints, Execution, Events, Operations, and industry workflows.

## Universal Work

Universal Work is the canonical wrapper for actionable or reviewable work.

Fields:

- work_id
- business_id
- work_type
- title
- description
- source_type
- source_id
- Blueprint ID
- Blueprint session ID
- Create artifact ID
- Project ID
- owner
- contributors
- status
- priority
- dates
- context envelope
- approvals
- dependencies
- provenance
- resume point

## Create Artifact

Create is the source of truth for created content.

Fields:

- create_artifact_id
- business_id
- artifact type
- title
- content or structured payload
- source Blueprint
- selected context
- version
- owner
- contributors
- approval state
- related objects
- Project handoff state
- archive state

## Project

Projects manage execution, not duplicate content.

Fields:

- project_id
- business_id
- source_create_artifact_id
- source_blueprint_session_id
- title
- purpose
- desired outcome
- owner
- team
- start date
- target date
- status
- milestones
- tasks
- risks
- decisions
- related objects
- progress metrics

## Milestone

Fields:

- milestone_id
- project_id
- title
- success criteria
- target date
- owner
- status
- dependencies
- completion evidence

## Task

Fields:

- task_id
- project_id or work_id
- title
- description
- owner
- status
- priority
- due date
- estimate
- energy requirement
- dependency IDs
- source section
- completion evidence
- recurring rule
- history

## Checklist

A checklist is reusable and may instantiate tasks.

Fields:

- checklist_id
- title
- context
- items
- required vs. optional
- sequence
- completion rule
- version

## Appointment

Fields:

- appointment_id
- business_id
- participants
- service or purpose
- start and end
- location or meeting method
- preparation
- reminders
- status
- related client, Project, or order

## Event

Fields:

- event_id
- business_id
- title
- event type
- audience
- venue or location
- dates
- capacity
- speakers
- vendors
- budget
- schedule
- registration
- safety and contingency
- status

## Location

Fields:

- location_id
- business_id
- type
- name
- address
- service area
- timezone
- capacity
- operating hours
- accessibility
- status

## Asset

Represents equipment, property, vehicles, files, or rentable resources.

Fields:

- asset_id
- business_id
- asset type
- name
- identifier
- location
- ownership
- condition
- availability
- maintenance
- cost
- value
- status
- evidence and history

## Inventory Item

Fields:

- inventory_item_id
- product or supply reference
- location
- quantity
- reserved quantity
- reorder point
- lot or serial references
- expiration where relevant
- cost
- status

## Reservation

Fields:

- reservation_id
- asset, room, service, or capacity reference
- client or participant
- start and end
- quantity
- status
- conflicts
- deposit
- related order

## Work Order

Fields:

- work_order_id
- client, asset, location, or Project
- scope
- assigned team
- materials or parts
- scheduled dates
- status
- inspections
- approvals
- completion record
- cost and billing triggers

## Schedule and Capacity

Canonical schedule objects must support:

- people
- locations
- equipment
- rooms
- services
- Projects
- appointments
- shifts
- events
- reservations

Conflict detection must occur against the same canonical schedule layer.

## Operational integrity rules

- no duplicate Task model
- no duplicate Project created during handoff
- content remains linked to Create
- work status changes preserve history
- scheduling must detect conflicts
- assignments require owner or responsible role
- asset and inventory movement must preserve audit history
- completion must support evidence when required

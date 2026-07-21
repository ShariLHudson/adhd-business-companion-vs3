# 299 — Canonical Knowledge, Content, Decision & Measurement Objects

## Purpose

Define shared objects for knowledge, content, communications, decisions, risks, goals, metrics, dashboards, and evidence.

## Knowledge Item

Fields:

- knowledge_item_id
- business_id
- title
- type
- content
- topic
- source
- evidence level
- approved reuse
- confidentiality
- owner
- version
- review date
- status

Types may include:

- framework
- method
- insight
- research summary
- procedure
- policy
- lesson
- FAQ
- playbook
- guide
- template

## Content Asset

Fields:

- content_asset_id
- business_id
- content type
- title
- audience IDs
- offer IDs
- channel
- purpose
- message
- content
- brand context
- rights
- source provenance
- approval state
- version
- publication status

## Template

Fields:

- template_id
- object type produced
- required fields
- optional fields
- instructions
- business or global ownership
- version
- approved status

## Communication

Fields:

- communication_id
- business_id
- participants
- related client, Project, event, order, or issue
- channel
- direction
- subject
- body or summary
- date
- action items
- confidentiality
- delivery status
- source reference

## Decision

Fields:

- decision_id
- business_id
- title
- context
- options
- criteria
- evidence
- tradeoffs
- decision
- decision owner
- date
- review trigger
- affected objects
- provenance

## Approval

Fields:

- approval_id
- object_id
- approval type
- requested from
- status
- conditions
- date
- comments
- authority basis
- history

## Risk

Fields:

- risk_id
- business_id
- related object
- category
- description
- likelihood
- impact
- severity
- owner
- mitigation
- trigger
- status
- review date

## Incident

Fields:

- incident_id
- business_id
- type
- related object
- date and location
- description
- people involved
- evidence
- immediate actions
- escalation
- review status
- resolution
- confidentiality

## Goal

Fields:

- goal_id
- business_id
- scope
- title
- desired outcome
- reason
- owner
- start and target dates
- measures
- milestones
- status
- related Projects and objects

## Metric Definition

Fields:

- metric_definition_id
- name
- purpose
- formula
- source objects
- filters
- unit
- frequency
- owner
- quality rules
- version

## Metric Observation

Fields:

- metric_observation_id
- metric definition
- period
- value
- source snapshot
- calculated at
- confidence
- validation status

## Dashboard

Fields:

- dashboard_id
- business_id
- purpose
- audience
- metric definitions
- filters
- comparison periods
- alerts
- layout reference
- refresh state
- owner
- version

## Evidence and provenance rules

- facts must identify sources
- calculations must identify formulas and source records
- AI-generated content must identify assumptions
- confidential knowledge must not be reused without permission
- client-specific content must remain isolated
- dashboards must not define metrics only by display label
- metric changes require new versions
- decisions must preserve the information available at decision time

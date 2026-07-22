# 435 — Event Asset Generation, Update & Lineage Standard

## Purpose

Turn canonical Event Asset Registry definitions into connected, editable event-specific assets.

## Core distinction

### Asset definition

Reusable canonical specification.

### Asset instance

The actual agenda, budget, email, guide, workbook, plan, or other artifact for one event.

## Generation requirements

Every asset instance must reference:

- Event Record
- Event Creation Workspace
- asset definition
- lifecycle phase
- event section
- source decisions
- primary Chamber owner
- related assets
- version
- status

## Update intelligence

When a core event decision changes, identify affected assets.

Examples:

- audience change affects landing page, registration form, emails, agenda, accessibility, and marketing
- format change affects technology, venue, catering, run of show, signage, and communications
- date change affects registration, vendors, speakers, reminders, and promotion
- scope change affects budget, staffing, assets, and timeline

## User-facing behavior

> “Changing the event from in-person to hybrid may affect seven connected assets. I can update the shared facts first and then show you which assets need review.”

## No silent overwrite

Preserve:

- source version
- user edits
- change reason
- affected relationships
- rollback path

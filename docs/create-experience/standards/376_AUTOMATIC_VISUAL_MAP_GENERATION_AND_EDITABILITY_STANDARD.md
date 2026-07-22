# 376 — Automatic Visual Map Generation & Editability Standard

## Purpose

Ensure the user receives visual value without needing to build a map manually.

## Governing principle

> Spark Estate builds the first useful visual. The user shapes it only if they want to.

## Automatic generation behavior

During creation, the platform should automatically identify:

- primary purpose
- major sections
- component parts
- source materials
- decisions
- people involved
- linked capabilities
- related artifacts
- dependencies
- missing pieces
- intended outputs
- next steps

It then creates the most suitable visual representation.

## Default map types by creation

### Guide, manual, or policy

Create a structure map showing sections, audiences, responsibilities, and companion materials.

### Plan or strategy

Create an outcome map showing goals, choices, actions, dependencies, and measures.

### Event

Create a timeline and role-connection view.

### Workflow or SOP

Create a process flow.

### Content set

Create a content family and distribution map.

### Decision brief

Create an options-to-decision map.

### Project-linked creation

Create a source-to-execution map.

### Scattered notes

Create a cluster map.

## User control

The user may:

- edit labels
- move items
- group items
- ungroup items
- connect items
- disconnect items
- hide items
- delete the view
- reset to the system-generated version
- create a different view from the same data

## User edits are authoritative for presentation

When the user changes layout or visibility, preserve those choices for that view.

When the user changes a relationship:

- clarify whether they are changing only the visual or the underlying canonical relationship
- apply the correct change
- preserve audit history where needed

## No maintenance burden

The user should not have to keep the map current manually.

When the underlying creation changes, the system should:

- update new relationships automatically
- preserve user layout where possible
- flag major structural changes
- avoid undoing intentional user edits

# 322 — Platform Master Index and Documentation Graph Architecture

## Purpose

Define the authoritative navigation layer for all Spark Estate architecture, knowledge, implementation, testing, certification, and maintenance documentation.

## Core principle

No developer, AI agent, or reviewer should need to rediscover the platform's structure from scattered files.

## Master Index sections

### Constitutional documents

Include:

- active Constitution
- superseded Constitutions
- ratification status
- effective date

### Architecture documents

Include:

- file number
- title
- status
- owner
- dependencies
- supersedes
- implementation status
- certification

### Chamber Members

For each Member:

- canonical ID
- mission
- owner
- knowledge files
- capability manifest
- routing
- retrieval
- conversation
- implementation
- Collections owned
- Collections contributed to
- tests
- certification
- maintenance

### Capabilities

For each capability:

- ID
- owner
- version
- status
- consumers
- dependencies
- tests
- certification

### Collections

For each Collection:

- ID
- owner
- contributors
- capabilities
- assets
- audiences
- stages
- Work Types
- certification

### Blueprints

For each Blueprint:

- ID
- Collection
- owner
- Work Type
- version
- outputs
- tests
- certification

### Business identities

For each identity:

- ID
- aliases
- recommended Collections
- common capabilities
- certification

### Work Types

For each Work Type:

- ID
- owner
- schema
- lifecycle
- integrations
- certification

### Reports

Include:

- audits
- migration plans
- implementation plans
- certification reports
- architecture health reports
- blocker reports

## Documentation graph

The platform should represent relationships such as:

- governs
- implements
- tests
- certifies
- supersedes
- dependsOn
- contributesTo
- owns
- references
- migrates
- deprecates
- replaces

## Document metadata

Every governed document should include:

- canonical document ID
- title
- version
- status
- owner
- created date
- updated date
- effective date
- dependencies
- supersedes
- superseded by
- implementation status
- certification status
- related registry objects

## Search and navigation

The Master Index should support:

- search by ID
- search by title
- search by owner
- search by Member
- search by Collection
- search by capability
- search by Work Type
- search by status
- search by certification
- find unresolved dependencies
- find missing documents

## Agent-use contract

AI implementation agents must:

1. read the active Constitution
2. resolve the relevant registry objects
3. read governing architecture
4. read owner-specific contracts
5. inspect existing implementation
6. inspect tests and certification
7. check the Master Index for superseding documents
8. avoid creating new architecture without audit

## Missing-document detection

Report:

- Member missing capability manifest
- Collection missing owner
- Blueprint missing Work Type
- capability missing tests
- production object missing certification
- document missing owner
- superseded file still referenced
- implementation without governing architecture

## Required outputs

Cursor should maintain:

- human-readable Markdown Master Index
- machine-readable registry export
- documentation graph
- unresolved-items report
- update history

## Required tests

- index completeness
- supersession resolution
- link integrity
- registry consistency
- document metadata validation
- missing-document detection
- search
- machine-readable export
- agent navigation

# 275 — Blueprint Context Prefill, Override & Synchronization Protocol

## Purpose

Define exactly how context moves into and out of every Blueprint.

## Blueprint start protocol

When a Blueprint starts:

1. Identify active user
2. Identify active business
3. Load Business Profile
4. Load Business DNA
5. Load relevant client avatars
6. Load relevant offers, products, and services
7. Load current Project or Create context if launched from one
8. Load prior session for this Blueprint and business
9. Detect missing, stale, and conflicting fields
10. Calculate context confidence
11. Prefill all reliable fields
12. Ask only necessary confirmation questions
13. Begin at the next meaningful step

## Context-confidence levels

### High confidence

Use automatically when:

- one active business exists
- one relevant avatar exists
- selected context is explicit
- canonical records are current
- no conflicts exist

### Medium confidence

Prefill but confirm briefly when:

- several related avatars exist
- the Blueprint was opened outside a Project
- an offer is inferred from recent activity
- one material field may be stale

### Low confidence

Ask for selection when:

- multiple businesses are plausible
- the current work conflicts with profile context
- the audience is unclear
- the user opened a general Blueprint without a selected business
- saved information is materially incomplete

## Prefill behavior

Prefilled fields must be:

- visible when relevant
- editable
- attributed
- non-destructive
- preserved on resume

The platform should be able to say:

> “I brought in your existing business description, client avatar, offer, and brand voice.”

## Override scopes

Every override must be classified as:

### Session-only

Used only for the current interaction.

### Blueprint-only

Used for this Blueprint session and future resumes of it.

### Creation-only

Used only for the current Create artifact.

### Project-only

Used only for the linked Project.

### Canonical update

Updates Business Profile, Business DNA, avatar, offer, product, or service.

## Required update question

When new information differs from canonical context, ask:

> “Should I use that only here, or update your Business Profile too?”

Available actions:

- Use only here
- Update the canonical record
- Save as a new business
- Save as a new client avatar
- Save as a new offer
- Keep both and choose later

Only show actions relevant to the field.

## Synchronization rules

### Canonical-to-Blueprint

When canonical information changes:

- active Blueprint sessions should detect the change
- do not overwrite local overrides
- show a concise update notice when the change is relevant
- allow refresh, compare, or keep current Blueprint version

### Blueprint-to-canonical

When the user approves an update:

- write only approved fields
- preserve old values in revision history
- update provenance
- do not update unrelated fields
- notify affected active sessions

### Project and Create synchronization

Create remains the source of truth for content.

Projects manage execution.

Blueprint context may reference both but must not duplicate them.

When a Blueprint output becomes a Project:

- retain the original Create source
- link Project tasks to source sections
- preserve business and avatar context
- preserve Blueprint provenance
- avoid copying content into unlinked records

## Resume protocol

On resume, restore:

- business
- avatar
- offer
- product or service
- local overrides
- completed steps
- unanswered questions
- active creation
- linked Project
- exact next step

Never restart intake unless context is missing or invalid.

## Failure handling

When profile context cannot be loaded:

- state the limitation honestly
- continue with minimal necessary questions
- preserve entered answers locally
- offer canonical sync after the connection is restored
- never discard user work

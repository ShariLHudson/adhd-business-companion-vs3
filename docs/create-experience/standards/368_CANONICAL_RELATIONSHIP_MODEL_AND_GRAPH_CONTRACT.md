# 368 — Canonical Relationship Model & Graph Contract

## Purpose

Create one authoritative relationship layer used by all visual views.

## Core rule

Visuals render canonical relationships. They do not create a separate visual-only truth.

## Required relationship object

```yaml
relationship:
  relationship_id:
  from_object_id:
  from_object_type:
  to_object_id:
  to_object_type:
  relationship_type:
  direction:
  label:
  description:
  source:
  confidence:
  status:
  created_at:
  updated_at:
  visibility:
  user_confirmed:
  user_modified:
```

## Supported relationship types

- originated_from
- contributes_to
- supports
- depends_on
- blocks
- informs
- answers
- belongs_to
- related_to
- created_from
- adapted_from
- companion_to
- part_of
- owned_by
- reviewed_by
- decided_by
- scheduled_for
- completed_by
- replaces
- conflicts_with
- duplicates
- follows
- next_step_for

## Relationship truth levels

- explicit
- system-derived
- inferred
- suggested
- user-confirmed
- user-corrected

Inferred relationships must not be presented as certain.

## Anti-duplication rule

Do not copy source content into the relationship layer.

Store references and relationship meaning only.

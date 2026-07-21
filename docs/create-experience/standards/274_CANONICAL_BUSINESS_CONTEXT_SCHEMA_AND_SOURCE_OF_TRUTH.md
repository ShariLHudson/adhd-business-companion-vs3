# 274 — Canonical Business Context Schema & Source of Truth

## Purpose

Define one authoritative context model that every Blueprint and Chamber capability uses.

## Canonical entities

The platform must maintain canonical records for:

### Business

Required fields:

- business_id
- name
- legal_name when applicable
- type
- industry
- description
- business_model
- stage
- location
- service_area
- channels
- mission
- vision
- values
- goals
- constraints
- active_status
- created_at
- updated_at

### Business DNA

Fields may include:

- positioning
- differentiators
- brand promise
- tone
- voice
- language rules
- values
- decision principles
- risk posture
- customer experience principles
- operating philosophy
- quality standards
- growth preferences

### Client Avatar

Required fields:

- avatar_id
- business_id
- name
- description
- role or identity
- goals
- frustrations
- needs
- buying triggers
- objections
- context
- preferred communication
- accessibility considerations
- active_status
- updated_at

### Offer

Required fields:

- offer_id
- business_id
- name
- category
- description
- audience_ids
- outcomes
- delivery_model
- pricing_reference
- status
- updated_at

### Product or Service

Required fields:

- item_id
- business_id
- type
- name
- description
- audience_ids
- price_reference
- status
- related_offer_ids
- updated_at

### Brand Context

Required fields:

- business_id
- brand_voice
- tone
- vocabulary
- prohibited_phrasing
- visual_identity_reference
- messaging_pillars
- claims_rules
- updated_at

### Blueprint Context

Required fields:

- blueprint_session_id
- blueprint_id
- business_id
- selected_avatar_ids
- selected_offer_ids
- selected_product_or_service_ids
- current_goal
- session_overrides
- inherited_fields
- missing_fields
- stale_fields
- conflict_fields
- source_provenance
- status
- last_resume_point
- updated_at

## Source-of-truth rules

### Canonical records

Business Profile, Business DNA, avatars, offers, products, and services are canonical records.

Blueprints reference these records.

Blueprints must not create disconnected copies that silently drift.

### Snapshot behavior

A Blueprint may retain a versioned snapshot for historical accuracy.

The snapshot must:

- reference the canonical source
- record the source version
- record the snapshot date
- preserve any local overrides
- never pretend to be the current canonical record

### Field-level provenance

Every inherited field should record:

- source_type
- source_id
- source_field
- source_version
- inherited_at
- overridden
- override_scope
- user_confirmed

## Read behavior

Blueprints should read:

- current canonical values
- Blueprint-local overrides
- current Project or Create context
- relevant prior decisions

## Write behavior

Blueprints may write directly to:

- Blueprint session context
- current Create artifact
- current Universal Work object

Blueprints may update canonical profile records only after explicit user permission.

## Conflict behavior

When two canonical sources conflict:

- do not guess silently
- identify the conflicting fields
- determine whether one source is newer or explicitly selected
- ask the user only when the conflict affects the output
- preserve both values until resolved

## Staleness behavior

A field may be marked stale when:

- the user indicates it changed
- the field is older than a configured review threshold
- a related canonical record changed
- a prior Blueprint used a conflicting override
- the business or offer status changed

Do not force periodic re-entry of all information.

Ask only about stale fields that materially affect the current work.

## Deletion and archive rules

Archived businesses, avatars, offers, or services:

- remain available to historical Blueprint records
- must not be used automatically for new work
- must be visibly marked archived
- may be restored only intentionally

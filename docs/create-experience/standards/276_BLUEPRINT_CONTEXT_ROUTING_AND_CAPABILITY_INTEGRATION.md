# 276 — Blueprint Context Routing & Capability Integration

## Purpose

Ensure every Chamber capability and Blueprint uses the same selected business context.

## Universal context envelope

Every Blueprint and capability call must receive a context envelope containing:

- user_id
- business_id
- blueprint_id
- blueprint_session_id
- selected_avatar_ids
- selected_offer_ids
- selected_item_ids
- create_artifact_id when applicable
- project_id when applicable
- active_goal
- brand_context
- locale
- accessibility preferences
- context_version
- provenance
- override_summary

## Routing rule

No Chamber capability should operate on a Blueprint request without the active context envelope.

Examples:

- Marketing receives the selected audience, offer, business positioning, and brand voice.
- Finance receives the selected business, pricing assumptions, currency, and relevant offer.
- Creative Studio receives brand context, audience, offer, asset purpose, and visual references.
- Operations receives business model, team, location, service structure, and operating constraints.
- Client Relationship receives client avatar, customer journey, communication preferences, and service context.
- Projects receives links to the originating Create artifact, Blueprint session, and selected business context.

## Chamber isolation rule

A Chamber capability must not:

- switch businesses silently
- choose a different avatar without approval
- substitute a generic audience when a selected avatar exists
- overwrite canonical context
- store an incompatible duplicate business record
- lose provenance when returning an output

## Return contract

Every capability response should return:

- output
- output_type
- business_id
- avatar_ids
- offer_ids
- source references
- assumptions
- unresolved questions
- proposed canonical updates
- save destination
- Project handoff eligibility

## Blueprint orchestration

The Blueprint owns the experience.

Chamber capabilities contribute expertise.

The Blueprint must:

- maintain context continuity
- merge contributions coherently
- reject incompatible returned context
- prevent duplicate outputs
- preserve one source of truth
- record which capability produced each contribution

## Context-aware question reduction

Before asking any user question, the Blueprint must check:

1. Is the answer in canonical business context?
2. Is the answer in the active avatar?
3. Is the answer in the selected offer?
4. Is the answer in the current Create artifact?
5. Is the answer in the linked Project?
6. Did the user already answer it in this Blueprint?
7. Is confirmation materially necessary?

If the answer is already reliable, do not ask again.

## Business DNA application rules

Business DNA should influence:

- tone
- strategic fit
- values alignment
- customer experience
- decision criteria
- growth recommendations
- risk posture
- brand consistency

Business DNA must not:

- fabricate facts
- override explicit current instructions
- force all outputs into identical wording
- prevent appropriate context-specific variation

## Client avatar application rules

The selected avatar should influence:

- language
- examples
- objections
- benefits
- content structure
- offer framing
- communication channels
- accessibility
- calls to action

The avatar must not be treated as a stereotype or fixed truth.

## Output tagging

Every Blueprint output must be tagged with:

- business_id
- Blueprint ID
- Blueprint session ID
- avatar IDs
- offer IDs
- product or service IDs
- context version
- creation date
- source provenance
- local overrides

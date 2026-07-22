# 326 — Output Capability Manifest Schema & Registry

## Purpose

Define the authoritative metadata required for every creatable or preparatory output.

## Relationship to existing architecture

The Output Capability Manifest extends:

- Output Type Registry
- Blueprint Output Manifest
- Work Type Registry
- Capability Registry
- Create template registry
- certification modules

The manifest is not a second output registry.

## Required manifest fields

```yaml
output_id:
display_name:
description:
creation_level:
artifact_created:
artifact_type:
work_type_ids:
blueprint_ids:
accountable_capability:
contributing_capabilities:
required_context:
optional_context:
required_user_inputs:
required_verified_inputs:
canonical_objects_read:
canonical_objects_created:
canonical_objects_updated:
relationships_created:
create_template_id:
save_destination:
edit_supported:
resume_supported:
reuse_supported:
version_supported:
export_formats:
publish_supported:
submit_supported:
external_completion_type:
integration_dependencies:
authorization_required:
professional_review:
validation_rules:
safety_boundaries:
known_limits:
promise_language:
limitation_language:
unavailable_fallback:
implementation_status:
certification_status:
last_verified_at:
```

## Creation-level enum

Use exactly:

- `fully_creatable`
- `creatable_with_user_information`
- `preparatory_creation`
- `external_completion_required`

## Implementation status enum

Use:

- `documented`
- `planned`
- `in_development`
- `implemented`
- `implemented_with_limits`
- `blocked`
- `future`
- `deprecated`

## Promise eligibility

An output may be described as available only when:

- implementation status permits it
- required capability is available
- required context can be resolved
- save destination exists
- required validation exists
- required professional boundaries exist
- certification result permits release

## Manifest inheritance

Shared outputs should define a base manifest.

Blueprints may add:

- industry terminology
- required fields
- templates
- review rules
- external-completion details
- domain validation

They must not create a second incompatible output identity.

## Example — Listing Description Draft

```yaml
output_id: output.real_estate.listing_description
display_name: Listing Description Draft
creation_level: creatable_with_user_information
artifact_created: Editable property listing description
artifact_type: content_asset
required_user_inputs:
  - verified property facts
  - approved features
  - brokerage wording requirements
save_destination: create_artifact
edit_supported: true
resume_supported: true
reuse_supported: true
publish_supported: false
external_completion_type: MLS publication
promise_language: I can create and save the listing description using your verified property details.
limitation_language: You will still need to review it for accuracy and publish it through your approved MLS process.
```

## Example — CMA Preparation Brief

```yaml
output_id: output.real_estate.cma_preparation_brief
display_name: CMA Preparation Brief
creation_level: preparatory_creation
artifact_created: Structured pricing and comparable-analysis preparation brief
artifact_type: decision_brief
required_verified_inputs:
  - current MLS comparable data supplied by the user or approved source
professional_review: brokerage or licensed review as applicable
promise_language: I can create a CMA preparation brief and pricing-conversation framework.
limitation_language: This is not an official CMA or appraisal and must use verified market data and your brokerage process.
```

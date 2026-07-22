# 329 — Output Creation Runtime Validation & Failure Behavior

## Purpose

Ensure creation promises remain accurate at runtime.

## Pre-promise validation

Before Shari offers to create an output, verify:

- output manifest exists
- implementation status
- capability available
- required context available
- required user inputs known or requestable
- save destination available
- permissions
- integration state
- professional-review rules
- certification status

## Pre-generation validation

Before generating:

- resolve active business
- resolve selected context
- verify source facts
- distinguish user facts from assumptions
- verify required template
- verify canonical destination
- establish provenance
- create or resolve Work identity

## Post-generation validation

Confirm:

- artifact exists
- content is complete enough for the stated level
- required sections exist
- labels match the creation level
- artifact saved successfully
- edit path works
- resume point exists
- related objects linked
- limitations displayed
- Project handoff offered only when appropriate

## Failure behavior

### Missing information

Say what is missing and ask only for the smallest necessary information.

### Capability unavailable

Offer the next-highest supported creation level.

Example:

> “Publishing is not connected right now, but I can create and organize the complete campaign content for you.”

### Save failure

Do not imply the artifact is safely stored.

Preserve the generated content and offer retry or export.

### Integration failure

Do not say the action succeeded.

Report:

- what was prepared
- what failed
- what remains
- whether retry is safe

### Professional-review requirement

Label the artifact clearly.

Do not present preparation as final approval.

### Unsupported promise

If the manifest is missing or uncertified:

- do not improvise a false capability
- offer a draft or preparation artifact if supported
- log the missing manifest
- create a remediation issue

## Audit trail

Record:

- promise language used
- creation level
- output manifest version
- context version
- source facts
- assumptions
- artifact ID
- save result
- external completion needed
- certification state

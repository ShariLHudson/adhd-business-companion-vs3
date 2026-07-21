# 100 — Blueprint Intelligence Contracts (Phase A)

Companion to `100_SPARK_BLUEPRINT_INTELLIGENCE_IMPLEMENTATION_REPORT.md`.

## Health rules

- Evaluate structure without mutation.
- Findings are advisory unless certification marks them blocking.
- Disposition: accept · dismiss · save for later.
- Dismissed findings reappear only when `evidenceFingerprint` changes.

## Versioning contract

- Published definition versions in the UWE registry are immutable records.
- Works pin `blueprintId` + `blueprintVersion` at creation.
- Evolution creates a new version; existing Works are not silently upgraded.

## Usage and impact contract

- Counts derive from `WorkBlueprintState` + `workRelationships` only.
- Impact copy must state that existing Works stay on their pinned version.
- Broken refs (empty target ids) surface in usage.

## Learning privacy contract (reserved)

- Learning disabled until Phase E.
- When enabled: minimum evidence threshold, explainable, clearable, no auto structure edits.

## Certification standard

| Status | Meaning |
|--------|---------|
| Ready to Publish | No blockers |
| Ready with Suggestions | Advisories only |
| Not Ready | Data-loss or broken-identity risk |

Optional advice never blocks publish alone.

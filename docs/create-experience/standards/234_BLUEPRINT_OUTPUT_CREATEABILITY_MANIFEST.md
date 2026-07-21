# 234 — Blueprint Output Createability Manifest

## Manifest purpose

Every Blueprint must include a completed Output Createability Manifest.

The manifest makes each promise explicit and testable.

## Required manifest fields

For every output, define:

| Field | Requirement |
|---|---|
| Output ID | Stable unique identifier |
| Output name | User-facing name |
| Output type | Registry-defined output type |
| Creation state | Direct, structured, composed, connected, draft-only, or future |
| Purpose | Why the output exists |
| User inputs | Information required from the user |
| Questions | Questions Spark Estate must ask |
| Capability owner | Accountable capability |
| Contributors | Supporting capabilities |
| Creation flow | Exact steps used to create it |
| Destination | Where it lives |
| Source of truth | Authoritative record |
| Editable | Whether the user can revise it |
| Resumable | Whether partial work resumes exactly |
| Reusable | Whether other Blueprints can use it |
| Project handoff | None, optional, recommended, or required |
| Export | Supported formats or none |
| Validation | Rules checked before completion |
| Status | Available, partial, blocked, or future |
| Tests | Required implementation tests |

## Required output types

At minimum, the registry should support:

- `document`
- `brief`
- `plan`
- `workflow`
- `procedure`
- `checklist`
- `template`
- `campaign`
- `calendar`
- `timeline`
- `dashboard`
- `scorecard`
- `calculation`
- `financial_model`
- `forecast`
- `decision_brief`
- `report`
- `data_structure`
- `visual_asset`
- `content_asset`
- `package`
- `project`
- `registry`
- `assessment`
- `map`
- `matrix`

## Example manifest

| Output | Type | Creation state | Destination | Editable | Project handoff |
|---|---|---|---|---|---|
| Product Opportunity Brief | brief | Direct | Create | Yes | Optional |
| Pricing Model | financial_model | Structured | Finance workspace | Yes | Optional |
| Inventory Plan | plan | Structured | Operations workspace | Yes | Recommended |
| Product Launch Package | package | Composed | Create | Yes | Recommended |
| Product Photography | visual_asset | Connected | Creative Studio | Yes | Optional |

## Manifest validation rules

The manifest fails when:

- an output has no ID
- creation state is undefined
- inputs are missing
- destination is missing
- save behavior is missing
- edit behavior is missing
- resume behavior is missing
- required capabilities do not exist
- Project handoff is claimed but unavailable
- export is claimed but unsupported
- output status is inaccurate

## Runtime use

The manifest should drive:

- Blueprint routing
- question generation
- progress tracking
- output creation
- save behavior
- resume behavior
- Chamber orchestration
- Project handoff
- testing
- certification
- future capability gating

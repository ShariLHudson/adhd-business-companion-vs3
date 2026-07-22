# Standard 072 — Workspace Persistence, Identity & Scrolling Repair

**Status:** Implemented (unit evidence) · **Browser certification:** NOT CERTIFIED  
**Protects:** Standard 066 Current Focus · Standard 071 Continuity registry

## Rules

1. Resume **reopens** the exact persisted workspace — never re-bootstraps a template.  
2. Workspace ID and Runtime Creation Record ID are immutable across resume.  
3. Exact `templateSections` persist on the Runtime Creation Record.  
4. Known facts use stable canonical IDs — no duplicate append on hydrate.  
5. Navigation acknowledgments speak only after hydrate + identity verification.  
6. Creation Destinations scroll via one shared scrollport.  
7. No dual-experience / side-panel / marketing non-sequitur on Create resume.

## Key modules

| Concern | Path |
|---|---|
| Exact hydrate | `lib/currentFocus/exactWorkspacePersist.ts` |
| Canonical facts | `lib/currentFocus/canonicalFacts.ts` |
| Runtime record + schema | `lib/currentFocus/creationRecord.ts` |
| Registry heal | `lib/activeWorkspaceRegistry/registry.ts` |
| Scroll CSS | `app/companion/companion.css` (072 scroll rules) |

## Founder Validation

See handoff checklist in Downloads `072_WORKSPACE_PERSISTENCE_IDENTITY_AND_SCROLLING_REPAIR.md`.  
Do not CERTIFY until authenticated browser proof passes.

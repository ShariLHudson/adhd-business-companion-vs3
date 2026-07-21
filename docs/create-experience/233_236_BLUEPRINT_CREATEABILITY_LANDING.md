# 233–236 Blueprint Createability — Landing

**Standards:** `docs/create-experience/standards/233_*` … `236_*`  
**Runtime:** `lib/universalWorkEngine/blueprints/createability/`  
**Generated masters (repo-derived):**

| Doc | Role |
|-----|------|
| [Master Output Registry](./233_236_MASTER_BLUEPRINT_OUTPUT_REGISTRY.md) | Every promised output across registered Blueprints |
| [Gap Register](./233_236_MASTER_CREATEABILITY_GAP_REGISTER.md) | Unverified / blocked creation paths |
| [Remediation Backlog](./233_236_BLUEPRINT_REMEDIATION_BACKLOG.md) | Priority fix list (235) |
| [Certification Dashboard](./233_236_BLUEPRINT_CERTIFICATION_DASHBOARD.md) | Createability cert results |

## Rule

A Blueprint is not createability-certified until every promised output has a real creation path (or an honest non-available status with the production promise removed).

Foundation / Work-Type certification remains necessary for structure and launch — **not sufficient** for “fully available” under Standard 233.

## Current state

All registered Blueprints seed **provisional blocked** manifests from `deliverables[]`. Hand-authored `createabilityManifest` on `BlueprintDefinition` is the remediation path.

Regenerate masters: `npx vitest run lib/universalWorkEngine/blueprints/createability/createability.test.ts`

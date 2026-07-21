# Permission Registry

**Standard:** 295 / 296 isolation
**Generated:** 2026-07-21

| Policy | Applies to | Rule |
|---|---|---|
| business_isolation | all shared objects | `business_id` required; no cross-business leak |
| client_confidentiality | client_account, communication | authorized viewers + privacy classification |
| create_project_link | create_artifact ↔ project | Project may not mutate Create content without permissioned sync |

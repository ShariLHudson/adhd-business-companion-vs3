# Master Relationship Registry

**Standard:** 295–300
**Generated:** 2026-07-21

| Relationship | Source | Target | Notes |
|---|---|---|---|
| `person_has_role_in_business` | person | business | Role Assignment — never duplicate Person |
| `avatar_belongs_to_business` | client_avatar | business |  |
| `offer_serves_avatar` | offer | client_avatar |  |
| `product_supports_offer` | product | offer |  |
| `service_supports_offer` | service | offer |  |
| `proposal_references_offer` | proposal | offer |  |
| `agreement_from_proposal` | agreement | proposal |  |
| `invoice_from_agreement_or_order` | invoice | agreement, order |  |
| `payment_for_invoice` | payment | invoice | completed_elsewhere — sync state required |
| `create_to_project` | create_artifact | project | Canonical Create→Project — Project must not copy content |
| `work_wraps_create` | universal_work | create_artifact |  |
| `task_on_project_or_work` | task | project, universal_work |  |
| `dashboard_uses_metric_definition` | dashboard | metric_definition |  |
| `client_account_links_person_or_org` | client_account | person, organization |  |

**Total relationships:** 14

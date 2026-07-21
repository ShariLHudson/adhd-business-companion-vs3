# Validation Registry

**Standard:** 295
**Generated:** 2026-07-21

| Object type | Rule |
|---|---|
| `business` | Required fields present: business_id, owner_user_id, name, active_status |
| `person` | Required fields present: person_id, name, status |
| `organization` | Required fields present: organization_id, name, status |
| `business_dna` | Required fields present: business_id, positioning |
| `client_avatar` | Required fields present: avatar_id, business_id, name, status |
| `relationship` | Required fields present: relationship_id, source_object_id, target_object_id, relationship_type, business_id |
| `client_account` | Required fields present: client_account_id, business_id |
| `vendor_account` | Required fields present: vendor_account_id, business_id |
| `partner_account` | Required fields present: partner_account_id, business_id |
| `role_assignment` | Required fields present: role_assignment_id, business_id, person_id, role |
| `offer` | Required fields present: offer_id, business_id, name, status |
| `product` | Required fields present: product_id, business_id, name, status |
| `service` | Required fields present: service_id, business_id, name, status |
| `package` | Required fields present: package_id, business_id, name |
| `pricing_model` | Required fields present: pricing_model_id, business_id, model_type |
| `opportunity` | Required fields present: opportunity_id, business_id |
| `proposal` | Required fields present: proposal_id, business_id, status |
| `agreement` | Required fields present: agreement_id, business_id, status |
| `order` | Required fields present: order_id, business_id, status |
| `invoice` | Required fields present: invoice_id, business_id, status |
| `payment` | Required fields present: payment_id, business_id, status |
| `payment` | Status must come from sync — never fabricate |
| `subscription` | Required fields present: subscription_id, business_id, status |
| `universal_work` | Required fields present: work_id, work_type, status |
| `create_artifact` | Required fields present: create_artifact_id, business_id, status |
| `project` | Required fields present: project_id, business_id, status |
| `milestone` | Required fields present: milestone_id, project_id, title |
| `task` | Required fields present: task_id, title, status |
| `checklist` | Required fields present: checklist_id, title |
| `appointment` | Required fields present: appointment_id, business_id, starts_at |
| `event` | Required fields present: event_id, business_id, title |
| `location` | Required fields present: location_id, name |
| `asset` | Required fields present: asset_id, business_id, name |
| `inventory_item` | Required fields present: inventory_item_id, business_id, name |
| `reservation` | Required fields present: reservation_id, business_id |
| `work_order` | Required fields present: work_order_id, business_id, status |
| `schedule` | Required fields present: schedule_id, business_id |
| `knowledge_item` | Required fields present: knowledge_item_id, business_id, title |
| `content_asset` | Required fields present: content_asset_id, business_id, title |
| `template` | Required fields present: template_id, title |
| `communication` | Required fields present: communication_id, business_id |
| `decision` | Required fields present: decision_id, business_id, title |
| `approval` | Required fields present: approval_id, business_id, status |
| `risk` | Required fields present: risk_id, business_id, title |
| `incident` | Required fields present: incident_id, business_id, title |
| `goal` | Required fields present: goal_id, business_id, title |
| `metric_definition` | Required fields present: metric_definition_id, business_id, name, formula |
| `metric_observation` | Required fields present: metric_observation_id, metric_definition_id, observed_at |
| `dashboard` | Required fields present: dashboard_id, business_id, metric_definition_ids |
| `dashboard` | Must reference metric_definition_ids — not display labels alone |

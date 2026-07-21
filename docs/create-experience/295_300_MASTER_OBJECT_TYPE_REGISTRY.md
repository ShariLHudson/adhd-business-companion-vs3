# Master Object Type Registry

**Standard:** 295–300 Master Shared Object Library
**Generated:** 2026-07-21

Spark must distinguish **fully create · prepare · user-provided · completed elsewhere** for every object dependency.

| Object type | Name | Family | Identity | Default authority | Required fields |
|---|---|---|---|---|---|
| `business` | Business | business_relationship | `business_id` | **user_provided** | business_id, owner_user_id, name, active_status |
| `person` | Person | business_relationship | `person_id` | **user_provided** | person_id, name, status |
| `organization` | Organization | business_relationship | `organization_id` | **user_provided** | organization_id, name, status |
| `business_dna` | Business DNA | business_relationship | `business_id` | **user_provided** | business_id, positioning |
| `client_avatar` | Client Avatar | business_relationship | `avatar_id` | **user_provided** | avatar_id, business_id, name, status |
| `relationship` | Relationship | business_relationship | `relationship_id` | **prepare** | relationship_id, source_object_id, target_object_id, relationship_type, business_id |
| `client_account` | Client Account | business_relationship | `client_account_id` | **user_provided** | client_account_id, business_id |
| `vendor_account` | Vendor Account | business_relationship | `vendor_account_id` | **user_provided** | vendor_account_id, business_id |
| `partner_account` | Partner Account | business_relationship | `partner_account_id` | **user_provided** | partner_account_id, business_id |
| `role_assignment` | Role Assignment | business_relationship | `role_assignment_id` | **prepare** | role_assignment_id, business_id, person_id, role |
| `offer` | Offer | offer_commerce_financial | `offer_id` | **prepare** | offer_id, business_id, name, status |
| `product` | Product | offer_commerce_financial | `product_id` | **prepare** | product_id, business_id, name, status |
| `service` | Service | offer_commerce_financial | `service_id` | **prepare** | service_id, business_id, name, status |
| `package` | Package | offer_commerce_financial | `package_id` | **prepare** | package_id, business_id, name |
| `pricing_model` | Pricing Model | offer_commerce_financial | `pricing_model_id` | **prepare** | pricing_model_id, business_id, model_type |
| `opportunity` | Opportunity | offer_commerce_financial | `opportunity_id` | **prepare** | opportunity_id, business_id |
| `proposal` | Proposal | offer_commerce_financial | `proposal_id` | **fully_create** | proposal_id, business_id, status |
| `agreement` | Agreement | offer_commerce_financial | `agreement_id` | **completed_elsewhere** | agreement_id, business_id, status |
| `order` | Order / Booking | offer_commerce_financial | `order_id` | **completed_elsewhere** | order_id, business_id, status |
| `invoice` | Invoice | offer_commerce_financial | `invoice_id` | **prepare** | invoice_id, business_id, status |
| `payment` | Payment | offer_commerce_financial | `payment_id` | **completed_elsewhere** | payment_id, business_id, status |
| `subscription` | Subscription | offer_commerce_financial | `subscription_id` | **prepare** | subscription_id, business_id, status |
| `universal_work` | Universal Work | work_project_operations | `work_id` | **fully_create** | work_id, work_type, status |
| `create_artifact` | Create Artifact | work_project_operations | `create_artifact_id` | **fully_create** | create_artifact_id, business_id, status |
| `project` | Project | work_project_operations | `project_id` | **completed_elsewhere** | project_id, business_id, status |
| `milestone` | Milestone | work_project_operations | `milestone_id` | **prepare** | milestone_id, project_id, title |
| `task` | Task | work_project_operations | `task_id` | **prepare** | task_id, title, status |
| `checklist` | Checklist | work_project_operations | `checklist_id` | **fully_create** | checklist_id, title |
| `appointment` | Appointment | work_project_operations | `appointment_id` | **prepare** | appointment_id, business_id, starts_at |
| `event` | Event | work_project_operations | `event_id` | **prepare** | event_id, business_id, title |
| `location` | Location | work_project_operations | `location_id` | **user_provided** | location_id, name |
| `asset` | Asset | work_project_operations | `asset_id` | **user_provided** | asset_id, business_id, name |
| `inventory_item` | Inventory Item | work_project_operations | `inventory_item_id` | **user_provided** | inventory_item_id, business_id, name |
| `reservation` | Reservation | work_project_operations | `reservation_id` | **prepare** | reservation_id, business_id |
| `work_order` | Work Order | work_project_operations | `work_order_id` | **prepare** | work_order_id, business_id, status |
| `schedule` | Schedule | work_project_operations | `schedule_id` | **prepare** | schedule_id, business_id |
| `knowledge_item` | Knowledge Item | knowledge_content_decision_measurement | `knowledge_item_id` | **prepare** | knowledge_item_id, business_id, title |
| `content_asset` | Content Asset | knowledge_content_decision_measurement | `content_asset_id` | **prepare** | content_asset_id, business_id, title |
| `template` | Template | knowledge_content_decision_measurement | `template_id` | **fully_create** | template_id, title |
| `communication` | Communication | knowledge_content_decision_measurement | `communication_id` | **prepare** | communication_id, business_id |
| `decision` | Decision | knowledge_content_decision_measurement | `decision_id` | **prepare** | decision_id, business_id, title |
| `approval` | Approval | knowledge_content_decision_measurement | `approval_id` | **user_provided** | approval_id, business_id, status |
| `risk` | Risk | knowledge_content_decision_measurement | `risk_id` | **prepare** | risk_id, business_id, title |
| `incident` | Incident | knowledge_content_decision_measurement | `incident_id` | **user_provided** | incident_id, business_id, title |
| `goal` | Goal | knowledge_content_decision_measurement | `goal_id` | **user_provided** | goal_id, business_id, title |
| `metric_definition` | Metric Definition | knowledge_content_decision_measurement | `metric_definition_id` | **prepare** | metric_definition_id, business_id, name, formula |
| `metric_observation` | Metric Observation | knowledge_content_decision_measurement | `metric_observation_id` | **completed_elsewhere** | metric_observation_id, metric_definition_id, observed_at |
| `dashboard` | Dashboard | knowledge_content_decision_measurement | `dashboard_id` | **prepare** | dashboard_id, business_id, metric_definition_ids |

**Total object types:** 48

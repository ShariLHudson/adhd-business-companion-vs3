import type { SharedRelationshipTypeDef } from "./types";

/** Master Relationship Registry seed (295/296/298). */
export const MASTER_RELATIONSHIP_TYPES: readonly SharedRelationshipTypeDef[] = [
  {
    relationshipTypeId: "person_has_role_in_business",
    name: "Person has role in Business",
    sourceTypes: ["person"],
    targetTypes: ["business"],
    notes: "Role Assignment — never duplicate Person",
  },
  {
    relationshipTypeId: "avatar_belongs_to_business",
    name: "Client Avatar belongs to Business",
    sourceTypes: ["client_avatar"],
    targetTypes: ["business"],
  },
  {
    relationshipTypeId: "offer_serves_avatar",
    name: "Offer serves Client Avatar",
    sourceTypes: ["offer"],
    targetTypes: ["client_avatar"],
  },
  {
    relationshipTypeId: "product_supports_offer",
    name: "Product supports Offer",
    sourceTypes: ["product"],
    targetTypes: ["offer"],
  },
  {
    relationshipTypeId: "service_supports_offer",
    name: "Service supports Offer",
    sourceTypes: ["service"],
    targetTypes: ["offer"],
  },
  {
    relationshipTypeId: "proposal_references_offer",
    name: "Proposal references Offer",
    sourceTypes: ["proposal"],
    targetTypes: ["offer"],
  },
  {
    relationshipTypeId: "agreement_from_proposal",
    name: "Agreement from Proposal",
    sourceTypes: ["agreement"],
    targetTypes: ["proposal"],
  },
  {
    relationshipTypeId: "invoice_from_agreement_or_order",
    name: "Invoice from Agreement or Order",
    sourceTypes: ["invoice"],
    targetTypes: ["agreement", "order"],
  },
  {
    relationshipTypeId: "payment_for_invoice",
    name: "Payment for Invoice",
    sourceTypes: ["payment"],
    targetTypes: ["invoice"],
    notes: "completed_elsewhere — sync state required",
  },
  {
    relationshipTypeId: "create_to_project",
    name: "Create Artifact to Project",
    sourceTypes: ["create_artifact"],
    targetTypes: ["project"],
    notes: "Canonical Create→Project — Project must not copy content",
  },
  {
    relationshipTypeId: "work_wraps_create",
    name: "Universal Work wraps Create Artifact",
    sourceTypes: ["universal_work"],
    targetTypes: ["create_artifact"],
  },
  {
    relationshipTypeId: "task_on_project_or_work",
    name: "Task on Project or Work",
    sourceTypes: ["task"],
    targetTypes: ["project", "universal_work"],
  },
  {
    relationshipTypeId: "dashboard_uses_metric_definition",
    name: "Dashboard uses Metric Definition",
    sourceTypes: ["dashboard"],
    targetTypes: ["metric_definition"],
  },
  {
    relationshipTypeId: "client_account_links_person_or_org",
    name: "Client Account links Person or Organization",
    sourceTypes: ["client_account"],
    targetTypes: ["person", "organization"],
  },
];

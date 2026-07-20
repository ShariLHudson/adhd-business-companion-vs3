/**
 * 049 — Creation Ecosystem Connection types
 * One Creation → One Record → Many connected assets / conversations / experts
 */

export type CreationRelationKind =
  | "parent"
  | "child"
  | "supports"
  | "feeds"
  | "depends_on"
  | "referenced_by"
  | "created_by"
  | "contributor"
  | "same_as";

export type RelationshipEntityKind =
  | "creation"
  | "asset"
  | "section"
  | "conversation"
  | "project"
  | "task"
  | "decision"
  | "blueprint"
  | "chamber"
  | "board"
  | "cartography_node"
  | "document";

export type AssetLifecycleStatus =
  | "suggested"
  | "draft"
  | "in_review"
  | "approved"
  | "archived";

export type RelationshipEdge = {
  id: string;
  creationId: string;
  fromKind: RelationshipEntityKind;
  fromId: string;
  relation: CreationRelationKind;
  toKind: RelationshipEntityKind;
  toId: string;
  /** Human label for debugging / Cartography */
  label?: string;
  createdAt: string;
  updatedAt: string;
};

/** Per-asset relationship card in the Relationship Registry */
export type AssetRelationshipCard = {
  assetInstanceKey: string;
  assetDefId: string;
  label: string;
  creationId: string;
  blueprintId: string | null;
  projectHomeId: string | null;
  eventRecordId: string | null;
  canonicalWorkId: string | null;
  createdBy: string;
  contributorIds: string[];
  status: AssetLifecycleStatus;
  supportsSectionIds: string[];
  dependsOnAssetIds: string[];
  feedsAssetIds: string[];
  conversationIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type CreationReadinessSnapshot = {
  creationId: string;
  overallPercent: number;
  byArea: Record<string, number>;
  updatedAt: string;
};

/** Context injected into conversations inside a Creation Workspace */
export type CreationConversationContext = {
  creationId: string;
  creationName: string;
  creationType: string;
  purpose: string;
  audience: string;
  outcomes: string;
  knownDecisions: string[];
  completedPhases: string[];
  existingAssetLabels: string[];
  /** Never re-ask these — already established */
  doNotReask: string[];
};

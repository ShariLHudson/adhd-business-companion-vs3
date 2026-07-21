/**
 * 054 — Connected Asset Editor Framework types.
 * One pattern for Agenda, budgets, workbooks, surveys, run-of-show, etc.
 */

import type { EventAssetRecommendation } from "@/lib/eventsIntelligence/eventAssetRegistry/types";
import type { EventSectionId } from "@/lib/eventsIntelligence/types";

/** Inherited capabilities every Connected Asset Editor must provide */
export const CONNECTED_ASSET_EDITOR_CAPABILITIES = [
  "connected_to_creation_record",
  "versioned",
  "relationship_aware",
  "project_aware",
  "conversation_aware",
  "editable",
  "resumable",
  "recommendation_enabled",
] as const;

export type ConnectedAssetEditorCapability =
  (typeof CONNECTED_ASSET_EDITOR_CAPABILITIES)[number];

export type ConnectedAssetBlock = {
  id: string;
  title: string;
  body: string;
  order: number;
};

export type ConnectedAssetDocumentStatus =
  | "drafting"
  | "in_review"
  | "approved"
  | "archived";

/**
 * Canonical editable document for one asset instance.
 * Asset-type-specific shape lives in blocks + plainText + meta.
 */
export type ConnectedAssetDocument = {
  documentId: string;
  instanceId: string;
  assetTypeId: string;
  creationRecordId: string;
  eventRecordId: string | null;
  workspaceId: string;
  projectHomeId: string | null;
  title: string;
  blocks: ConnectedAssetBlock[];
  plainText: string;
  templateId: string | null;
  version: number;
  status: ConnectedAssetDocumentStatus;
  /** Opaque per-type extras (agenda duration, budget currency, etc.) */
  meta: Record<string, string | number | boolean | null>;
  createdAt: string;
  updatedAt: string;
};

export type ConnectedAssetVersion = {
  versionId: string;
  documentId: string;
  version: number;
  title: string;
  blocks: ConnectedAssetBlock[];
  plainText: string;
  savedAt: string;
  note?: string;
};

export type ConnectedAssetConnectionBundle = {
  creationRecordId: string;
  eventRecordId: string | null;
  workspaceId: string;
  projectHomeId: string | null;
  relationshipRegistryKey: string | null;
  primaryOwner: string;
  supportingContributorIds: string[];
  knownFacts: string[];
  doNotReask: string[];
  currentPhase: string | null;
  sectionId: EventSectionId | null;
  conversationGoal: string | null;
};

export type ConnectedAssetReturnState = {
  documentId: string;
  instanceId: string;
  assetTypeId: string;
  sectionId: EventSectionId | null;
  version: number;
  lastOpenedAt: string;
};

export type ConnectedAssetEditorSession = {
  sessionId: string;
  document: ConnectedAssetDocument;
  versions: ConnectedAssetVersion[];
  connections: ConnectedAssetConnectionBundle;
  recommendations: EventAssetRecommendation[];
  returnState: ConnectedAssetReturnState;
  capabilities: readonly ConnectedAssetEditorCapability[];
  /** Member-safe status line — never architecture jargon */
  orientation: string;
};

export type OpenConnectedAssetEditorInput = {
  assetTypeId: string;
  eventRecordId?: string | null;
  instanceId?: string | null;
  sectionId?: EventSectionId | null;
  templateId?: string | null;
  title?: string | null;
  conversationGoal?: string | null;
  /** Force create when allowVariant */
  allowVariant?: boolean;
};

export type SaveConnectedAssetInput = {
  documentId: string;
  title?: string;
  blocks?: ConnectedAssetBlock[];
  plainText?: string;
  status?: ConnectedAssetDocumentStatus;
  meta?: ConnectedAssetDocument["meta"];
  versionNote?: string;
};

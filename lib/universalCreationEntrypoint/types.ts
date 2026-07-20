/**
 * 055 — Universal Creation Entrypoint types.
 * Many entry points → one Creation Record → one Workspace.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { UniversalCreationEngineResult } from "@/lib/universalCreationEngine/types";
import type { ConnectedAssetEditorSession } from "@/lib/connectedAssetEditor/types";
import type { EventSectionId } from "@/lib/eventsIntelligence/types";
import type { CreateBlueprint } from "@/lib/platformIntent/types";

export type CreationEntrySource =
  | "shari"
  | "create"
  | "projects"
  | "chamber"
  | "board"
  | "cartography"
  | "dashboard"
  | "home"
  | "search"
  | "conversation"
  | "asset"
  | "notification"
  | "recommendation"
  | "related_work";

export type EntrypointConfidence = "high" | "medium" | "low";

export type EntrypointAction =
  | "stay_conversation"
  | "clarify"
  | "open_workspace"
  | "resume_workspace"
  | "open_section"
  | "open_asset";

export type ExistingWorkMatch = {
  creationRecordId: string;
  workspaceId: string | null;
  eventRecordId: string | null;
  projectHomeId: string | null;
  title: string;
  matchKind:
    | "active_event"
    | "creation_ecosystem"
    | "canonical_work"
    | "asset_instance"
    | "alias";
};

export type UniversalCreationEntrypointResult = {
  entrySource: CreationEntrySource;
  confidence: EntrypointConfidence;
  action: EntrypointAction;
  /** Same id regardless of entry source */
  creationRecordId: string | null;
  workspaceId: string | null;
  eventRecordId: string | null;
  projectHomeId: string | null;
  blueprint: CreateBlueprint | null;
  sectionId: EventSectionId | null;
  assetTypeId: string | null;
  existingWork: ExistingWorkMatch | null;
  /** True when entry would have duplicated — we resumed instead */
  preventedDuplicate: boolean;
  clarifyingQuestion: string | null;
  contextPreserved: boolean;
  doNotReask: string[];
  /** Engine turn when workspace open/resume ran */
  engineResult: UniversalCreationEngineResult | null;
  /** 054 session when asset entry opened an editor */
  editorSession: ConnectedAssetEditorSession | null;
  /** Internal routing note — never show to member */
  routingNote: string;
  /** Member-facing reply when available */
  reply: string;
};

export type ResolveEntrypointInput = {
  userText: string;
  entrySource: CreationEntrySource;
  activeChamberMemberId?: ChamberMemberId | string | null;
  /** Hints from UI (search hit, cartography node, notification) */
  hintedCreationId?: string | null;
  hintedEventRecordId?: string | null;
  hintedAssetTypeId?: string | null;
  hintedSectionId?: EventSectionId | null;
  conversationId?: string | null;
  /** Only when user explicitly asks for a brand-new separate creation */
  forceNew?: boolean;
};

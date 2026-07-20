/**
 * 050 — Creation Ownership and Collaboration types.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";
import type { BoardDirectorId } from "@/lib/board/types";

/** Platform capability when ownership is not a Chamber seat (e.g. Shari orchestration). */
export type PlatformCapabilityId = "shari" | "shared_certification_pipeline";

export type OwnershipObjectType =
  | "blueprint"
  | "asset_type"
  | "workspace_type"
  | "workflow";

export type CreationContributorDefinition = {
  chamberMemberId: ChamberMemberId;
  role: "supporting";
  /** When this contributor is typically engaged */
  when?: string;
};

export type BoardAdvisorDefinition = {
  advisorId: BoardDirectorId | string;
  role: "advisor";
};

export type CollaborationRule = {
  id: string;
  description: string;
  required: boolean;
  trigger:
    | "blueprint_requires"
    | "specialist_review"
    | "dependency_blocked"
    | "cross_domain_asset"
    | "user_requests_perspective"
    | "certification"
    | "material_improvement"
    | "spans_domains"
    | "user_asks_team";
  contributorIds?: ChamberMemberId[];
};

export type CollaborationEscalationRule = {
  id: string;
  description: string;
  escalateTo: ChamberMemberId | PlatformCapabilityId | "board";
};

export type OwnershipConflictResolutionPolicy =
  | "defer_to_primary_owner"
  | "owner_synthesizes_then_ask_user"
  | "evidence_and_user_context";

export type CollaborationMode =
  | "silent_contribution"
  | "visible_contribution"
  | "advisory_round"
  | "board_consultation";

export type CreationOwnershipDefinition = {
  ownershipId: string;
  objectType: OwnershipObjectType;
  objectId: string;
  canonicalName: string;
  primaryOwner: ChamberMemberId | PlatformCapabilityId;
  supportingContributors: CreationContributorDefinition[];
  boardAdvisors: BoardAdvisorDefinition[];
  requiredCollaborationRules: CollaborationRule[];
  optionalCollaborationRules: CollaborationRule[];
  escalationRules: CollaborationEscalationRule[];
  completionAuthority: ChamberMemberId | PlatformCapabilityId;
  qualityCertificationAuthority:
    | ChamberMemberId
    | PlatformCapabilityId
    | "shared_certification_pipeline";
  conflictResolutionPolicy: OwnershipConflictResolutionPolicy;
  aliases: string[];
  version: string;
  status: "active" | "experimental" | "deprecated";
  /** Workspace coordinator when this is an asset inside a larger workspace */
  workspaceCoordinator?: ChamberMemberId | null;
};

export type OwnershipResolutionResult = {
  definition: CreationOwnershipDefinition | null;
  primaryOwner: ChamberMemberId | PlatformCapabilityId;
  supportingContributorIds: ChamberMemberId[];
  boardAdvisorIds: string[];
  completionAuthority: ChamberMemberId | PlatformCapabilityId;
  conflictPolicy: OwnershipConflictResolutionPolicy;
  source: "registry" | "blueprint" | "asset" | "default";
  /** True when exactly one primary owner is registered */
  singleOwner: boolean;
};

export type CollaborationDecision = {
  engage: boolean;
  mode: CollaborationMode;
  contributorIds: ChamberMemberId[];
  boardAdvisorIds: string[];
  reason: string;
  /** Board never becomes production owner */
  boardMayOwn: false;
  /** Contributors may not spawn a second Creation Record */
  allowSeparateCreationRecord: false;
};

export type ContributorContextPacket = {
  creationId: string;
  creationName: string;
  creationType: string;
  purpose: string;
  audience: string;
  outcomes: string;
  currentPhase: string;
  currentAssetId: string | null;
  knownFacts: string[];
  priorDecisions: string[];
  completedSections: string[];
  existingAssets: string[];
  doNotReask: string[];
  latestUserGoal: string;
  requestedContributionScope: string;
  primaryOwner: string;
  workspaceCoordinator: string | null;
};

export type ConflictSynthesisResult = {
  synthesizedGuidance: string;
  deferredToOwner: string;
  userDecisionNeeded: boolean;
  recordedRationale: string;
  considerations: string[];
};

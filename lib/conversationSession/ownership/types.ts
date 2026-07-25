/**
 * Phase 3 — Authoritative conversation ownership contract.
 * Stored on ConversationSession.ownership. Legacy stores adapt into this.
 */

export type ConversationExperienceOwner =
  | "companion"
  | "create"
  | "talk_it_out"
  | "collection_offer"
  | "confirmation"
  | "help_thread"
  | "intent_workflow"
  | "active_topic"
  | "reminder_management"
  | "rhythm_management"
  | "onboarding"
  | "discovery"
  | "destination_experience"
  | "chamber"
  | "board"
  | "continuity_workflow"
  | "none";

export type OwnershipStatus =
  | "active"
  | "awaiting_user"
  | "paused"
  | "releasing"
  | "completed";

export type ExpectedReplyKind =
  | "confirmation"
  | "choice"
  | "free_text"
  | "correction"
  | "continuation";

export type OwnershipExpectedReply = {
  kind: ExpectedReplyKind;
  allowedValues?: string[];
};

/** Typed continuation payloads — avoid loose bags where practical. */
export type OwnershipContinuation =
  | {
      kind: "collection_offer";
      roomId?: string;
      offerLine?: string;
      sourceTurn?: number;
    }
  | {
      kind: "win_save";
      offeredAtTurn?: number;
    }
  | {
      kind: "confirmation";
      confirmationKind?: string;
      offeredAtTurn?: number;
    }
  | {
      kind: "create";
      documentType?: string;
      phase?: string;
    }
  | {
      kind: "continuity";
      ownerKind?: string;
      workflowId?: string;
    }
  | {
      kind: "generic";
      label?: string;
    };

export type ConversationOwnership = {
  owner: ConversationExperienceOwner;
  reason: string;
  status: OwnershipStatus;
  startedAt: string;
  updatedAt: string;
  sourceTurnId?: string;
  workflowId?: string;
  destinationId?: string;
  expectedReply?: OwnershipExpectedReply;
  continuation?: OwnershipContinuation;
  /** Legacy claim sources that contributed to this record (diagnostics). */
  claimSources?: string[];
};

export type OwnershipClaimSource =
  | "spine"
  | "awaiting_confirmation"
  | "collection_pending"
  | "win_save_pending"
  | "universal_creation"
  | "continuity_owner"
  | "help_thread"
  | "intent_workflow"
  | "active_topic"
  | "frictionless_pending"
  | "talk_it_out";

export type OwnershipClaim = {
  owner: ConversationExperienceOwner;
  source: OwnershipClaimSource;
  reason: string;
  status: OwnershipStatus;
  priority: number;
  workflowId?: string;
  destinationId?: string;
  expectedReply?: OwnershipExpectedReply;
  continuation?: OwnershipContinuation;
};

export type OwnershipAction =
  | "continue_owner"
  | "release_owner"
  | "transfer_owner"
  | "handle_by_companion"
  | "repair_owner"
  | "reject_stale_owner";

export type OwnershipCleanupTarget =
  | "confirmation"
  | "collection"
  | "win_save"
  | "create"
  | "intent_workflow"
  | "help_thread"
  | "continuation"
  | "seed"
  | "frictionless"
  | "spine_ownership";

export type OwnershipResolution = {
  currentOwner: ConversationExperienceOwner;
  action: OwnershipAction;
  nextOwner?: ConversationExperienceOwner;
  reason: string;
  cleanup: OwnershipCleanupTarget[];
  confidence: number;
  /** Deterministic selected claim (if any). */
  selectedClaim?: OwnershipClaim;
  rejectedClaims: OwnershipClaim[];
  /** Ownership record to write after applying cleanup (null = clear). */
  nextOwnership: ConversationOwnership | null;
};

export type OwnershipTraceEvent = {
  at: string;
  conversationId: string | null;
  ownerBefore: ConversationExperienceOwner;
  claims: Array<{ owner: ConversationExperienceOwner; source: string; priority: number }>;
  selectedOwner: ConversationExperienceOwner;
  rejectedOwners: ConversationExperienceOwner[];
  action: OwnershipAction;
  reason: string;
  cleanup: OwnershipCleanupTarget[];
  ownerAfter: ConversationExperienceOwner;
};

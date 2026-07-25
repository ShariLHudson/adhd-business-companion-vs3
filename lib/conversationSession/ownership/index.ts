/**
 * Phase 3 — Conversation ownership (public API).
 */

export type {
  ConversationExperienceOwner,
  ConversationOwnership,
  ExpectedReplyKind,
  OwnershipAction,
  OwnershipClaim,
  OwnershipClaimSource,
  OwnershipCleanupTarget,
  OwnershipContinuation,
  OwnershipExpectedReply,
  OwnershipResolution,
  OwnershipStatus,
  OwnershipTraceEvent,
} from "./types";

export {
  OWNERSHIP_PRIORITY,
  claimToOwnership,
  collectOwnershipClaims,
  selectAuthoritativeClaim,
  type LegacyOwnershipSnapshot,
} from "./adaptLegacyOwnership";

export {
  beginSpineOwnership,
  clearSpineOwnership,
  getSpineOwnerKind,
  getSpineOwnership,
  setSpineOwnership,
} from "./ownershipStore";

export {
  beginOwnershipTurnGate,
  claimTurnOwnership,
  getOwnershipTurnGateForTests,
  releaseTurnOwnership,
  resetOwnershipTurnGateForTests,
  type ClaimTurnOwnershipInput,
  type ClaimTurnOwnershipResult,
} from "./claimTurnOwnership";

export {
  resolveConversationOwnership,
  type ResolveOwnershipInput,
} from "./resolveOwnership";

export {
  applyOwnershipResolution,
  type ApplyOwnershipHooks,
} from "./applyOwnershipResolution";

export {
  clearOwnershipTraceForTests,
  getOwnershipTraceForTests,
  logOwnershipTrace,
} from "./ownershipTrace";

export {
  mayRecoverCollectionPendingFromAssistant,
  type CollectionRecoveryGuardInput,
  type CollectionRecoveryGuardResult,
} from "./recoveryGuard";

/**
 * Chamber Expert Activation — public exports (Phase A–D).
 *
 * Live in the companion chat runtime via `chamberExpertiseHintForChat`,
 * called from `app/companion/CompanionPageClient.tsx`'s existing
 * `intentHint` stack. See docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md,
 * docs/estate/CHAMBER_ACTIVATION_PHASE_C_PREFLIGHT_REVIEW.md,
 * docs/estate/CHAMBER_EXPERTISE_CONTRIBUTION_TESTS.md, and
 * docs/estate/CHAMBER_ACTIVATION_PHASE_D_COLLABORATION_LANGUAGE.md.
 */

export * from "./types";
export {
  CHAMBER_EXPERT_REGISTRY,
  chamberExpertById,
  chamberExpertName,
  assertChamberExpertRegistryIsWellFormed,
} from "./chamberExpertRegistry";
export type { ChamberExpertCategory, ChamberExpertRegistryEntryWithCategory } from "./chamberExpertRegistry";
export {
  PHASE_33_TO_CANONICAL,
  ESTATE_BRAIN_TO_CANONICAL,
  resolveLegacyExpertId,
  resolveLegacyExpertIds,
} from "./legacyExpertAliasMap";
export { resolveChamberExpertActivation } from "./resolveChamberExpertActivation";
export { chamberExpertiseHintForChat } from "./chamberExpertiseHintForChat";
export { chamberCollaborationBridgeLine } from "./chamberCollaborationLanguage";

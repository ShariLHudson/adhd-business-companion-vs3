/**
 * Chamber Expert Activation — Phase A/B public exports.
 *
 * Not wired into the chat runtime yet (Phase C). See
 * docs/estate/CHAMBER_EXPERT_ACTIVATION_ARCHITECTURE.md.
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

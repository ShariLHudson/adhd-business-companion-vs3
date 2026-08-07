/**
 * Chamber Intelligence — I-1/I-2 pilot public exports.
 *
 * Gated by isChamberIntelligencePilotEnabled() (lib/intelligence-layer/
 * featureFlags.ts), default OFF. When off, the chat runtime behaves
 * exactly as it did before this pilot. See
 * docs/estate/CHAMBER_INTELLIGENCE_SYSTEM_ARCHITECTURE.md.
 */

export * from "./types";
export {
  chamberIntelligenceForExpert,
  CHAMBER_INTELLIGENCE_PILOT_EXPERT_IDS,
} from "./intelligenceRegistry";
export {
  selectExpertContribution,
  CHAMBER_INTELLIGENCE_BUDGET_TOKENS,
  CHAMBER_INTELLIGENCE_TOTAL_BUDGET_TOKENS,
  type SelectExpertContributionInput,
} from "./selectExpertContribution";
export { renderSelectedContribution } from "./renderSelectedContribution";

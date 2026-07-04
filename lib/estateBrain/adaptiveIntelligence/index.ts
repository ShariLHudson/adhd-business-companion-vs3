export type {
  AdaptivePreferenceDomain,
  AdaptiveBehaviorImpact,
  AdaptivePreferenceId,
  AdaptivePreferenceDefinition,
  AdaptivePreferenceState,
  AdaptiveConfidenceTier,
  AdaptiveSignalKind,
  AdaptiveSignal,
  AnticipationEvent,
  AnticipationSuggestion,
  AdaptiveEstateStore,
} from "./types";

export {
  ADAPTIVE_PREFERENCE_REGISTRY,
  ANTICIPATION_CHAINS,
  preferenceDefinition,
  isWorthRemembering,
} from "./preferenceRegistry";

export {
  loadAdaptiveEstateStore,
  saveAdaptiveEstateStore,
  clearAdaptiveEstateStore,
} from "./store";

export {
  confidenceTier,
  getAdaptivePreference,
  getStrongPreferences,
  recordAdaptiveSignal,
  recordAdaptiveSignals,
  syncAdaptiveFromIntelligenceProfile,
  recordSignalsFromCoachingChoice,
  recordSignalsFromDiscoveryAnswer,
  recordSignalsFromCreateCompletion,
  recordSignalsFromResearchCompletion,
  prefillDiscoveryFromAdaptiveMemory,
  adaptivePreparationExtras,
  adaptiveCoachingOpener,
  anticipateNextStep,
  shouldOfferPreferenceCheck,
  markPreferenceCheckOffered,
  preferenceCheckLine,
  adaptiveEstateHintForChat,
  memberFacingPreferenceLine,
} from "./engine";

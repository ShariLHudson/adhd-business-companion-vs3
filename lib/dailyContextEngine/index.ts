/**
 * Daily Context Engine™ — Phase 3 public API
 * Context Awareness & Adaptive Intelligence Foundation
 */

export type {
  BuildDailyContextInput,
  CompanionAvailability,
  CompanionAwarenessAdvice,
  DailyContext,
  DailyContextLoads,
  DailyContextSourceSignal,
  DailyEnergyLevel,
  DailyFocusLevel,
  DiscoveryKeyAwarenessDecision,
  Interruptibility,
  MeetingLoad,
  OptionalPromptPressure,
  SignalProvenance,
} from "./types";

export { buildDailyContext, getDailyContext } from "./buildDailyContext";

export {
  buildCompanionAwarenessAdvice,
  collectCompanionAwarenessSignals,
  companionSuggestionFrequency,
  formatDailyContextCompanionBlock,
} from "./companionAwareness";

export {
  evaluateDiscoveryKeyAwareness,
  shouldSuppressDiscoveryKey,
} from "./discoveryKeyAwareness";

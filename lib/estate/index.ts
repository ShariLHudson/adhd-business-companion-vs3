/**
 * Estate™ — public API.
 *
 * **Authority (Phase B):** `canonicalEstateRegistry` is the single runtime source of truth
 * for place identity. Legacy exports remain for adapters until migration completes.
 *
 * @see docs/estate/SPARK_ESTATE_CANONICAL_REGISTRY.md
 * @see docs/estate/PHASE_B_RUNTIME_REGISTRY_REPORT.md
 */

export * from "./canonicalEstateRegistry";
export * from "./placeIdAliases";
export * from "./estateMountRegistry";
export * from "./estateMemberNeedIndex";
export * from "./estateTurn";
export * from "./activeTaskLock";
export * from "./estateOrchestration";
export * from "./estateOrchestrationShadow";
export * from "./estateOrchestrationDev";
export * from "./estateTaskLockGate";
export * from "./directory";
export * from "./conversationDrivesNavigation";
export * from "./canonicalPlaceSuggestions";
export * from "./goToPlace";
export * from "./resolveEstatePlace";
export * from "./estateIntentBridge";
export * from "./estateExpansionEngine";
export * from "./canonicalPlaceSectionAdapter";
export * from "./estateChromePolicy";
export * from "./estatePlaceMedia";
export * from "./estateShellState";
export * from "./estateImageStandards";
export * from "./types";
export * from "./estateRoomRegistry";
export * from "./estateRoomRouting";
export * from "./estateArrivalExperience";
export * from "./estateArrivalSession";
export * from "./estateRoomAmbience";
export * from "./estatePlaceAmbientSound";
export * from "./estateAudioSettings";
export * from "./estateSoundscapeOverlay";
export * from "./estateRoomVisitMemory";
export * from "./estateDirectRoomResolve";
export * from "./estatePlaceNavigation";
export * from "./estateRuntimeState";
export * from "./resolveUserIntent";
export * from "./executeUserIntent";
export * from "./estatePresence";
export * from "./estateAmbienceVolume";
export * from "./estateAmbiencePreference";
export * from "./estateChatNavigation";
export * from "./estateRoomInvitation";
export * from "./estateRoomBackground";
export * from "@/lib/estateJourneyEngine";

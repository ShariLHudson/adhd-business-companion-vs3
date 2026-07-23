export type {
  ApplyEntitlementResult,
  FastPayWebhookEventType,
  NormalizedFastPayEvent,
  VoiceEntitlementLifecycleStatus,
  VoiceEntitlementPublicView,
  VoicePaidPlan,
  VoicePlanEntitlementRecord,
} from "./types";

export {
  mapProductCandidateToVoicePlan,
  normalizeProductCandidate,
  voiceLiteProductIds,
  voiceProProductIds,
} from "./productMap";

export {
  computeFastPaySignature,
  getFastPayWebhookSecret,
  verifyFastPaySignature,
} from "./verifySignature";

export { parseFastPayWebhookEvent } from "./parseWebhookEvent";
export { processFastPayWebhook } from "./processWebhook";
export { applyVerifiedVoiceEntitlementEvent } from "./applyVoiceEntitlement";
export { resolveBillingUser } from "./resolveUser";
export {
  createMemoryVoiceEntitlementStore,
  getVoiceEntitlementStore,
  publicViewSafe,
  resetMemoryVoiceEntitlementStoreForTests,
  setVoiceEntitlementStoreForTests,
} from "./storeApi";
export {
  essentialFallbackRecord,
  nextEntitlementFromVerifiedEvent,
  publicViewFromRecord,
} from "./syncRules";

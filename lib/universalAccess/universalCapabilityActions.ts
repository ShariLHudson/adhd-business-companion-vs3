/**
 * Universal capability action ids (#183 Implementation Notes).
 * CompanionPageClient fulfills these; rooms never own exclusive access.
 */

export const UNIVERSAL_CAPABILITY_ACTIONS = [
  "openMindMap",
  "openWorkflowMap",
  "startFocusTimer",
  "openProjects",
  "openDestinationGallery",
  "saveToGoogleDocs",
  "saveToGoogleDrive",
  "openJournal",
  "openClearMyMind",
  "openDecisionCompass",
  "openEvidenceVault",
  "openPeacefulPlaces",
  "openCreate",
  "openCalendar",
  "openBreathe",
] as const;

export type UniversalCapabilityActionId =
  (typeof UNIVERSAL_CAPABILITY_ACTIONS)[number];

/** Routing priority — intent always beats location (#183). */
export const UNIVERSAL_ACCESS_GLOBAL_ROUTING_RULE =
  "Intent-first: resolveExplicitCapabilityIntent before room locks, session locks, and recommendations." as const;

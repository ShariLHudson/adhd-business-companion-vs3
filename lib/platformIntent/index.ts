export type {
  PlatformIntentType,
  PlatformIntentClassification,
  PlatformIntentRoute,
  PlatformIntentRouteAction,
  CreateBlueprint,
  ProjectIntegrationLevel,
  VisibleThinkingLevel,
} from "./types";

export {
  classifyPlatformIntent,
  looksLikeKnowledgeQuestion,
  intentLaunchesCreate,
  intentStaysInConversation,
} from "./classifyPlatformIntent";

export {
  listCreateBlueprints,
  getCreateBlueprintById,
  getCreateBlueprintByCatalogType,
  resolveBlueprintFromText,
  blueprintsForChamberMember,
  shouldAutoProjectHome,
  shouldOfferVisibleThinking,
} from "./blueprintRegistry";

export { resolvePlatformIntentRoute } from "./resolvePlatformIntentRoute";

/** 103 — platformIntent CreateBlueprint aliases resolve through UWE Anywhere-Origin */
export { resolvePlatformIntentViaAnywhereOrigin } from "@/lib/universalWorkEngine/launch/bridgePlatformIntent";

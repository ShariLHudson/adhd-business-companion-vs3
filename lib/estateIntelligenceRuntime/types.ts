/**
 * Active Estate Intelligence runtime — query results used in member responses.
 */

import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";
import type { ImmediateCreateProjectOpenPayload } from "@/lib/createExperience/createExperienceRouting";
import type { ImmediateResearchOpenPayload } from "@/lib/estateBrain/routeEstateIntelligence";

export type EstateKnowledgeSource =
  | "estate-locations.json"
  | "estate-objects.json"
  | "estate-aliases.json"
  | "feature-how-to-guides"
  | "discovery-library.json"
  | "progressive-discovery.json"
  | "recommendation-signals"
  | "estate-brain"
  | "estate-guide"
  | "estate-knowledge-base";

export type EstateIntelligenceRuntimeResult = {
  capability: EstateCapability;
  knowledgeSource: EstateKnowledgeSource;
  localReply: string;
  responseHint: string;
  category: "estate_concierge" | "estate_guide" | "direct_action" | "universal_creation";
  suppressRelationship: boolean;
  suppressRecap: boolean;
  suppressReflectionFirst: boolean;
  immediateEstatePlaceNavigate?: {
    placeId: string;
    navigationLine: string;
    userText: string;
  };
  immediateResearchOpen?: ImmediateResearchOpenPayload;
  immediateCreateProjectOpen?: ImmediateCreateProjectOpenPayload;
  universalCreationCategory?: boolean;
};

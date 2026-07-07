/**
 * Estate Object Intelligence™ — shared types.
 */

import type { EstateKnowledgeStatus } from "@/lib/estateKnowledgeBase/types";

export type EstateObjectType =
  | "character"
  | "instrument"
  | "furniture"
  | "tool"
  | "collection"
  | "experience-anchor"
  | "navigational"
  | "decorative";

export type EstateObjectRecord = {
  objectId: string;
  officialName: string;
  assetReferences: string[];
  objectType: EstateObjectType;
  description: string;
  purpose: string;
  story: string;
  appearsInLocations: string[];
  aliases: string[];
  relatedFeatures: string[];
  relatedDiscoveries: string[];
  interactive: boolean;
  status: EstateKnowledgeStatus;
  lastUpdated?: string;
};

export type ObjectLocationPlacement = {
  locationId: string;
  objectId: string;
  placementLabel: string;
  surfaceType: string | null;
  prominence: "primary" | "secondary" | "background";
  status: EstateKnowledgeStatus;
  notes: string | null;
  lastUpdated?: string;
};

export type ObjectAliasMatchType =
  | "visual-reference"
  | "nickname"
  | "colloquial"
  | "question"
  | "approved";

export type ObjectAlias = {
  phrase: string;
  objectId: string;
  matchType: ObjectAliasMatchType;
  status: EstateKnowledgeStatus;
};

export type ObjectIntentKind =
  | "identify"
  | "use_request"
  | "story_request"
  | "unresolved";

export type ObjectIntentResolution = {
  kind: ObjectIntentKind;
  query: string;
  matchedPhrase?: string;
  object?: EstateObjectRecord;
  /** Primary placement when member is in a known location */
  placement?: ObjectLocationPlacement;
  /** Member-facing answer — Shari voice, from KB only */
  memberFacingAnswer?: string;
  /** When interactive and Live — suggested next step */
  suggestedAction?: string;
  reason?: string;
};

export type ObjectResolutionContext = {
  /** Current estate location — prefer objects placed here */
  currentLocationId?: string;
};

/**
 * Audio Experience Foundation™ — shared types.
 */

import type { EstateKnowledgeStatus } from "@/lib/estateKnowledgeBase/types";

export type AudioCategory = {
  categoryId: string;
  label: string;
  description: string;
  status: EstateKnowledgeStatus;
  experienceTags: string[];
  lastUpdated: string;
};

export type AudioExperience = {
  audioExperienceId: string;
  name: string;
  description: string;
  status: EstateKnowledgeStatus;
  categoryId: string;
  location: string;
  purpose: string[];
  experienceTags: string[];
  recommendedWhen: string[];
  relatedLocations: string[];
  relatedFeatures: string[];
  relatedDiscoveries: string[];
  accessRoute: string | null;
  lastUpdated: string;
};

export type AudioMappingSourceType =
  | "room"
  | "feature"
  | "tool"
  | "discovery"
  | "need-signal"
  | "experience-group";

export type AudioMapping = {
  id: string;
  sourceType: AudioMappingSourceType;
  sourceId: string;
  status: EstateKnowledgeStatus;
  audioExperienceIds: string[];
  presentationOrder: string[];
  lastUpdated: string;
};

export type AudioExperienceContext = {
  currentLocationId?: string;
  memberNeedSignalId?: string;
  maxResults?: number;
};

export type AudioExperienceDecision = {
  kind: "resolved" | "unresolved";
  query: string;
  route: "audio_experience" | "audio_location" | "audio_how_to";
  matchedPhrase?: string;
  experiences: AudioExperience[];
  memberFacingResponse?: string;
  offerNavigation?: boolean;
  navigationRoute?: string | null;
  reason?: string;
};

/** Relationship Intelligence — people matter, not another CRM. */

export type BusinessRelationshipType =
  | "lead"
  | "prospect"
  | "client"
  | "referral_partner"
  | "affiliate"
  | "collaborator"
  | "vendor";

export type PersonalRelationshipType =
  | "friend"
  | "family"
  | "mentor"
  | "coach"
  | "colleague";

export type RelationshipType =
  | BusinessRelationshipType
  | PersonalRelationshipType
  | "unknown";

export type RelationshipImportance = "low" | "medium" | "high";

export type TouchpointKind =
  | "follow_up"
  | "check_in"
  | "thank_you"
  | "share_update"
  | "celebrate_milestone";

export type TouchpointSuggestion = {
  kind: TouchpointKind;
  label: string;
  gentlePrompt: string;
};

export type Relationship = {
  id: string;
  name: string;
  relationshipType: RelationshipType;
  importance: RelationshipImportance;
  lastInteraction: string | null;
  nextSuggestedTouchpoint: TouchpointSuggestion | null;
  notes: string;
  tags: string[];
  /** Why they matter — last known context, not raw chat logs. */
  lastContext: string;
  createdAt: string;
  updatedAt: string;
};

export type RelationshipSignalKind =
  | "follow_up"
  | "should_call"
  | "should_email"
  | "promised"
  | "havent_talked"
  | "referral"
  | "reconnect";

export type RelationshipSignalHit = {
  kind: RelationshipSignalKind;
  label: string;
  extractedName: string | null;
  contextSnippet: string;
  inferredType: RelationshipType;
};

export type RelationshipOffer = {
  signal: RelationshipSignalHit;
  mentionCount: number;
  companionOffer: string;
  suggestedTouchpoints: TouchpointSuggestion[];
  createdAt: string;
};

export type RelationshipInput = {
  now?: Date;
  text?: string;
};

export type FounderRelationshipReport = {
  generatedAt: string;
  relationshipsAdded: number;
  sampleSize: number;
  followUpOpportunities: { name: string; suggestion: string }[];
  referralOpportunities: { name: string; type: string }[];
  partnershipOpportunities: { name: string; type: string }[];
  relationshipTrend: "rising" | "stable" | "easing";
  recommendedFounderAction: string;
  notes: string;
};

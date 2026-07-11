/**
 * Shari Knowledge & Intelligence Framework — unified knowledge types.
 * @see docs/estate/SHARI_KNOWLEDGE_INTELLIGENCE_FRAMEWORK.md
 */

export type SparkKnowledgeKind =
  | "experience"
  | "space"
  | "capability"
  | "framework"
  | "creation"
  | "expert"
  | "research";

/** What Shari can explain about any Estate knowledge object */
export type SparkKnowledgeExplainable = {
  what: string;
  why: string;
  when: string;
  who: string;
  how: string;
  related: readonly string[];
  nextSteps: readonly string[];
};

export type SparkKnowledgeEntry = {
  id: string;
  kind: SparkKnowledgeKind;
  name: string;
  purpose: string;
  description: string;
  triggers: readonly string[];
  aliases: readonly string[];
  explain: SparkKnowledgeExplainable;
  /** Source registry for sync — internal only */
  sourceRegistry: string;
};

export type SparkKnowledgeSearchMatch = {
  entry: SparkKnowledgeEntry;
  score: number;
  reasons: string[];
};

export type SparkKnowledgeSearchResult = {
  query: string;
  matches: SparkKnowledgeSearchMatch[];
  best: SparkKnowledgeSearchMatch | null;
};

export type EstateGuideTopic =
  | "capabilities"
  | "rooms"
  | "journals"
  | "visual_models"
  | "business_growth"
  | "adhd"
  | "features_missing"
  | "room_story"
  | "general";

export type EstateGuideTurnResult = {
  topic: EstateGuideTopic;
  intro: string;
  body: string;
  suggestions: readonly string[];
  matchedPlaceId?: string;
  responseHint: string;
};

export type ShariKnowledgeHintOptions = {
  userText?: string | null;
  matchedEntryId?: string | null;
  matchedKind?: SparkKnowledgeKind | null;
  includeRecommendations?: boolean;
};

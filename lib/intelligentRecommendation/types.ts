/**
 * 060 — Intelligent Recommendation Engine types.
 */

export type RecommendationCategory =
  | "continue_work"
  | "build_something"
  | "make_a_decision"
  | "review"
  | "complete"
  | "resolve_dependency"
  | "prepare"
  | "connect"
  | "improve"
  | "celebrate"
  | "learn"
  | "archive"
  | "reuse";

export type RecommendationConfidence =
  | "very_high"
  | "high"
  | "medium"
  | "low"
  | "very_low";

export type RecommendationSource =
  | "creation_engine"
  | "capability_registry"
  | "dependency_engine"
  | "readiness"
  | "conversation"
  | "lifecycle"
  | "chamber"
  | "board"
  | "projects";

export type IntelligentRecommendation = {
  id: string;
  title: string;
  category: RecommendationCategory;
  confidence: RecommendationConfidence;
  reason: string;
  estimatedEffort: string | null;
  impact: "high" | "medium" | "low";
  unlocks: string[];
  actionLabel: string;
  /** Natural conversation line — never checklist language */
  conversationLine: string;
  source: RecommendationSource;
  /** Internal ranking score (higher = better) */
  score: number;
  urgent?: boolean;
  assetTypeId?: string | null;
  sectionId?: string | null;
};

export type RecommendationPack = {
  primary: IntelligentRecommendation;
  secondary: IntelligentRecommendation[];
  /** Suppressed for ADHD limits / low confidence — never shown unless requested */
  suppressed: IntelligentRecommendation[];
  /** True when pack was built for a return session */
  returningSession: boolean;
};

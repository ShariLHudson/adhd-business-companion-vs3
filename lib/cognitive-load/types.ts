import type { EmotionalState } from "@/lib/companionEmotions";
import type { DayState, Project } from "@/lib/companionStore";
import type { UserSignalCount } from "@/lib/ecosystem/userIntelligenceEngine";

/** 0–100 score bands — transparent, never hidden. */
export type CognitiveLoadLevel = "light" | "moderate" | "heavy" | "overloaded";

export type LoadDomain =
  | "business"
  | "mental"
  | "emotional"
  | "companion"
  | "environmental";

/**
 * One explainable factor in the load score.
 * Every point is visible — no hidden weighting.
 */
export type LoadContributor = {
  id: string;
  domain: LoadDomain;
  label: string;
  /** Points added to the score (documented). */
  points: number;
  detail: string;
};

export type CognitiveLoadScore = {
  value: number;
  level: CognitiveLoadLevel;
  contributors: LoadContributor[];
  domainTotals: Record<LoadDomain, number>;
  computedAt: string;
};

export type LoadRecommendation = {
  id: string;
  text: string;
  domain: LoadDomain;
};

export type CognitiveLoadResult = {
  score: CognitiveLoadScore;
  summaries: string[];
  recommendations: LoadRecommendation[];
  /** Gentle optional companion line — never forced. */
  companionOffer: string | null;
};

/** Full persisted snapshot — explainable end-to-end. */
export type CognitiveLoadSnapshot = {
  score: number;
  level: CognitiveLoadLevel;
  contributors: LoadContributor[];
  summary: string;
  recommendations: string[];
  createdAt: string;
};

/** Signals available today — extend as new data sources ship. */
export type CognitiveLoadInput = {
  now?: Date;
  emotionalState?: EmotionalState;
  projects?: Project[];
  openBrainDumpCount?: number;
  projectsMissingNextAction?: number;
  stalledProjectCount?: number;
  overdueTaskCount?: number;
  dayState?: DayState | null;
  timeBlocksToday?: number;
  missedBlocksToday?: number;
  signalCounts?: UserSignalCount[];
  /** Latest user message — used for pattern detection only, not stored. */
  recentText?: string;
  priorScore?: number | null;
};

export type FounderCognitiveLoadReport = {
  generatedAt: string;
  averageLoad: number;
  overloadedUsers: number;
  sampleSize: number;
  loadTrend: "rising" | "stable" | "easing";
  commonContributors: { id: string; label: string; count: number }[];
  recommendedFounderAction: string;
  notes: string;
};

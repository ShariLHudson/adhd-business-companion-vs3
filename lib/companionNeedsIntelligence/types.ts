import type { EmotionalState, UserIntent } from "@/lib/companionEmotions";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { AppSection } from "@/lib/companionUi";
import type { SidebarToolId } from "@/lib/companionUi";

/** Primary need — what the ADHD entrepreneur needs right now. */
export type CompanionNeedId =
  | "relief"
  | "clarity"
  | "focus"
  | "creativity"
  | "strategy"
  | "reflection"
  | "learning"
  | "restoration";

/** What should be better when they leave a room. */
export type RestorationOutcome =
  | "less-overwhelmed"
  | "more-hopeful"
  | "clearer"
  | "more-focused"
  | "more-confident"
  | "more-organized"
  | "more-understood"
  | "smiling"
  | "lighter";

export type ExecutiveFunctionBand = "depleted" | "low" | "moderate" | "available";

export type EnergyBand = "depleted" | "low" | "steady" | "rising";

export type OverwhelmBand = "calm" | "building" | "high" | "flooded";

/** ADHD-first signals — executive function, not productivity metrics. */
export type ExecutiveFunctionAssessment = {
  availableExecutiveFunction: ExecutiveFunctionBand;
  overwhelm: OverwhelmBand;
  energy: EnergyBand;
  needsMomentum: boolean;
  needsPermission: boolean;
  needsEncouragement: boolean;
  needsFewerDecisions: boolean;
  needsBodyDoubling: boolean;
  needsBeauty: boolean;
};

export type AdhdDesignFilterId =
  | "reduces-cognitive-load"
  | "reduces-executive-demand"
  | "creates-calm"
  | "orients-user"
  | "reduces-shame"
  | "simplifies-choices"
  | "improves-state";

export type AdhdDesignFilterCheck = {
  id: AdhdDesignFilterId;
  question: string;
  passed: boolean;
  note?: string;
};

export type AdhdDesignFilterEvaluation = {
  checks: AdhdDesignFilterCheck[];
  passed: boolean;
  reconsider: boolean;
};

export type CompanionNeedsInput = {
  now?: Date;
  /** What they said — primary signal when present. */
  text?: string;
  emotionalState?: EmotionalState | null;
  userIntent?: UserIntent | null;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  lowEnergy?: boolean;
  recoveryGentle?: boolean;
  /** Navigation hint — lower weight than need signals. */
  section?: AppSection | null;
  toolId?: SidebarToolId | null;
  /** Force a need for testing or explicit user choice. */
  explicitNeed?: CompanionNeedId;
  /** When set, room selection defers to navigation. */
  lockedPlaceId?: CompanionPlaceId;
};

export type NeedScore = {
  needId: CompanionNeedId;
  score: number;
  reasons: string[];
};

export type CompanionNeedsIntelligence = {
  /** Highest-confidence primary need. */
  primaryNeed: CompanionNeedId;
  /** Runner-up when close — may inform hospitality, not room. */
  secondaryNeed: CompanionNeedId | null;
  confidence: "low" | "medium" | "high";
  scores: NeedScore[];
  executiveFunction: ExecutiveFunctionAssessment;
  /** Best room for this need — respects lockedPlaceId when set. */
  recommendedPlaceId: CompanionPlaceId;
  likelyPlaceIds: CompanionPlaceId[];
  restorationPromise: string;
  restorationOutcome: RestorationOutcome;
  /** Reward Principle™ — why arriving should feel like relief. */
  rewardFraming: string;
  /** How Shari would prepare before they arrive. */
  preparationGuidance: string[];
  adhdDesignFilter: AdhdDesignFilterEvaluation;
  /** Plain-language summary for orchestration debug / Director's Studio. */
  summary: string;
};

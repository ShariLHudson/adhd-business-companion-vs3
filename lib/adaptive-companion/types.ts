/** Adaptive Companion — meet the user where they are. */

import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { EmotionalState } from "@/lib/companionEmotions";
import type { LoopType } from "@/lib/loop-intelligence/types";

export type CompanionResponseMode =
  | "support"
  | "sorting"
  | "planning"
  | "activation"
  | "focus"
  | "celebration"
  | "reflection";

export type AdaptiveConfidence = "low" | "medium" | "high";

export type AdaptiveDecision = {
  mode: CompanionResponseMode;
  confidence: AdaptiveConfidence;
  reason: string;
  createdAt: string;
};

export type AdaptiveInput = {
  now?: Date;
  text?: string;
  emotionalState?: EmotionalState;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  loopType?: LoopType | null;
  /** Birthday, milestone, or active recognition moment. */
  celebrationActive?: boolean;
  /** User recently completed something. */
  winDetected?: boolean;
  /** Day designer flow or plan active. */
  planningContext?: boolean;
};

export type FounderAdaptiveReport = {
  generatedAt: string;
  sampleSize: number;
  commonModes: { mode: CompanionResponseMode; label: string; count: number }[];
  modeTrend: "rising" | "stable" | "easing";
  stateDistribution: {
    support: number;
    action: number;
    celebrate: number;
    reflect: number;
  };
  recommendedImprovement: string;
  notes: string;
};

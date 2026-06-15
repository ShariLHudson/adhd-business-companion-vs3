/** Environment Intelligence — the user is not the problem. */

import type { ActivationState } from "@/lib/activation/types";
import type { CompanionResponseMode } from "@/lib/adaptive-companion/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { DayEnvironment } from "@/lib/day-designer/types";
import type { RecoveryLevel } from "@/lib/recovery-intelligence/types";

export type EnvironmentType =
  | "home"
  | "office"
  | "coffee_shop"
  | "car"
  | "outdoors"
  | "shared_space"
  | "unknown";

export type SensoryLoad = "low" | "moderate" | "high" | "overwhelming";

export type InterruptionLevel =
  | "quiet"
  | "occasional"
  | "frequent"
  | "constant";

export type ClutterLevel =
  | "clear"
  | "manageable"
  | "distracting"
  | "overwhelming"
  | "unknown";

export type EnvironmentFit = "poor" | "okay" | "good" | "excellent";

export type EnvironmentConfidence = "low" | "medium" | "high";

export type EnvironmentAdjustment =
  | "close_extra_tabs"
  | "move_one_distraction"
  | "put_phone_away"
  | "use_headphones"
  | "lower_noise"
  | "change_location"
  | "clear_one_surface"
  | "focus_audio"
  | "sensory_break"
  | "better_fit_location";

export type EnvironmentSnapshot = {
  environmentType: EnvironmentType;
  sensoryLoad: SensoryLoad;
  interruptionLevel: InterruptionLevel;
  clutterLevel: ClutterLevel;
  focusFit: EnvironmentFit;
  recoveryFit: EnvironmentFit;
  recommendedAdjustment: EnvironmentAdjustment;
  confidence: EnvironmentConfidence;
  createdAt: string;
};

export type EnvironmentInput = {
  now?: Date;
  text?: string;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  recoveryLevel?: RecoveryLevel | null;
  adaptiveMode?: CompanionResponseMode | null;
  dayEnvironment?: DayEnvironment | null;
};

export type EnvironmentOffer = {
  snapshot: EnvironmentSnapshot;
  companionOffer: string;
  insight: string;
  createdAt: string;
};

export type FounderEnvironmentReport = {
  generatedAt: string;
  sampleSize: number;
  frictionPoints: { id: string; label: string; count: number }[];
  sensoryOverloadCount: number;
  focusFitTrend: "improving" | "stable" | "worsening";
  helpfulAdjustments: { adjustment: EnvironmentAdjustment; label: string; count: number }[];
  recommendedFounderAction: string;
  notes: string;
};

/** Adaptive Day Designer — optional structure, never forced. */

import type { EmotionalState } from "@/lib/companionEmotions";
import type { DayLevel } from "@/lib/companionStore";
import type { ActivationState } from "@/lib/activation/types";
import type { CognitiveLoadLevel } from "@/lib/cognitive-load/types";
import type { LoopType } from "@/lib/loop-intelligence/types";

export type DayBlockType =
  | "deep_work"
  | "creative_work"
  | "admin"
  | "communication"
  | "recovery"
  | "planning"
  | "learning"
  | "personal"
  | "flex";

export type DayEnvironment =
  | "home_quiet"
  | "home_noisy"
  | "office"
  | "coffee_shop"
  | "mobile"
  | "unknown";

export type DayPriority = {
  id: string;
  label: string;
  estimatedMinutes?: number;
  urgency?: "low" | "medium" | "high";
  energyNeeded?: "low" | "medium" | "high";
  importance?: "low" | "medium" | "high";
};

export type SuggestedDayBlock = {
  id: string;
  type: DayBlockType;
  title: string;
  durationMinutes: number;
  reason: string;
  priorityId?: string;
};

export type DayPlan = {
  id: string;
  date: string;
  userEnergy: DayLevel | "unknown";
  emotionalState: EmotionalState | "unknown";
  cognitiveLoadLevel: CognitiveLoadLevel | "unknown";
  activationState: ActivationState | "unknown";
  availableTimeBlocks: number;
  environment: DayEnvironment;
  priorities: DayPriority[];
  suggestedBlocks: SuggestedDayBlock[];
  reasoningSummary: string;
  adhdSupportTips: string[];
  createdAt: string;
};

export type SimpleDayPlanView = {
  todaysFocus: string;
  firstStep: string;
  canWait: string[];
  recoveryMargin: string;
  reasoningSummary: string;
  adhdSupportTips: string[];
};

export type DayDesignerStep =
  | "idle"
  | "time"
  | "energy"
  | "environment"
  | "priorities"
  | "complete";

export type DayDesignerAnswers = {
  availableMinutes?: number;
  energy?: DayLevel;
  environment?: DayEnvironment;
  mustDoToday?: string;
};

export type DayDesignerSession = {
  step: DayDesignerStep;
  answers: DayDesignerAnswers;
  startedAt: string;
};

export type DayDesignerContext = {
  now: Date;
  emotionalState: EmotionalState;
  cognitiveLoadLevel: CognitiveLoadLevel | null;
  activationState: ActivationState | null;
  primaryLoopType: LoopType | null;
  dayEnergy: DayLevel | null;
  dayOverwhelm: DayLevel | null;
  projectPriorities: DayPriority[];
  timeBankPriorities: DayPriority[];
  projectTaskPriorities: DayPriority[];
  timeOfDay: "morning" | "afternoon" | "evening";
  hour: number;
};

export type DayDesignerInput = {
  now?: Date;
  text?: string;
  emotionalState?: EmotionalState;
  cognitiveLoadLevel?: CognitiveLoadLevel | null;
  activationState?: ActivationState | null;
  primaryLoopType?: LoopType | null;
  answers?: DayDesignerAnswers;
};

export type FounderDayDesignerReport = {
  generatedAt: string;
  plansCreated: number;
  sampleSize: number;
  commonPlanningBlockers: { id: string; label: string; count: number }[];
  commonReducedLoadTips: { tip: string; count: number }[];
  commonEnergyStates: { energy: string; count: number }[];
  loadTrend: "rising" | "stable" | "easing";
  recommendedFounderAction: string;
  notes: string;
};

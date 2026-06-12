// Founder Ecosystem — Phase 19 Founder Experience Map types.
// Maps needs, emotions, and outcomes — the ecosystem as a companion journey.

import type { AppSection } from "@/lib/companionUi";
import type { WorkStyle } from "../companion/companionTypes";
import type { BusinessStage, FounderFocus } from "../journey/journeyTypes";
import type { ID, ISODateString } from "../models";

export type ExperiencePhase =
  | "first-day"
  | "first-week"
  | "first-month"
  | "ninety-day"
  | "established";

export type BusinessType =
  | "coaching"
  | "agency"
  | "saas"
  | "creator"
  | "consulting"
  | "ecommerce"
  | "other";

export type OnboardingCapture = {
  businessName?: string;
  businessStage: BusinessStage;
  businessType: BusinessType;
  currentGoals: string[];
  biggestChallenges: string[];
  currentProjects: string[];
  preferredWorkStyle: WorkStyle | "unknown";
  capturedAt?: ISODateString;
};

export type FounderEmotionalState =
  | "overwhelmed"
  | "stuck"
  | "motivated"
  | "distracted"
  | "excited"
  | "burned-out";

export type DelightKind = "wow" | "trust" | "relief" | "momentum" | "confidence";

export type FounderNeed =
  | "clarity"
  | "momentum"
  | "focus"
  | "relief"
  | "confidence"
  | "direction"
  | "memory"
  | "celebration"
  | "connection";

export type FounderOutcome =
  | "first-win"
  | "project-started"
  | "habit-formed"
  | "trust-built"
  | "decision-made"
  | "overwhelm-reduced"
  | "business-advanced";

export type ExperienceFeatureLink = {
  feature: string;
  need: FounderNeed;
  emotion: string;
  outcome: FounderOutcome;
};

export type FirstRunExperience = {
  phase: "first-day";
  see: string[];
  feel: string[];
  accomplish: string[];
  greeting: string;
  primaryWorkspace: AppSection;
  successTest: string;
};

export type OnboardingJourney = {
  capture: OnboardingCapture;
  complete: boolean;
  reflectionPrompts: string[];
  personalizedWelcome: string;
  successTest: string;
  passesSuccessTest: boolean;
};

export type FirstWeekMilestones = {
  firstProject: boolean;
  firstTimeBlock: boolean;
  firstFocusSession: boolean;
  firstDocument: boolean;
  firstWin: boolean;
  completedCount: number;
  successTest: string;
  passesSuccessTest: boolean;
};

export type FirstMonthSignals = {
  remembersContext: boolean;
  connectsProjects: boolean;
  makesRecommendations: boolean;
  tracksWins: boolean;
  successTest: string;
  passesSuccessTest: boolean;
};

export type NinetyDaySignals = {
  understandsProjects: boolean;
  understandsPatterns: boolean;
  understandsStrengths: boolean;
  understandsChallenges: boolean;
  understandsMomentum: boolean;
  understandsWorkStyle: boolean;
  successTest: string;
  passesSuccessTest: boolean;
};

export type DailyFlowStep = {
  label: string;
  content: string;
  workspace?: AppSection;
  actionHint?: string;
};

export type DailyExperience = {
  period: "morning" | "midday" | "afternoon" | "evening";
  steps: DailyFlowStep[];
};

export type WeeklyReview = {
  projectsAdvanced: string[];
  wins: string[];
  challenges: string[];
  patterns: string[];
  opportunities: string[];
  summary: string;
};

export type EmotionalGuidance = {
  state: FounderEmotionalState;
  shariShould: string[];
  shariShouldAvoid: string[];
  workspace: AppSection;
  recommendation: string;
  tone: "gentle" | "energizing" | "steady" | "celebratory";
};

export type DelightMoment = {
  id: ID;
  kind: DelightKind;
  trigger: string;
  message: string;
  ts?: ISODateString;
};

export type FounderExperienceMap = {
  founderId: ID;
  generatedAt: ISODateString;
  phase: ExperiencePhase;
  daysInEcosystem: number;
  firstRun: FirstRunExperience;
  onboarding: OnboardingJourney | null;
  firstWeek: FirstWeekMilestones;
  firstMonth: FirstMonthSignals;
  ninetyDay: NinetyDaySignals;
  daily: DailyExperience[];
  weekly: WeeklyReview | null;
  emotionalState: FounderEmotionalState;
  emotionalGuidance: EmotionalGuidance;
  delightMoments: DelightMoment[];
  featureLinks: ExperienceFeatureLink[];
  headline: string;
};

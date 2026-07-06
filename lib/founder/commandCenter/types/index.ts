/** Executive Command Center™ — calm center of the Executive Operating System. */

import type { MissionId } from "@/lib/founder/missions/types";

export type AttentionLevel = "now" | "next" | "watch" | "library";

export type IgnoreAction =
  | "ignore_today"
  | "ignore_this_week"
  | "archive"
  | "delegate"
  | "automate_later";

export type EnergyProfile =
  | "high_energy"
  | "low_energy"
  | "creative"
  | "strategic"
  | "administrative"
  | "recovery";

export type FrictionKind =
  | "searching"
  | "waiting"
  | "repeated_work"
  | "too_many_approvals"
  | "blocked_initiative"
  | "repeated_decision"
  | "manual_work"
  | "context_switching";

export type AttentionItem = {
  id: string;
  title: string;
  summary: string;
  level: AttentionLevel;
  source: string;
  missionId?: MissionId;
  estimatedMinutes?: number;
  ignoreAction?: IgnoreAction;
};

export type ExecutiveFocusScore = {
  score: number;
  label: "calm" | "focused" | "busy" | "overloaded";
  openMissions: number;
  openDecisions: number;
  nowCount: number;
  nextCount: number;
  contextSwitchRisk: number;
  simplification: string[];
};

export type EnergyAwareness = {
  suggestedProfile: EnergyProfile;
  rationale: string;
  workTypes: { profile: EnergyProfile; suggestions: string[] }[];
};

export type ExecutiveFriction = {
  id: string;
  kind: FrictionKind;
  label: string;
  impact: "low" | "medium" | "high";
  reduction: string;
};

export type IgnoreRecommendation = {
  id: string;
  title: string;
  reason: string;
  action: IgnoreAction;
};

export type ExecutiveLeverage = {
  itemId: string;
  title: string;
  timeSavedHours: number;
  decisionsSaved: number;
  researchAvoided: boolean;
  automationPotential: number;
  revenueImpact: string;
  customerImpact: string;
  founderEffort: "low" | "medium" | "high";
  summary: string;
};

export type ExecutiveDesk = {
  todaysMission: { id: string; name: string; summary: string; progress: number };
  executiveBriefHeadline: string;
  recommendedDecision: { id: string; title: string; headline: string; why: string } | null;
  topOpportunities: { id: string; title: string; summary: string }[];
  waitingOnOthers: { id: string; label: string; waitingOn: string }[];
  recommendedNextAction: { id: string; label: string; reason: string };
};

export type MorningExperience = {
  greeting: string;
  officePrepared: string;
  missionLine: string;
  decisionLine: string;
  opportunityLine: string;
  calmClose: string;
};

export type CommandCenterContext = {
  missionId?: MissionId;
  date?: string;
};

export type TodayView = {
  missionId: MissionId;
  morning: MorningExperience;
  desk: ExecutiveDesk;
  focus: ExecutiveFocusScore;
  generatedAt: string;
};

export type FocusView = {
  focus: ExecutiveFocusScore;
  now: AttentionItem[];
  next: AttentionItem[];
  simplification: string[];
};

export type AttentionView = {
  items: AttentionItem[];
  byLevel: Record<AttentionLevel, AttentionItem[]>;
  ignore: IgnoreRecommendation[];
};

export type LeverageView = {
  items: ExecutiveLeverage[];
  topRecommendation: string;
};

export type CommandCenterView = {
  product: "founder";
  today: TodayView;
  attention: AttentionView;
  focus: FocusView;
  leverage: LeverageView;
  desk: ExecutiveDesk;
  friction: ExecutiveFriction[];
  energy: EnergyAwareness;
  sources: string[];
};

/** Calm Intelligence — showing less, helping more (cognitive load reduction). */

import type { MissionId } from "@/lib/founder/missions/types";

export type InterruptionClass =
  | "interrupt_immediately"
  | "mention_today"
  | "mention_this_week"
  | "mention_later"
  | "never_mention";

export type DisclosureLayer = "summary" | "detail" | "evidence" | "history";

export type AttentionFilterResult = {
  id: string;
  title: string;
  summary: string;
  source: string;
  neededToday: boolean;
  movesActiveMission: boolean;
  reducesFriction: boolean;
  canWait: boolean;
  shouldStayHidden: boolean;
  passes: boolean;
};

export type CalmFocusScore = {
  score: number;
  label: "calm" | "steady" | "strained" | "overloaded";
  currentOverload: number;
  decisionFatigue: number;
  contextSwitching: number;
  researchOverload: number;
  recommendationOverload: number;
  missionOverload: number;
  simplification: string[];
};

export type SimplificationAction =
  | "hide_complexity"
  | "merge_duplicates"
  | "collapse_related"
  | "reduce_repetition"
  | "suggest_archive"
  | "suggest_delegate"
  | "suggest_automate";

export type SimplificationSuggestion = {
  id: string;
  action: SimplificationAction;
  title: string;
  reason: string;
};

export type RuleOfOne = {
  mission: { id: MissionId; name: string } | null;
  recommendation: { id: string; title: string; summary: string } | null;
  decision: { id: string; title: string } | null;
  nextStep: { id: string; label: string } | null;
};

export type RuleOfThree<T> = {
  items: T[];
  hiddenCount: number;
  principle: string;
};

export type ProgressiveDisclosure = {
  summary: string;
  detail?: string;
  evidence?: string[];
  history?: string[];
  layer: DisclosureLayer;
};

export type ExecutivePresence = {
  tone: "calm" | "prepared" | "thoughtful" | "professional" | "intentional" | "quietly_confident";
  headline: string;
  subhead: string;
  neverUrgentWithoutReason: true;
};

export type CalmIntelligenceContext = {
  missionId?: MissionId;
  requestedLayer?: DisclosureLayer;
};

export type CalmIntelligenceView = {
  product: "founder";
  missionId: MissionId;
  generatedAt: string;
  principle: string;
  presence: ExecutivePresence;
  focus: CalmFocusScore;
  ruleOfOne: RuleOfOne;
  opportunities: RuleOfThree<{ id: string; title: string; summary: string }>;
  risks: RuleOfThree<{ id: string; title: string; summary: string }>;
  waiting: RuleOfThree<{ id: string; label: string }>;
  recommendations: RuleOfThree<{ id: string; title: string; summary: string }>;
  filtered: AttentionFilterResult[];
  hiddenCount: number;
  simplification: SimplificationSuggestion[];
  interruptions: { id: string; title: string; classification: InterruptionClass }[];
};

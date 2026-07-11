/**
 * Spark Wisdom Layer — Specs 120–131.
 * How Spark thinks before every response (invisible to members).
 *
 * @see docs/SPARK_WISDOM_LAYER_FRAMEWORK.md
 * @see docs/THE_SHARI_PRINCIPLE.md
 */

export const WISDOM_LAYER_SPEC_RANGE = { from: 120, to: 131 } as const;

export const SHARI_PRINCIPLE =
  "Information answers questions. Wisdom changes outcomes." as const;

export const WISDOM_BEFORE_INFORMATION_QUESTION =
  "What would help this member most right now?" as const;

/** Spec 120 — primary need classification */
export type MemberNeedKind =
  | "information"
  | "coaching"
  | "perspective"
  | "encouragement"
  | "clarification"
  | "decision_partner";

export type MemberNeedAssessment = {
  primary: MemberNeedKind;
  secondary?: MemberNeedKind;
  rationale: string;
};

/** Spec 128 — thinking pause snapshot */
export type ThinkingPauseSnapshot = {
  surfaceAsk: string;
  accomplishmentGoal: string | null;
  emotionUnderneath: string | null;
  cognitiveOverload: boolean;
  helpMost: MemberNeedKind;
  workspaceCandidate: string | null;
  invisibleWorkNotes: string[];
};

/** Spec 122 */
export type InsightRecommendation = {
  due: boolean;
  turnCount: number;
  framing: "pattern" | "hearing" | "emerged";
  guidance: string;
};

/** Spec 123 */
export type JudgmentCue = {
  appropriate: boolean;
  permissionPhrase: string;
  guidance: string;
};

/** Spec 124 */
export type GentleChallengeCue = {
  assumption: string;
  permissionPhrase: string;
  alternativePerspective: string;
};

/** Spec 132 — emotional blocker before strategy */
export type EmotionalBlockerCue = {
  depth: "explore" | "honor_practical" | "off";
  signal: string;
  curiosityOpener: string;
  guidance: string;
  possibleBlockers: readonly string[];
  adhdNormalizeLine: string;
  adhdNormalizeWhenFit: string;
};

/** Spec 125 */
export type ConversationSynthesisCue = {
  appropriate: boolean;
  template: "discovered" | "answered" | "still_decide";
  guidance: string;
};

/** Spec 126 */
export type WorkspaceOpportunityId =
  | "client_avatar"
  | "clear_my_mind"
  | "gallery"
  | "decision_compass"
  | "project_workspace"
  | "journal";

export type WorkspaceOpportunity = {
  workspace: WorkspaceOpportunityId;
  label: string;
  signal: string;
  invitePhrase: string;
};

/** Spec 127 */
export type MentorMomentCue = {
  appropriate: boolean;
  opener: string;
  guidance: string;
};

/** Spec 129 */
export type FutureBenefitPlan = {
  remember: boolean;
  organize: boolean;
  connectLater: boolean;
  reduceFutureWork: boolean;
  preventFrustration: boolean;
  notes: string[];
};

import type { OutcomeDiscoveryResult } from "./outcomeDiscovery";

export type WisdomLoopInput = {
  memberMessage: string;
  messageHistory: Array<{ role: "user" | "assistant"; content: string }>;
};

export type WisdomLoopResult = {
  thinkingPause: ThinkingPauseSnapshot;
  memberNeed: MemberNeedAssessment;
  hiddenIntentSummary: string | null;
  outcomeDiscovery: OutcomeDiscoveryResult;
  insight: InsightRecommendation | null;
  judgment: JudgmentCue | null;
  gentleChallenge: GentleChallengeCue | null;
  emotionalBlocker: EmotionalBlockerCue | null;
  synthesis: ConversationSynthesisCue | null;
  opportunity: WorkspaceOpportunity | null;
  mentorMoment: MentorMomentCue | null;
  futureBenefit: FutureBenefitPlan;
  promptHint: string;
  devSummaries: string[];
};

/** Executive Awareness — notices change before presenting guidance. */

import type { MissionId } from "@/lib/founder/missions/types";

export type AwarenessDomain =
  | "customer_behavior"
  | "founder_behavior"
  | "mission_movement"
  | "research_change"
  | "content_performance"
  | "product_momentum"
  | "marketing_momentum"
  | "technology_shift"
  | "competitor_change"
  | "ai_development"
  | "operational_bottleneck"
  | "learning_opportunity"
  | "repeated_question"
  | "repeated_problem"
  | "growing_opportunity"
  | "weak_signal"
  | "unexpected_relationship";

export type ChangeKind =
  | "growing"
  | "declining"
  | "stable"
  | "emerging"
  | "unexpected"
  | "repeated"
  | "missing"
  | "dormant"
  | "recovered";

export type AwarenessConfidence = {
  level: "high" | "medium" | "low" | "exploratory";
  score: number;
  rationale: string;
};

export type AwarenessSignal = {
  id: string;
  domain: AwarenessDomain;
  title: string;
  summary: string;
  source: string;
  missionId?: MissionId;
  metric?: number;
  priorMetric?: number;
  observedAt: string;
};

export type AwarenessObservation = {
  id: string;
  signalId: string;
  domain: AwarenessDomain;
  title: string;
  summary: string;
  whatChanged: string;
  whyNoticed: string;
  whyItMatters: string;
  whoIsAffected: string;
  shouldAct: boolean;
  shouldWatch: boolean;
  confidence: AwarenessConfidence;
};

export type AwarenessPattern = {
  id: string;
  domain: AwarenessDomain;
  title: string;
  occurrences: number;
  changeKind: ChangeKind;
  summary: string;
  signalIds: string[];
};

export type AwarenessException = {
  id: string;
  title: string;
  summary: string;
  unexpectedBecause: string;
  confidence: AwarenessConfidence;
};

export type AwarenessChange = {
  id: string;
  signalId: string;
  kind: ChangeKind;
  title: string;
  summary: string;
  delta?: number;
  confidence: AwarenessConfidence;
};

export type AwarenessOpportunity = {
  id: string;
  title: string;
  summary: string;
  changeKind: ChangeKind;
  confidence: AwarenessConfidence;
  missionId?: MissionId;
};

export type AwarenessRisk = {
  id: string;
  title: string;
  summary: string;
  changeKind: ChangeKind;
  confidence: AwarenessConfidence;
  missionId?: MissionId;
};

export type AwarenessRelationship = {
  id: string;
  fromObservationId: string;
  toObservationId: string;
  kind: "supports" | "correlates" | "contradicts" | "extends" | "forgotten_link";
  summary: string;
};

export type AwarenessOutputChannel =
  | "founder_alert"
  | "executive_brief"
  | "mission_recommendation"
  | "opportunity_recommendation"
  | "background";

export type AwarenessRecommendation = {
  id: string;
  title: string;
  summary: string;
  channel: AwarenessOutputChannel;
  observationId: string;
  confidence: AwarenessConfidence;
  significant: true;
};

export type AwarenessContext = {
  missionId?: MissionId;
  includeBackground?: boolean;
};

export type AwarenessView = {
  product: "founder";
  missionId: MissionId;
  generatedAt: string;
  principle: string;
  signals: AwarenessSignal[];
  observations: AwarenessObservation[];
  changes: AwarenessChange[];
  patterns: AwarenessPattern[];
  exceptions: AwarenessException[];
  opportunities: AwarenessOpportunity[];
  risks: AwarenessRisk[];
  relationships: AwarenessRelationship[];
  recommendations: AwarenessRecommendation[];
  backgroundCount: number;
};

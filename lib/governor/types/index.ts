/** Companion Intelligence Governor™ — coordinates all executive intelligence. */

import type { MissionId } from "@/lib/founder/missions/types";

export type IntelligenceSource =
  | "spark"
  | "flame"
  | "fire"
  | "research"
  | "executive_questions"
  | "institutional_memory"
  | "awareness"
  | "predictions"
  | "executive_decision"
  | "executive_brief"
  | "executive_orchestrator"
  | "intelligence_graph"
  | "continuous_improvement"
  | "command_center"
  | "founder_profile"
  | "opportunity_discovery"
  | "overnight_cycle"
  | "calm_intelligence"
  | "executive_os"
  | "experiences";

export type GovernorDisposition =
  | "interrupt"
  | "wait"
  | "brief_today"
  | "mission_recommendation"
  | "update_memory"
  | "notify_founder"
  | "remember_silently"
  | "silent";

export type GovernorConfidence = {
  level: "high" | "medium" | "low" | "exploratory";
  score: number;
  rationale: string;
  evidence: string[];
};

export type IncomingRecommendation = {
  id: string;
  source: IntelligenceSource;
  title: string;
  summary: string;
  leverageScore: number;
  systemLabel: string;
};

export type GovernorDecision = {
  shouldInterrupt: boolean;
  shouldWait: boolean;
  shouldBriefToday: boolean;
  shouldMissionRecommend: boolean;
  shouldUpdateMemory: boolean;
  shouldNotifyFounder: boolean;
  shouldRememberSilently: boolean;
  disposition: GovernorDisposition;
  reasoning: string;
  confidence: GovernorConfidence;
};

export type GovernorConflict = {
  id: string;
  competingIds: string[];
  winnerId: string;
  explanation: string;
};

export type GovernorRecommendation = {
  id: string;
  title: string;
  summary: string;
  source: IntelligenceSource;
  disposition: GovernorDisposition;
  confidence: GovernorConfidence;
  reasoning: string;
  combinedFrom?: string[];
};

export type GovernorContext = {
  missionId?: MissionId;
};

export type GovernorView = {
  product: "founder";
  missionId: MissionId;
  generatedAt: string;
  principle: string;
  coordinatedSystems: IntelligenceSource[];
  incoming: IncomingRecommendation[];
  deferredCount: number;
  silentCount: number;
  primary: GovernorRecommendation | null;
  supporting: GovernorRecommendation[];
  conflicts: GovernorConflict[];
  attentionProtected: true;
};

/** Founder Daily Workflow™ — work modes replace module thinking. */

import type { PreparedOffice } from "../../concierge/types";
import type { FounderWorkspaceId } from "../../types/workspace";

export type FounderWorkModeId =
  | "think"
  | "build"
  | "create"
  | "grow"
  | "review"
  | "lead";

export type FounderWorkMode = {
  id: FounderWorkModeId;
  label: string;
  summary: string;
  /** Existing workspace orchestrator ids — no duplication. */
  workspaceIds: readonly FounderWorkspaceId[];
  roomIds: readonly string[];
};

export type TodayWorkLayer =
  | "listening"
  | "research"
  | "customer"
  | "decisions"
  | "cursor"
  | "content"
  | "workshop"
  | "marketing"
  | "approvals"
  | "analytics"
  | "team"
  | "opportunity"
  | "mission";

export type TodayWorkItemTone =
  | "primary"
  | "opportunity"
  | "decision"
  | "wait"
  | "context"
  | "calm";

export type TodayWorkItem = {
  id: string;
  layer: TodayWorkLayer;
  title: string;
  summary?: string;
  whyItMatters?: string;
  href?: string;
  hrefLabel?: string;
  tone?: TodayWorkItemTone;
};

export type TodayMission = {
  title: string;
  summary: string;
  whyItMatters: string;
};

export type FounderDailyWorkflow = {
  greeting: string;
  mission: TodayMission;
  workMode: FounderWorkMode;
  /** One clear next step — Shari test. */
  primaryAction: TodayWorkItem;
  currentInitiative: TodayWorkItem;
  currentContext: TodayWorkItem;
  opportunities: TodayWorkItem[];
  pendingDecisions: TodayWorkItem[];
  canWait: TodayWorkItem[];
  relatedKnowledge: TodayWorkItem[];
  relatedContent: TodayWorkItem[];
  relatedMarketing: TodayWorkItem[];
  relatedTeamActivity: TodayWorkItem[];
  relatedAnalytics: TodayWorkItem[];
  /** Full vertical stack — assembled from existing services. */
  assembledStack: TodayWorkItem[];
  /** Prepared office — existing Concierge components consume this. */
  office: PreparedOffice;
  preparedAt: string;
};

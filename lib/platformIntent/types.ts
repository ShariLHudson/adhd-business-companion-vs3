/**
 * 045 — Platform Intent Routing types.
 * Users describe goals; Estate chooses expert, blueprint, project, visuals.
 */

import type { ChamberMemberId } from "@/lib/chamber/chamberMemberRegistry";

export type PlatformIntentType =
  | "know"
  | "decide"
  | "create"
  | "improve"
  | "continue";

export type ProjectIntegrationLevel =
  | "none"
  | "simple"
  | "complex"
  | "long_term";

export type VisibleThinkingLevel =
  | "none"
  | "helpful"
  | "recommended"
  | "essential";

export type CreateBlueprint = {
  id: string;
  label: string;
  /** Create catalog / workflow type label */
  catalogType: string;
  ownerChamberMemberId: ChamberMemberId | null;
  aliases: readonly string[];
  purpose: string;
  expectedOutcome: string;
  projectIntegration: ProjectIntegrationLevel;
  visibleThinking: VisibleThinkingLevel;
  /** Events Intelligence / other specialty runtime */
  specialtyRuntime?: "events" | null;
  /** 047 creation ecosystem id */
  ecosystemId?: string | null;
};

export type PlatformIntentClassification = {
  intent: PlatformIntentType;
  confidence: "high" | "medium" | "low";
  /** Blueprint when CREATE/IMPROVE/CONTINUE resolves one */
  blueprint: CreateBlueprint | null;
  reason: string;
};

export type PlatformIntentRouteAction =
  | "stay_conversation"
  | "offer_board"
  | "launch_create"
  | "resume_create"
  | "help_figure_out";

export type PlatformIntentRoute = {
  intent: PlatformIntentType;
  action: PlatformIntentRouteAction;
  blueprint: CreateBlueprint | null;
  ownerChamberMemberId: ChamberMemberId | null;
  /** Auto Project Home when beneficial */
  autoProjectHome: boolean;
  offerVisibleThinking: boolean;
  /** Internal only — never show to member */
  routingNote: string;
};

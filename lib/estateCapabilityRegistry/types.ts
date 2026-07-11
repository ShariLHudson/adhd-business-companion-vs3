/**
 * Estate Capability Registry — canonical capability model.
 * Spark consults this before routing. Never guess what exists.
 */

import type { AppSection } from "@/lib/companionUi";
import type { EstateCapabilityCategory } from "@/lib/estateBrain/intelligenceTypes";

export type EstateCapabilityKind =
  | "creation"
  | "research"
  | "focus"
  | "restore"
  | "momentum"
  | "journal"
  | "learn"
  | "visual"
  | "audio"
  | "game"
  | "business"
  | "conversation";

export type CompletionWorkflowId =
  | "standard_creation"
  | "research_summary"
  | "focus_session"
  | "journal_entry"
  | "none";

export type EstateCapabilityEntry = {
  id: string;
  name: string;
  aliases: readonly string[];
  description: string;
  purpose: string;
  bestUsedWhen: readonly string[];
  category: EstateCapabilityKind;
  brainCategory?: EstateCapabilityCategory;
  relatedCapabilityIds: readonly string[];
  requiredRoomId: string | null;
  alternativeRoomIds: readonly string[];
  primarySection: AppSection | null;
  canLaunchDirectly: boolean;
  canRecommend: boolean;
  requiresDiscovery: boolean;
  requiredUserInput: readonly string[];
  completionWorkflowId: CompletionWorkflowId;
  triggers: readonly string[];
  expertIds: readonly string[];
};

export type CapabilityConsultMatch = {
  entry: EstateCapabilityEntry;
  score: number;
  matchedOn: "trigger" | "alias" | "name" | "bestUsedWhen";
};

export type CapabilityRecommendationOption = {
  capabilityId: string;
  name: string;
  reason: string;
  roomId: string | null;
};

export type EstateConciergeDecision =
  | {
      kind: "recommend";
      goalSummary: string;
      options: CapabilityRecommendationOption[];
      line: string;
    }
  | {
      kind: "single";
      capability: EstateCapabilityEntry;
      line: string;
      launchDiscovery: boolean;
    }
  | {
      kind: "stay_in_chat";
      line: string;
      capability: EstateCapabilityEntry;
    };

export type SparkConversationState = {
  currentRoomId: string | null;
  currentTask: string | null;
  currentWorkflow: string | null;
  currentDocument: string | null;
  currentResearch: string | null;
  currentExpert: string | null;
  currentVisualModel: string | null;
  conversationGoal: string | null;
  activeCapabilityId: string | null;
  discoveryComplete: boolean;
  updatedAt: string;
};

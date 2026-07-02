/**
 * Estate Intelligence™ — shared types (Phase 1 registry shell).
 *
 * Serves The Conversation Front Door™: members describe needs; Spark knows
 * where the Estate can help — without requiring room names or map hunting.
 *
 * @see docs/ESTATE_INTELLIGENCE_FRAMEWORK.md
 * @see lib/sparkEstateRooms/types.ts — CONVERSATION_FRONT_DOOR_PRINCIPLE
 */

import type { AppSection } from "@/lib/companionUi";
import type { IntentCategory } from "@/lib/intentRoutingIntelligence";

export type EstateAssetCategory =
  | "room"
  | "tool"
  | "workflow"
  | "builder"
  | "knowledge"
  | "template"
  | "research"
  | "audio"
  | "report"
  | "collection"
  | "game"
  | "reflection";

export type EstateJourneyRole =
  | "learn"
  | "think"
  | "plan"
  | "create"
  | "reflect"
  | "research"
  | "execute"
  | "recover";

export type EstateUserNeed =
  | "calm"
  | "momentum"
  | "clarity"
  | "decide"
  | "research"
  | "learn"
  | "create"
  | "rest"
  | "organize"
  | "reflect"
  | "restore";

export type EstateRegistryEntry = {
  id: string;
  name: string;
  category: EstateAssetCategory;
  /** Internal — fuels hints; never pasted as a lecture. */
  purpose: string;
  /** How Spark introduces the place — invitation, not definition. */
  memberDescription: string;
  primarySection?: AppSection;
  sections?: AppSection[];
  objectId?: string;
  keywords: string[];
  phrases?: string[];
  emotionalStates?: string[];
  userNeeds?: EstateUserNeed[];
  businessGoals?: string[];
  intents?: IntentCategory[];
  problemsSolved: string[];
  outcomes: string[];
  relatedEntryIds?: string[];
  journeyRole?: EstateJourneyRole;
  status: "live" | "partial" | "planned";
};

export type EstateMatchConfidence = "high" | "medium" | "low" | "none";

export type EstateMatchResult = {
  entry: EstateRegistryEntry;
  score: number;
  confidence: EstateMatchConfidence;
  confidenceScore: number;
  reasons: string[];
};

export type EstateRouteResult = {
  primaryEntry: EstateRegistryEntry;
  invitation: string;
  primarySection: AppSection | null;
  suppressGenericDefinition: boolean;
};

export type EstateIntelligenceEvaluation = {
  userText: string;
  bestMatch: EstateMatchResult | null;
  route: EstateRouteResult | null;
  /** True when member is already inside the matched destination. */
  suppressed: boolean;
  evaluatedAt: string;
};

export type EvaluateEstateIntelligenceInput = {
  userText: string;
  activeSection?: AppSection | null;
  workspacePanel?: string | null;
  emotionalState?: string | null;
  overwhelmed?: boolean;
  intentCategory?: IntentCategory | null;
};

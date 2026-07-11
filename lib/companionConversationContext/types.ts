/**
 * Companion Conversation Context — one continuous companion turn model.
 * Preserves location, pending offers, KB thread, and emotional pivots before goal routing.
 */

import type { AppSection } from "@/lib/companionUi";
import type { CompanionActiveSession } from "@/lib/companionIntelligence/activeSession";
import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";

export type KnowledgeAnswerType =
  | "factual_kb"
  | "navigation_offer"
  | "experience"
  | null;

export type DiscussedEntityKind = "object" | "room" | "feature";

export type LastDiscussedEntity = {
  kind: DiscussedEntityKind;
  id: string;
  displayName: string;
  answeredAtTurn: number;
};

export type CompanionPendingActionType =
  | "estate_navigate"
  | "open_feature"
  | "open_workspace";

export type CompanionPendingAction = {
  type: CompanionPendingActionType;
  placeId?: string;
  locationId?: string;
  featureId?: string;
  workspaceSection?: AppSection;
  priorAssistantQuestion: string;
  originalReason: string;
  offeredAtTurn: number;
  expiresAtTurn: number;
};

export type CompanionLocationContext = {
  locationId: string;
  placeId: string;
  displayName: string;
};

export type CompanionConversationState = {
  activeSession: CompanionActiveSession;
  currentLocation: CompanionLocationContext | null;
  currentArea: string | null;
  lastAssistantQuestion: string | null;
  pendingAction: CompanionPendingAction | null;
  lastDiscussedEntity: LastDiscussedEntity | null;
  lastKnowledgeAnswerType: KnowledgeAnswerType;
  lastUserGoal: ConversationGoal | null;
  currentTopic: string | null;
  emotionalPivotDetected: boolean;
  updatedAtTurn: number;
};

export type CompanionTurnTrace = {
  userMessage: string;
  activeSession: CompanionActiveSession;
  currentLocation: string | null;
  pendingAction: CompanionPendingActionType | null;
  lastDiscussedEntity: string | null;
  emotionalPivotDetected: boolean;
  detectedPrimaryGoal: ConversationGoal | null;
  winningCapability: EstateCapability | null;
  blockedCapabilities: EstateCapability[];
  finalResponseReason: string;
};

export const COMPANION_CONTEXT_STORAGE_KEY =
  "companion-conversation-context-v1";

export const PENDING_ACTION_TURN_LIMIT = 3;

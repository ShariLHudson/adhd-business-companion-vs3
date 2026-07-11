/**
 * Semantic Intent Resolver — meaning-first member intent (regex is fast path only).
 */

import type { ConversationGoal } from "@/lib/conversationStabilization/goalClassifier";
import type { EstateCapability } from "@/lib/conversationStabilization/capabilityTypes";

/** What the member is trying to do. */
export type SemanticMemberAction =
  | "navigate"
  | "open_feature"
  | "research"
  | "create"
  | "retrieve"
  | "capture"
  | "ask_how_to"
  | "ask_knowledge"
  | "recommendation"
  | "discovery"
  | "continue_session"
  | "conversation";

export type SemanticTargetKind =
  | "room"
  | "feature"
  | "object"
  | "experience"
  | "document"
  | "project"
  | "unknown";

export type SemanticNextStep =
  | "navigate"
  | "open_feature"
  | "answer_from_kb"
  | "offer_choices"
  | "continue_workflow"
  | "clarify"
  | "conversation_fallback";

export type SemanticConfidence = "high" | "medium" | "low";

export type SemanticResolutionSource =
  | "regex_fast_path"
  | "semantic_kb"
  | "semantic_signal";

export type SemanticTarget = {
  kind: SemanticTargetKind;
  /** locationId · objectId · guideId · experienceGroupId · etc. */
  id?: string;
  displayName?: string;
  placeId?: string;
  locationId?: string;
  matchedPhrase?: string;
  /** When an object resolves but navigation is intended — parent room to visit. */
  parentLocationId?: string;
  parentPlaceId?: string;
  choiceLocationIds?: string[];
};

export type SemanticMemberIntent = {
  action: SemanticMemberAction;
  target: SemanticTarget;
  nextStep: SemanticNextStep;
  confidence: SemanticConfidence;
  source: SemanticResolutionSource;
  /** Maps into existing stabilization goal when confident. */
  conversationGoal?: ConversationGoal;
  estateCapability?: EstateCapability;
  reason: string;
};

export type SemanticIntentContext = {
  userText: string;
  lastAssistantText?: string | null;
  activeWorkflow?: string | null;
  workspace?: string | null;
  sessionLocked?: boolean;
  explicitDirectionChange?: boolean;
  activeSession?: string;
  currentLocationId?: string;
};

export function isResolvedSemanticIntent(
  intent: SemanticMemberIntent,
): boolean {
  return (
    intent.confidence !== "low" &&
    intent.action !== "conversation" &&
    intent.nextStep !== "conversation_fallback"
  );
}

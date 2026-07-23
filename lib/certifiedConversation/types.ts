/**
 * Shared Certified Conversation Pipeline — quality gates every experience can use.
 * Behavior stays experience-specific via ConversationBehaviorMode.
 */

import type { ConversationRuntimeState } from "@/lib/conversationIntelligenceEngine";
import type { TopicAnchor } from "@/lib/topicContinuityAnchorIntelligence";

/** How the experience should behave after certification. */
export type ConversationBehaviorMode =
  /** Talk It Out — reflect, explore, one grounded question. */
  | "reflective"
  /** Chamber / expert members — answer first, optional one useful follow-up. */
  | "advisory"
  /** Create — blueprint / document facilitation. */
  | "facilitative";

export type CertifiedConversationMessage = {
  role: "user" | "assistant";
  content: string;
  id?: string;
};

export type CertifyConversationDeliveryInput = {
  experienceId: "chamber" | "talk-it-out" | "create" | "general-chat";
  behaviorMode: ConversationBehaviorMode;
  conversationId: string;
  userText: string;
  draftText: string;
  messages: readonly CertifiedConversationMessage[];
  priorTopicAnchor?: TopicAnchor | null;
  priorCieState?: ConversationRuntimeState | null;
  /** Chamber member id when advisory. */
  specialistId?: string | null;
  specialistLabel?: string | null;
  repairActive?: boolean;
  wasClarification?: boolean;
};

export type CertifyConversationDeliveryResult = {
  text: string;
  topicAnchor: TopicAnchor;
  cieState: ConversationRuntimeState;
  policy: ChamberSharedResponsePolicyResult;
  regenerated: boolean;
  usedFallback: boolean;
};

export type ChamberSharedResponsePolicyResult = {
  answeredDirectly: boolean;
  onTopic: boolean;
  soundsLikeShari: boolean;
  natural: boolean;
  helpful: boolean;
  followUpQuestionCount: number;
  followUpWarranted: boolean;
  failures: string[];
  passed: boolean;
};

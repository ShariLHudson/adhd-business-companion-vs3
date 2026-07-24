/**
 * Conversation Session Spine — sole durable conversational authority.
 *
 * See SPINE_CONTRACT.md. Adapters (UC, Continuity, help-thread, CIE runtime)
 * project into or from this session; they must not outrank it.
 *
 * Phase 0/1: identity + reset alignment.
 * Phase 2: conversationHistory is the authoritative transcript (dual-write).
 * Later: ownership / cert persistence migrations.
 */

import type { UniversalCreationPhase } from "@/lib/universalCreation/types";

export type CreationMode = "quick" | "guided" | "discovery" | "research";

export type ConversationStage =
  | "listening"
  | "understanding"
  | "clarifying"
  | "confirming"
  | "exploring"
  | "creating"
  | "permission"
  | "review"
  | "complete"
  | "continue";

/** Studio Readiness Intelligence — levels 0–5 (Pass 4 gates on this field). */
export type StudioReadinessLevel = 0 | 1 | 2 | 3 | 4 | 5;

export type JourneyState = {
  label?: string;
  step?: string;
  metadata?: Record<string, string>;
};

export type SessionArtifactStatus = "active" | "paused" | "complete";

export type SessionArtifact = {
  id: string;
  itemType: string;
  title?: string;
  draftContent?: string;
  status: SessionArtifactStatus;
  pausedAt?: string;
  documentType?: string;
};

export type ResearchState = {
  status: "idle" | "in_progress" | "complete";
  query?: string;
  summary?: string;
  findings?: string[];
};

export type AnsweredQuestion = {
  slot: string;
  questionId?: string;
  answer: string;
  answeredAt: string;
};

export type ConversationHistoryEntry = {
  role: "user" | "assistant";
  content: string;
  at: string;
  /** Optional dual-write / adapter metadata — never member-facing. */
  metadata?: Record<string, string | number | boolean | null>;
};

export type ConversationSession = {
  sessionId: string;
  relationshipId: string;
  conversationId: string;
  currentIntent?: string;
  currentNeed?: string;
  emotionalState?: string;
  activeArtifact: SessionArtifact | null;
  artifactStack: SessionArtifact[];
  answeredQuestions: AnsweredQuestion[];
  researchState: ResearchState;
  studioReadinessLevel: StudioReadinessLevel;
  currentRoom?: string;
  currentStudio?: string;
  draftContent?: string;
  pendingQuestion?: string;
  currentStage: ConversationStage;
  creationMode?: CreationMode;
  currentJourneyState?: JourneyState;
  conversationHistory: ConversationHistoryEntry[];
  /** Adapter mirror — Universal Creation document type when in create flow */
  universalCreationDocumentType?: string;
  universalCreationPhase?: UniversalCreationPhase;
  updatedAt: string;
  createdAt: string;
};

export type ConversationSessionPatch = Partial<
  Omit<ConversationSession, "sessionId" | "relationshipId" | "conversationId" | "createdAt">
>;

export const CONVERSATION_SESSION_STORAGE_KEY = "companion-conversation-session-v1";
export const CONVERSATION_SESSION_UPDATED = "companion-conversation-session-updated";

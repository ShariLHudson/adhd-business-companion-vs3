/**
 * Spark Core Intelligence v1.0 — Memory & Personalization Engine types.
 * @see spark-intelligence-foundation/18-spark-core-memory-personalization-engine.md
 */

import type { IntelligenceReadyHooks } from "@/lib/intelligence/intelligenceReadyTypes";
import type { EstateRoomId } from "@/lib/sparkResponseIntelligence/types";

export const SPARK_CORE_MEMORY_ENGINE_VERSION = "1.0" as const;

/** Separate memory namespaces — founder never mixes with member. */
export type MemoryType =
  | "short_term_conversation"
  | "long_term_business"
  | "communication_preference"
  | "project"
  | "goal"
  | "relationship"
  | "learning"
  | "estate"
  | "founder";

export type MemoryConfidence =
  | "observed"
  | "confirmed"
  | "high_confidence"
  | "archived"
  | "needs_confirmation";

export type MemoryProvenance =
  | "member_stated"
  | "member_confirmed"
  | "observed"
  | "imported";

/** Canonical keys Spark may remember when governed. */
export type MemoryKey =
  | "business_name"
  | "industry"
  | "offers"
  | "products"
  | "audience"
  | "goals"
  | "brand_voice"
  | "active_projects"
  | "previous_decisions"
  | "preferred_tone"
  | "preferred_response_length"
  | "learning_style"
  | "recurring_challenges"
  | "wins"
  | "milestones"
  | "preferred_rooms"
  | "favorite_workflows"
  | "recent_context"
  | "emotional_context_session";

export type MemoryRecord = {
  id: string;
  userId: string;
  memoryType: MemoryType;
  key: MemoryKey | string;
  value: unknown;
  confidence: MemoryConfidence;
  provenance: MemoryProvenance;
  createdAt: string;
  updatedAt: string;
  lastAccessedAt?: string;
  expiresAt?: string;
  archivedAt?: string;
  confirmedAt?: string;
  intelligenceHooks?: IntelligenceReadyHooks;
};

export type MemoryWriteProposal = {
  id: string;
  userId: string;
  memoryType: MemoryType;
  key: MemoryKey | string;
  proposedValue: unknown;
  provenance: MemoryProvenance;
  requiresConfirmation: boolean;
  blocked: boolean;
  blockReason?: string;
  promptText?: string;
  conflictWithId?: string;
};

export type MemoryConflict = {
  existingId: string;
  existingValue: unknown;
  proposedValue: unknown;
  key: MemoryKey | string;
  promptText: string;
};

export type MemoryRecallDecision = {
  shouldAsk: boolean;
  shouldConfirm: boolean;
  recalledFacts: MemoryRecord[];
  staleFacts: MemoryRecord[];
  missingFacts: MemoryKey[];
  reduceRepetition: string[];
};

export type UserVisibleMemoryProfile = {
  userId: string;
  generatedAt: string;
  sections: Array<{
    memoryType: MemoryType;
    label: string;
    items: Array<{
      id: string;
      key: string;
      displayValue: string;
      confidence: MemoryConfidence;
      editable: boolean;
    }>;
  }>;
  totalActive: number;
  totalArchived: number;
};

export type MemoryExport = {
  userId: string;
  exportedAt: string;
  version: typeof SPARK_CORE_MEMORY_ENGINE_VERSION;
  records: MemoryRecord[];
};

export type CoreMemoryInput = {
  turnId: string;
  threadId: string;
  userId: string;
  memberMessage: string;
  activeRoom?: EstateRoomId;
  /** Explicit member consent to remember something this turn */
  rememberConsent?: boolean;
  /** Member confirmed a pending remember prompt */
  confirmedProposalId?: string;
};

export type CoreMemoryIngress = {
  recall: MemoryRecallDecision;
  contextBundle: Partial<Record<MemoryKey, unknown>>;
  pendingProposals: MemoryWriteProposal[];
  conflicts: MemoryConflict[];
};

export type CoreMemoryEgress = {
  rememberPrompt?: {
    proposalId: string;
    promptText: string;
  };
  confirmationPrompt?: {
    conflictId: string;
    promptText: string;
  };
  profileHint?: string;
};

export type CoreMemoryResult = {
  ingress: CoreMemoryIngress;
  egress?: CoreMemoryEgress;
  readyToPersonalize: boolean;
  engineVersion: typeof SPARK_CORE_MEMORY_ENGINE_VERSION;
};

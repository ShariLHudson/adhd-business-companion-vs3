/**
 * Estate Memory Continuity Layer™ — shared memory schema across all Estate rooms.
 *
 * One continuous intelligence moving through different environments.
 *
 * @see docs/ESTATE_MEMORY_CONTINUITY.md (implementation reference)
 */

import type { AppSection } from "@/lib/companionUi";

import type { EstateRoomVisitMemory } from "@/lib/estate/estateRoomVisitMemory";
import type { EstateJourneyEngineState } from "@/lib/estateJourneyEngine/types";

export const ESTATE_MEMORY_VERSION = 1 as const;

export type EstateEmotionalLabel =
  | "overwhelmed"
  | "focused"
  | "calm"
  | "stuck"
  | "energized"
  | "anxious"
  | "unclear"
  | string;

export type EstateEmotionalSnapshot = {
  label: EstateEmotionalLabel;
  at: string;
  /** detected = companion emotion engine; expressed = member's words */
  source: "detected" | "expressed";
};

export type EstateUserProfileSlice = {
  displayName?: string;
  businessType?: string;
  goals: string[];
  preferences: string[];
};

export type EstateMomentumState = {
  lastAction?: string;
  lastActionAt?: string;
  progressNotes: string[];
  unfinishedLoops: string[];
  stalledWork?: string;
};

export type EstateJourneyStep = {
  entryId: string;
  roomName: string;
  section: AppSection;
  enteredAt: string;
  reason?: string;
  exitedAt?: string;
};

export type EstateActiveGoal = {
  id: string;
  label: string;
  startedAt: string;
  source: string;
};

export type EstateRoomPointer = {
  entryId: string;
  section: AppSection;
  enteredAt: string;
};

export type EstateTransitionContext = {
  fromEntryId?: string;
  fromSection?: AppSection;
  toEntryId: string;
  toSection: AppSection;
  reason: string;
  userText?: string;
  at: string;
  expectedNextStep?: string;
};

export type EstateConversationDigestTurn = {
  role: "user" | "assistant";
  summary: string;
  at: string;
};

export type EstateActiveJourney = {
  steps: EstateJourneyStep[];
  intentChain: string[];
  /** Hybrid command router — remaining destinations after primary */
  pendingEntryIds: string[];
  activeTask?: string;
};

export type EstateMemory = {
  version: typeof ESTATE_MEMORY_VERSION;
  sessionId: string;
  updatedAt: string;
  userProfile: EstateUserProfileSlice;
  emotionalState: {
    current?: EstateEmotionalLabel;
    history: EstateEmotionalSnapshot[];
  };
  momentumState: EstateMomentumState;
  activeJourney: EstateActiveJourney;
  currentRoom?: EstateRoomPointer;
  previousRoom?: EstateRoomPointer & { leftAt: string };
  lastTransition?: EstateTransitionContext;
  activeGoals: EstateActiveGoal[];
  conversationDigest: EstateConversationDigestTurn[];
  /** Visit patterns — favorites, frequency, unfinished activity */
  roomVisitMemory?: EstateRoomVisitMemory;
  /** Estate Journey Engine™ — continuous journey state */
  journeyEngine?: EstateJourneyEngineState;
};

export type RecordEstateTurnInput = {
  userText: string;
  assistantText?: string;
  emotionalLabel?: EstateEmotionalLabel | null;
  overwhelmed?: boolean;
  intentLabel?: string | null;
  activeGoal?: string | null;
  momentumNote?: string | null;
};

export type RecordEstateRoomTransitionInput = {
  toSection: AppSection;
  toEntryId?: string;
  fromSection?: AppSection | null;
  reason: string;
  userText?: string;
  expectedNextStep?: string;
  pendingJourneyEntryIds?: string[];
  preserveChat?: boolean;
  /** Shari speaks after arrival animation — never during */
  shariGreeting?: string;
  playArrival?: boolean;
  /** Ambient audio during arrival — off for direct chat navigation */
  playAmbience?: boolean;
};

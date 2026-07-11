/**
 * Spark Recognition Engine — shared types.
 * Source of truth: docs/estate/recognition/SPARK_RECOGNITION_ENGINE.md
 *
 * Distinct from lib/recognition/ (birthday/anniversary milestones).
 */

import type { EstateWingId } from "./wings";

/** Canonical recognition room place IDs (estate places). */
export const RECOGNITION_ROOM_IDS = [
  "evidence-vault",
  "gardens",
  "celebration-room",
  "legacy-studio",
  "portfolio",
] as const;

export type RecognitionRoomId = (typeof RECOGNITION_ROOM_IDS)[number];

export const RECOGNITION_RECORD_TYPES = [
  "discovery",
  "quiet_celebration",
  "festive_celebration",
  "legacy_story",
  "hall_candidate",
  "hall_exhibit_reference",
] as const;

export type RecognitionRecordType = (typeof RECOGNITION_RECORD_TYPES)[number];

export const RECOGNITION_LIFECYCLE_STATUSES = [
  "captured",
  "preserved",
  "recognized",
  "celebrated_quiet",
  "celebrated_festive",
  "chronicled",
  "hall_candidate",
  "hall_exhibit",
  "archived",
] as const;

export type RecognitionLifecycleStatus =
  (typeof RECOGNITION_LIFECYCLE_STATUSES)[number];

export const RECOGNITION_TONES = [
  "reflective",
  "peaceful",
  "grateful",
  "bittersweet",
  "private",
  "tender",
  "calm",
  "joyful",
  "exciting",
  "triumphant",
  "festive",
  "proud",
  "energizing",
  "celebratory",
  "neutral",
] as const;

export type RecognitionTone = (typeof RECOGNITION_TONES)[number];

export const REFLECTIVE_TONES: readonly RecognitionTone[] = [
  "reflective",
  "peaceful",
  "grateful",
  "bittersweet",
  "private",
  "tender",
  "calm",
] as const;

export const FESTIVE_TONES: readonly RecognitionTone[] = [
  "joyful",
  "exciting",
  "triumphant",
  "festive",
  "proud",
  "energizing",
  "celebratory",
] as const;

export type HallCandidateStatus =
  | "none"
  | "suggested"
  | "marked"
  | "declined";

export type CelebrationIntensity = "small" | "full" | "help_me_decide";

export type RecognitionExperiencePath = "fast" | "full";

export type RecognitionFlowKind =
  | "preserve_discovery"
  | "quiet_celebration"
  | "festive_celebration"
  | "legacy_story"
  | "hall_exhibit"
  | "management";

/** Shared recognition moment — rooms are views over these records. */
export type RecognitionRecord = {
  id: string;
  userId?: string;
  recordType: RecognitionRecordType;
  title: string;
  description?: string;
  body?: string;
  date: string;
  sourceContext?: string;
  sourceRoom?: string;
  lifecycleStatus: RecognitionLifecycleStatus;
  tone?: RecognitionTone;
  /** Internal only — never show small/medium/big to members. */
  significanceScoreInternal?: number;
  wing?: EstateWingId;
  tags: string[];
  people: string[];
  projectId?: string;
  attachmentIds: string[];
  relatedRecordIds: string[];
  hallCandidateStatus: HallCandidateStatus;
  hallExhibitId?: string;
  celebrationIntensity?: CelebrationIntensity;
  createdAt: string;
  updatedAt: string;
  lastRevisitedAt?: string;
};

/** Hall exhibit is its own record — references supporting recognition records. */
export type HallExhibit = {
  id: string;
  userId?: string;
  title: string;
  date: string;
  story?: string;
  plaqueText?: string;
  wing?: EstateWingId;
  tags: string[];
  featuredImageId?: string;
  attachmentIds: string[];
  relatedEvidenceIds: string[];
  relatedJournalIds: string[];
  relatedCelebrationIds: string[];
  relatedLegacyStoryIds: string[];
  inductionDate?: string;
  lastFeaturedAt?: string;
  createdAt: string;
  updatedAt: string;
};

/**
 * Required routing state — track independently.
 * Never claim "already here" unless visualRoom matches.
 *
 * Architecture Library aliases:
 * - visualRoom → visual_room
 * - conversationContext → conversation_room
 * - requestedDestination → requested_room
 * - previousRoom → previous_room
 * - activeRecognitionFlow → active_flow / active_workflow
 */
export type RecognitionRoomState = {
  /** visual_room — place currently visible on screen */
  visualRoom: string | null;
  /** conversation_room — what conversation believes is active */
  conversationContext: string | null;
  /** requested_room — explicit member navigation target */
  requestedDestination: string | null;
  /** previous_room — last visual room before the current one */
  previousRoom: string | null;
  /** active_flow — in-progress recognition flow */
  activeRecognitionFlow: ActiveRecognitionFlow | null;
};

export type ActiveRecognitionFlow = {
  id: string;
  kind: RecognitionFlowKind;
  path: RecognitionExperiencePath;
  recordId?: string;
  suggestedRoomId?: RecognitionRoomId;
  startedAt: string;
};

export type RecognitionRoutingDecision = {
  suggestedRoomId: RecognitionRoomId;
  path: RecognitionExperiencePath;
  preserveFirst: boolean;
  reason: string;
  memberPrompt: string;
  options: readonly RecognitionFastPathOption[];
};

export type RecognitionFastPathOption =
  | "preserve_it"
  | "celebrate_it"
  | "add_more_first"
  | "quiet_moment"
  | "joyful_celebration"
  | "help_me_decide"
  | "not_now";

export type RecognitionTriggerMatch = {
  matched: boolean;
  phrases: string[];
  suggestsCelebration: boolean;
  suggestsHallLanguage: boolean;
  suggestsPreserve: boolean;
};

/**
 * The Stables — experience architecture types.
 *
 * Horse is metaphor. Room develops entrepreneur qualities through story, reflection, and coaching.
 */

import type { AppSection } from "@/lib/companionUi";

export const STABLES_SECTION = "stables" as const satisfies AppSection;

/** Entrepreneur qualities the Stables develop — not horse training. */
export type StablesQualityId =
  | "leadership"
  | "trust"
  | "confidence"
  | "calm-under-pressure"
  | "communication"
  | "presence"
  | "partnership"
  | "consistency"
  | "patience"
  | "courage"
  | "emotional-regulation";

export type StablesLearningModality =
  | "story"
  | "analogy"
  | "reflection"
  | "guided-conversation"
  | "confidence-challenge"
  | "simulation"
  | "real-world-implementation";

export type StablesExperienceStatus = "placeholder" | "live";

export type StablesExperienceId =
  | "leadership-lessons"
  | "confidence-conversations"
  | "trust-challenges"
  | "business-analogies"
  | "reflection-moments"
  | "presence-practice"
  | "courage-builder"
  | "calm-under-pressure";

/** Future interactive object hooks — content not implemented in V1. */
export type StablesInteractiveObjectId =
  | "brass-horseshoe"
  | "saddle"
  | "leather-journal"
  | "grooming-brush"
  | "stable-gate"
  | "riding-arena";

export type StablesInteractiveExperienceKind =
  | "luck-and-readiness"
  | "partnership-and-weight"
  | "private-reflection"
  | "care-and-consistency"
  | "threshold-and-choice"
  | "practice-arena";

export type StablesSaveDestinationId =
  | "journal"
  | "institute-cabinet"
  | "evidence-vault"
  | "growth-profile";

export type StablesQualityDefinition = {
  id: StablesQualityId;
  title: string;
  metaphor: string;
};

export type StablesExperienceDefinition = {
  id: StablesExperienceId;
  title: string;
  trademark: string;
  summary: string;
  qualities: readonly StablesQualityId[];
  modalities: readonly StablesLearningModality[];
  status: StablesExperienceStatus;
  placeholderCopy: string;
  relatedExperienceIds: readonly StablesExperienceId[];
  relatedRoomIds: readonly string[];
};

export type StablesInteractiveObjectDefinition = {
  id: StablesInteractiveObjectId;
  label: string;
  metaphor: string;
  futureExperienceKind: StablesInteractiveExperienceKind;
  /** Future hook — region on room plate when interactive art ships */
  hotspotRegion?: { left: string; top: string; width: string; height: string };
  linkedExperienceIds: readonly StablesExperienceId[];
  status: "architecture-only";
};

export type StablesSaveDestination = {
  id: StablesSaveDestinationId;
  label: string;
  trademark: string;
  whenAppropriate: string;
};

export type StablesRoomState = {
  selectedExperienceId: StablesExperienceId | null;
  hoveredExperienceId: StablesExperienceId | null;
};

export type StablesDiscussMode = "reflect" | "challenge" | "apply" | "save-reflection";

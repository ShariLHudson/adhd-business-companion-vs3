/**
 * Memory Triggers — awakening memories through everyday senses.
 * @see docs/companion-homestead/MEMORY_TRIGGERS.md
 */

import type { CompanionPlaceId } from "@/lib/companionUniverse/types";
import type { CompanionRelationshipVerdict } from "@/lib/companionRelationship";
import type { WelcomeSeason, WelcomeTimeOfDay } from "@/lib/welcomeLivingRoom";

export const MEMORY_SENSES = [
  "sight",
  "sound",
  "smell",
  "touch",
  "taste",
] as const;

export type MemorySense = (typeof MEMORY_SENSES)[number];

export const MEMORY_RELATIONSHIP_LEVELS = [
  "early",
  "established",
  "any",
] as const;

export type MemoryRelationshipLevel = (typeof MEMORY_RELATIONSHIP_LEVELS)[number];

export type MemoryTriggerEntry = {
  id: string;
  name: string;
  sense: MemorySense;
  seasons: WelcomeSeason[] | "all";
  times: WelcomeTimeOfDay[] | "all";
  emotionalPurpose: string;
  relatedRoom: CompanionPlaceId | "any";
  relationshipSuitability: MemoryRelationshipLevel;
  /** Minimum days before same trigger may surface again */
  cooldownDays: number;
  authenticityNotes: string;
  /** Story-first — never "the room smells like…" */
  storyLine: string;
  /** What memory this may awaken — designer only */
  memoryAwakened: string;
};

export type MemoryTriggersInput = {
  now?: Date;
  season: WelcomeSeason;
  timeOfDay: WelcomeTimeOfDay;
  sessionVisitIndex: number;
  isFirstMeeting?: boolean;
  recoveryGentle?: boolean;
  flooded?: boolean;
  grief?: boolean;
  /** Visits with meaningful relationship — unlock established triggers */
  establishedRelationship?: boolean;
  /** Companion Relationship rhythm — adjusts frequency, not personality */
  companionRelationship?: CompanionRelationshipVerdict | null;
};

export type MemoryTriggersVerdict = {
  trigger: MemoryTriggerEntry | null;
  storyLine: string | null;
  /** At most one sensory cue per visit */
  cueCount: number;
  suppressedReason: string | null;
};
